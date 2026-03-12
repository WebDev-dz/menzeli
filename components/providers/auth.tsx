"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthApi, AuthCompleteProfileOperationRequest, AuthRequestOtp200Response, AuthRequestOtpOperationRequest, AuthVerifyOtp200Response, AuthVerifyOtpOperationRequest, User, UserFromJSON } from "@/api/generated-client";
import { apiConfig, API_URL } from "@/lib/api-config";

import { useMutation, useQuery } from "@tanstack/react-query";

// Initialize AuthApi with configuration to read token from localStorage
const authApi = new AuthApi(apiConfig);



interface AuthContextType {
  user: User | null | { phone: string };
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<AuthRequestOtp200Response>;
  verifyOtp: (phone: string, otp: string) => Promise<AuthVerifyOtp200Response>;
  token: string | null;
  updateName: (name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const isNotComplete = (user: User | null | { phone: string }): user is  { phone: string } => {
  // @ts-ignore
  return user?.phone && !user?.name ;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | { phone: string }>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/auth");
  };

  const { data: userData, isError , refetch} = useQuery({
    queryKey: ['currentUser', token],
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      return response.json();
    },
    enabled: !!token && isAuthenticated,
    refetchInterval: 60000,
    retry: false,
    staleTime: 60000,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token) {
      setIsAuthenticated(true);
      setToken(token);
      if (storedUser) {
        try {
        console.log({storedUser})
          setUser(UserFromJSON(JSON.parse(storedUser)));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user && isNotComplete(user)) {
     router.push("/auth")
    }
  }, [user]);

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
        logout,
      }}
    >
      {children}
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