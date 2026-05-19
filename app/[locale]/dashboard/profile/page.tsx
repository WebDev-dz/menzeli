"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  Pencil, 
  Loader2,
} from "lucide-react";
import { API_URL } from "@/lib/api-config";
import { toast } from "sonner";
import {
  useRequestResetPasswordOtp,
  useStoreNewPassword,
  useVerifyResetPasswordOtp,
} from "@/hooks/use-reset-password";

export default function ProfilePage() {
  const { user, updateProfile, updateProfileImage } = useAuth();
  const { t } = useTranslation("dashboard");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resetOtpRequested, setResetOtpRequested] = useState(false);
  const [resetOtpCode, setResetOtpCode] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const requestResetOtp = useRequestResetPasswordOtp();
  const verifyResetOtp = useVerifyResetPasswordOtp();
  const storeNewPasswordMutation = useStoreNewPassword();

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      if ('name' in user) setName(user.name || "");
      if ('email' in user) setEmail(user.email || "");
      setPhone(user.phone || "");
      setImagePreview(null);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const profileImageSrc = useMemo(() => {
    if (imagePreview) return imagePreview;
    if (user && "profileImage" in user && user.profileImage) {
      if (user.profileImage.startsWith("http")) return user.profileImage;
      return `${user.profileImage}`;
    }
    return undefined;
  }, [imagePreview, user]);

  const resetForm = () => {
    if (!user) return;
    if ("name" in user) setName(user.name || "");
    if ("email" in user) setEmail(user.email || "");
    setPhone(user.phone || "");
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      await updateProfile({
        name: name.trim(),
        email: email.trim() || null,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextPreview = URL.createObjectURL(file);
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(nextPreview);

    try {
      setIsUploadingImage(true);
      await updateProfileImage(file);
      toast.success("Profile image updated successfully");
    } catch (error) {
      URL.revokeObjectURL(nextPreview);
      setImagePreview(null);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile image",
      );
    } finally {
      event.target.value = "";
      setIsUploadingImage(false);
    }
  };

  const resetPasswordFlow = () => {
    setResetOtpRequested(false);
    setResetOtpCode("");
    setResetToken(null);
    setNewPassword("");
    setNewPasswordConfirmation("");
    setDevOtpCode(null);

    requestResetOtp.reset();
    verifyResetOtp.reset();
    storeNewPasswordMutation.reset();
  };

  const handleRequestResetOtp = async () => {
    if (!phone.trim()) return;
    try {
      const response = await requestResetOtp.mutateAsync({ phone: phone.trim() });
      setResetOtpRequested(true);
      setDevOtpCode(response.data?.otpCode ?? null);
      toast.success("OTP sent to your phone");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to request OTP");
    }
  };

  const handleVerifyResetOtp = async () => {
    if (!phone.trim() || !resetOtpCode.trim()) return;
    try {
      const response = await verifyResetOtp.mutateAsync({
        phone: phone.trim(),
        otp_code: resetOtpCode.trim(),
      });
      setResetToken(response.data.resetToken);
      toast.success("OTP verified");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify OTP");
    }
  };

  const handleStoreNewPassword = async () => {
    if (!resetToken) return;
    try {
      await storeNewPasswordMutation.mutateAsync({
        reset_token: resetToken,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      toast.success("Password updated successfully");
      resetPasswordFlow();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("profile_page.title")}</h1>
        <p className="text-muted-foreground">
          {t("profile_page.subtitle")}
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile_page.personal_info.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                <AvatarImage src={profileImageSrc} alt={name} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {getInitials(name || "User")}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold">{name || "User"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("profile_page.personal_info.member_since", { 
                  date: user && 'createdAt' in user && user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString() 
                    : "Jan 15, 2023" 
                })}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                <Button
                  variant="default"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    t("profile_page.personal_info.change_photo")
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="text-destructive hover:text-destructive"
                  onClick={resetForm}
                  disabled={isSavingProfile || isUploadingImage}
                >
                  {t("profile_page.personal_info.remove")}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("profile_page.personal_info.full_name")}</Label>
              <Input 
                id="fullName" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe" 
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile_page.personal_info.email")}</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="john.doe@example.com"
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Check className="h-3 w-3" />
                  {t("profile_page.personal_info.verified")}
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t("profile_page.personal_info.phone")}</Label>
              <div className="relative">
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+1 (555) 000-1234"
                  className="pr-20"
                  disabled
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Check className="h-3 w-3" />
                  {t("profile_page.personal_info.verified")}
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-2">
              <Label>{t("profile_page.personal_info.account_status")}</Label>
              <div className="flex items-center gap-2 rounded-md border bg-zinc-50 px-3 py-2 text-sm text-zinc-900">
                <div className={`h-2 w-2 rounded-full ${user && 'isActive' in user && user.isActive ? "bg-green-500" : "bg-red-500"}`} />
                {user && 'isActive' in user && user.isActive 
                  ? t("profile_page.personal_info.active")
                  : t("profile_page.personal_info.inactive")
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile_page.security.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 2FA */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">{t("profile_page.security.otp.title")}</div>
              <div className="text-sm text-muted-foreground">
                {t("profile_page.security.otp.description")}
              </div>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={setTwoFactorEnabled} 
            />
          </div>

          <Separator />

          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="font-medium">Reset Password</div>
              <div className="text-sm text-muted-foreground">
                Verify OTP, then set a new password.
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reset-phone">Phone</Label>
                <Input id="reset-phone" value={phone} disabled />
              </div>

              <div className="flex items-end gap-3">
                <Button
                  type="button"
                  onClick={handleRequestResetOtp}
                  disabled={!phone.trim() || requestResetOtp.isPending}
                  className="w-full"
                >
                  {requestResetOtp.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-otp">OTP Code</Label>
                <Input
                  id="reset-otp"
                  value={resetOtpCode}
                  onChange={(e) => setResetOtpCode(e.target.value)}
                  placeholder="1234"
                  inputMode="numeric"
                  disabled={!resetOtpRequested || verifyResetOtp.isPending || !!resetToken}
                />
              </div>

              <div className="flex items-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerifyResetOtp}
                  disabled={
                    !resetOtpRequested ||
                    !resetOtpCode.trim() ||
                    verifyResetOtp.isPending ||
                    !!resetToken
                  }
                  className="w-full"
                >
                  {verifyResetOtp.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : resetToken ? (
                    "Verified"
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </div>

              {devOtpCode ? (
                <div className="md:col-span-2 text-sm text-muted-foreground">
                  OTP: <span className="font-mono">{devOtpCode}</span>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  disabled={!resetToken || storeNewPasswordMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password-confirmation">Confirm Password</Label>
                <Input
                  id="new-password-confirmation"
                  type="password"
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  placeholder="********"
                  disabled={!resetToken || storeNewPasswordMutation.isPending}
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetPasswordFlow}
                  disabled={storeNewPasswordMutation.isPending}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={handleStoreNewPassword}
                  disabled={
                    !resetToken ||
                    !newPassword ||
                    newPassword !== newPasswordConfirmation ||
                    storeNewPasswordMutation.isPending
                  }
                >
                  {storeNewPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile_page.overview.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-zinc-50 p-4 border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {t("profile_page.overview.user_id")}
              </p>
              <p className="font-mono text-sm font-semibold text-blue-600">#MZL-{user && 'id' in user ? user.id : "8829"}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {t("profile_page.overview.joined_date")}
              </p>
              <p className="text-sm font-semibold">{user && 'createdAt' in user && user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "15 Jan 2023"}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {t("profile_page.overview.last_login")}
              </p>
              <p className="text-sm font-semibold">{user && 'lastLoginAt' in user && user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Today, 09:42 AM"}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {t("profile_page.overview.user_role")}
              </p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                {user && 'isAdmin' in user && user.isAdmin 
                  ? t("profile_page.overview.admin")
                  : t("profile_page.overview.user")
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <Button
          variant="ghost"
          type="button"
          onClick={resetForm}
          disabled={isSavingProfile || isUploadingImage}
        >
          {t("profile_page.actions.cancel")}
        </Button>
        <Button
          type="button"
          onClick={handleSaveProfile}
          disabled={isSavingProfile || isUploadingImage || !name.trim()}
        >
          {isSavingProfile ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            t("profile_page.actions.save")
          )}
        </Button>
      </div>
    </div>
  );
}
