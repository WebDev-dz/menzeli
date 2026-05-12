"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AuthApi,
  AuthCompleteProfileOperationRequest,
  AuthRequestOtp200Response,
  AuthRequestOtpOperationRequest,
  AuthVerifyOtp200Response,
  AuthVerifyOtpOperationRequest,
  ProfileApi,
  UpdateProfileRequest,
  User,
} from "@/api";
import { apiConfig } from "@/lib/api-config";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from 'react';
import { SessionExpiredModal } from "@/components/auth/SessionExpiredModal";

// Initialize AuthApi with configuration to read token from localStorage
const authApi = new AuthApi(apiConfig);
const memberApi = new ProfileApi(apiConfig);

interface AuthContextType {
  user: User | null | { phone: string };
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<AuthRequestOtp200Response>;
  verifyOtp: (phone: string, otp: string) => Promise<AuthVerifyOtp200Response>;
  token: string | null;
  updateName: (name: string) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateProfileImage: (image: Blob) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const isNotComplete = (user: User | null | { phone: string }): user is  { phone: string } => {
  if (!user) return false;
  const phone = (user as { phone?: unknown }).phone;
  const name = (user as { name?: unknown }).name;
  return typeof phone === "string" && (!name || String(name).trim().length === 0);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  });
  const [user, setUser] = useState<User | null | { phone: string }>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User | { phone: string };
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(token));
  const [isLoading] = useState(false);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [sessionExpiredRedirectTo, setSessionExpiredRedirectTo] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = useMemo(() => {
    const raw = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
    return raw || "ar";
  }, [params?.locale]);

  const getCallbackUrl = useCallback(() => {
    const qs = searchParams?.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, searchParams]);

  const expireSession = useCallback(() => {
    const callbackUrl = getCallbackUrl();
    const redirectTo = `/${locale}/auth?callback_url=${encodeURIComponent(callbackUrl)}`;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    setSessionExpiredRedirectTo(redirectTo);
    setSessionExpiredOpen(true);
  }, [getCallbackUrl, locale]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    router.push(`/${locale}/auth`);
  }, [locale, router]);

  useEffect(() => {
    if (!sessionExpiredOpen || !sessionExpiredRedirectTo) return;
    const timer = window.setTimeout(() => {
      router.push(sessionExpiredRedirectTo);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [router, sessionExpiredOpen, sessionExpiredRedirectTo]);

  

// Only run the query when there's a token
const { refetch, isLoading: queryLoading, data: userData } = useQuery({
  queryKey: ['currentUser', token],
  queryFn: async () => {
    const response = await memberApi.profileShow({
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.success) {
      expireSession();
      throw new Error('Failed to fetch user');
    }

    setUser((currentUser) => {
      const nextUser = { ...currentUser, ...response.data } as User | { phone: string };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });

    return response.data;
  },
  enabled: !!token,          // ← don't run without a token
  refetchInterval: 60000,
  retry: false,
});

  const syncUserState = useCallback((
    profile: Pick<User, "name" | "email" | "phone" | "profileImage">,
  ) => {
    setUser((currentUser) => {
      const nextUser = {...currentUser, ...profile}
      localStorage.setItem("user", JSON.stringify(nextUser));
      return nextUser as User | { phone: string };
    });
  },[]);

  useEffect(() => {
    if (user && isNotComplete(user)) {
     router.push(`/${locale}/auth`)
    }
  }, [locale, router, user]);

  // Only expire session if the user WAS logged in (had a token) and the fetch returned nothing
useEffect(() => {
  if (!token) return;        // ← not logged in, nothing to expire
  if (queryLoading) return;
  if (!userData) {
    expireSession();
  }
}, [userData, queryLoading, token, expireSession]);

  const loginMutation = useMutation({
    mutationFn: (request: AuthRequestOtpOperationRequest) =>
      authApi.authRequestOtp(request),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (request: AuthVerifyOtpOperationRequest) =>
      authApi.authVerifyOtp(request),
  });

  const updateNameMutation = useMutation({
    mutationFn: (request: AuthCompleteProfileOperationRequest) =>
      authApi.authCompleteProfile (request, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (request: UpdateProfileRequest) => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      return memberApi.profileUpdate(
        { updateProfileRequest: request },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
    },
  });

  const updateProfileImageMutation = useMutation({
    mutationFn: (profileImage: Blob) => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      return memberApi.profileUpdateImage(
        { profileImage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
  });

  const login = async (phone: string) => {
    try {
      return await loginMutation.mutateAsync({ "authRequestOtpRequest": { "phone": phone } });  
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const verifyOtp = async (phone: string, otpCode: string) => {
    try {
      const response = await verifyOtpMutation.mutateAsync({
        "authVerifyOtpRequest": {
          phone,
          otpCode,
        }
      });

      if (response?.data?.token) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setIsAuthenticated(true);
        if (response.data.fillName) {
          refetch()
         router.push("/");
        } else {
        const partialUser = { phone };
        setUser(partialUser);
        localStorage.setItem("user", JSON.stringify(partialUser));
        }
        
      }
      return response;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  };

  const updateName = async (name: string) => {
    try {
      const response = await updateNameMutation.mutateAsync({ 
        "authCompleteProfileRequest": {
          name,
        }
       });
      
      if (response.data?.user) {
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        router.push("/");
      }
      // return response
    } catch (error) {
      console.error("Update name failed:", error);
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const response = await updateProfileMutation.mutateAsync(data);

      if (response.data) {
        syncUserState({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          profileImage: response.data.profileImage,
        });
      }
    } catch (error) {
      console.error("Update profile failed:", error);
      throw error;
    }
  };

  const updateProfileImage = async (image: Blob) => {
    try {
      const response = await updateProfileImageMutation.mutateAsync(image);

      if (response.data) {
        syncUserState({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          profileImage: response.data.profileImage,
        });
      }
    } catch (error) {
      console.error("Update profile image failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        isLoading,
        login,
        verifyOtp,
        updateName,
        updateProfile,
        updateProfileImage,
        logout,
      }}
    >
      {children}
      <SessionExpiredModal
        open={sessionExpiredOpen}
        onLogin={() => {
          if (sessionExpiredRedirectTo) router.push(sessionExpiredRedirectTo);
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
