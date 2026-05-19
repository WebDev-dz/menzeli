"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { isNotComplete, useAuth } from "@/components/providers/auth";
import { ConfigSite } from "@/lib/conf";

type PasswordLoginValues = {
  login: string;
  password: string;
};

function PasswordLoginInner() {
  const { loginWithPassword, updateName, user } = useAuth();
  const { t } = useTranslation("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback_url");

  const [step, setStep] = useState<1 | 3>(1);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordLoginSchema = useMemo(
    () =>
      z.object({
        login: z.string().min(1, t("password.validation_login")),
        password: z.string().min(1, t("password.validation_password")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    mode: "onBlur",
  });

  const isSubmittingAny = useMemo(
    () => loading || isSubmitting,
    [loading, isSubmitting],
  );

  useEffect(() => {
    if (!user) return;
    if (isNotComplete(user)) {
      setStep(3);
      return;
    }
    router.push(callbackUrl || "/");
  }, [callbackUrl, router, user]);

  const handlePasswordLogin = handleSubmit(async (values) => {
    setLoading(true);
    setError("");
    try {
      const response = await loginWithPassword(values.login, values.password);
      if (!response?.data?.fillName) {
        setStep(3);
        return;
      }
      router.push(callbackUrl || "/");
    } catch (err) {
      setError(
        err instanceof Error && err.message ? err.message : t("password.error_login"),
      );
    } finally {
      setLoading(false);
    }
  });

  const handleUpdateName = async () => {
    if (name.trim().length < 2) return;
    setLoading(true);
    setError("");
    try {
      await updateName(name.trim());
    } catch (err) {
      setError(
        err instanceof Error && err.message ? err.message : t("step3.error_update"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-8 sm:p-12 z-10">
          {step === 1 ? (
            <div className="flex flex-col items-center">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Image
                  src="/images/mmb9j5lh-777z4l5.svg"
                  alt="Login"
                  width={26}
                  height={23}
                />
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
                {t("password.title", { siteName: ConfigSite.siteName })}
              </h1>
              <p className="text-slate-500 text-center mb-10">
                {t("password.subtitle")}
              </p>

              {error && (
                <div className="mb-4 w-full rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 text-center">
                  {error}
                </div>
              )}

              <form
                onSubmit={handlePasswordLogin}
                className="w-full space-y-4"
                noValidate
              >
                <div>
                  <label
                    htmlFor="login"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    {t("password.login_label")}
                  </label>
                  <input
                    id="login"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    placeholder={t("password.login_placeholder")}
                    {...register("login")}
                    aria-invalid={!!errors.login}
                    className={`w-full rounded-lg border px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                      errors.login
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {errors.login && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <span aria-hidden>⚠</span>
                      {errors.login.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    {t("password.password_label")}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={t("password.password_placeholder")}
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    className={`w-full rounded-lg border px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                      errors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <span aria-hidden>⚠</span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAny}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAny ? t("password.submitting") : t("password.submit_button")}
                  {!isSubmittingAny && (
                    <Image
                      className="rtl:rotate-180"
                      src="/images/mmb9j5kj-q4w834g.svg"
                      alt="Arrow"
                      width={14}
                      height={14}
                    />
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Image
                  src="/images/mmb9j5lh-777z4l5.svg"
                  alt="Profile"
                  width={26}
                  height={23}
                />
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
                {t("step3.title")}
              </h1>
              <p className="text-slate-500 text-center mb-8">
                {t("step3.subtitle")}
              </p>

              {error && (
                <div className="mb-4 w-full rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 text-center">
                  {error}
                </div>
              )}

              <div className="w-full space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t("step3.name_label")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("step3.name_placeholder")}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleUpdateName}
                  disabled={loading || name.trim().length < 2}
                  className="w-full rounded-xl bg-blue-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t("step3.submitting") : t("step3.submit_button")}
                </button>
              </div>
            </div>
          )}
        </div>
  );
}

export default function PasswordLogin() {
  return (
    <Suspense fallback={null}>
      <PasswordLoginInner />
    </Suspense>
  );
}
