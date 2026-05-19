"use client";

import { useMutation } from "@tanstack/react-query";
import {
  AuthVerifyOtpRequest,
  PasswordResetApi,
  PasswordResetRequestResetOtp200Response,
  PasswordResetRequestResetOtpRequest,
  PasswordResetRequestResetOtp403Response,
  PasswordResetStoreNewPasswordRequest,
  PasswordResetVerifyReset200Response,
} from "@/api";
import { apiConfig } from "@/lib/api-config";

const passwordResetApi = new PasswordResetApi(apiConfig);

export function useRequestResetPasswordOtp() {
  return useMutation<
    PasswordResetRequestResetOtp200Response,
    unknown,
    PasswordResetRequestResetOtpRequest
  >({
    mutationFn: async (payload) => {
      return await passwordResetApi.passwordResetRequestResetOtp({
        passwordResetRequestResetOtpRequest: payload,
      });
    },
  });
}

export type VerifyResetPasswordOtpPayload = {
  phone: string;
  otp_code: string;
};

export function useVerifyResetPasswordOtp() {
  return useMutation<
    PasswordResetVerifyReset200Response,
    unknown,
    VerifyResetPasswordOtpPayload
  >({
    mutationFn: async ({ phone, otp_code }) => {
      const authVerifyOtpRequest: AuthVerifyOtpRequest = {
        phone,
        otpCode: otp_code,
      };

      return await passwordResetApi.passwordResetVerifyReset({
        authVerifyOtpRequest,
      });
    },
  });
}

export type StoreNewPasswordPayload = {
  reset_token: string;
  password: string;
  password_confirmation: string;
};

export function useStoreNewPassword() {
  return useMutation<
    PasswordResetRequestResetOtp403Response,
    unknown,
    StoreNewPasswordPayload
  >({
    mutationFn: async ({ reset_token, password, password_confirmation }) => {
      const passwordResetStoreNewPasswordRequest: PasswordResetStoreNewPasswordRequest =
        {
          password,
          passwordConfirmation: password_confirmation,
        };

      return await passwordResetApi.passwordResetStoreNewPassword(
        { passwordResetStoreNewPasswordRequest },
        {
          headers: {
            Authorization: `Bearer ${reset_token}`,
          },
        },
      );
    },
  });
}
