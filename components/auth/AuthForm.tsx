import { LanguageSwitcher } from "@/components/layouts/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "@/providers/i18n-provider";
import { SlideIn, StaggerContainer } from "@/components/animation";
import CommonDropdown from "@/components/common/CommonDropdown";
import { useLogin, useRegister } from "@/hooks/auth/useAuth";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { z } from "zod";

interface AuthFormProps {
  mode: "login" | "register";
}

type Role = "CLUB_MEMBER" | "CLUB_MANAGER";

const createLoginFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().trim().email({ message: t("validation.emailInvalid") }),
    password: z.string().min(6, { message: t("validation.passwordMin") })
  });

const createRegisterFormSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z.string().trim().email({ message: t("validation.emailInvalid") }),
      password: z.string().min(6, { message: t("validation.passwordMin") }),
      confirmPassword: z
        .string()
        .min(6, { message: t("validation.confirmPasswordMin") }),
      firstName: z
        .string()
        .trim()
        .min(1, { message: t("validation.firstNameRequired") }),
      lastName: z
        .string()
        .trim()
        .min(1, { message: t("validation.lastNameRequired") }),
      roleName: z.string().min(1, { message: t("validation.roleRequired") })
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("validation.confirmPasswordMismatch")
    });

export default function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("Auth.authForm");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Role>("CLUB_MEMBER");

  const isLogin = mode === "login";

  const roleOptions = [
    { value: "CLUB_MEMBER" as Role, label: t("member") },
    { value: "CLUB_MANAGER" as Role, label: t("manager") }
  ];

  const redirectTo = searchParams.get("redirect") || undefined;
  const loginFormSchema = createLoginFormSchema(t);
  const registerFormSchema = createRegisterFormSchema(t);

  const login = useLogin({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed";

      toast.error(message);
    },
    redirectTo
  });

  const register = useRegister({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Register failed";

      toast.error(message);
    }
  });

  const getValidationMessage = (error: z.ZodError) => {
    return error.issues[0]?.message || t("validation.invalidForm");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const payload = {
        email: email.trim(),
        password
      };

      const result = loginFormSchema.safeParse(payload);

      if (!result.success) {
        toast.error(getValidationMessage(result.error));
        return;
      }

      login.mutate(result.data);
      return;
    }

    const payload = {
      email: email.trim(),
      password,
      confirmPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      roleName: role
    };

    const result = registerFormSchema.safeParse(payload);

    if (!result.success) {
      toast.error(getValidationMessage(result.error));
      return;
    }

    register.mutate({
      email: result.data.email,
      password: result.data.password,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      roleName: result.data.roleName
    });
  };

  const isSubmitting = isLogin ? login.isPending : register.isPending;

  return (
    <div className="col-span-12 lg:col-span-7 bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px] flex flex-col">
      <SlideIn direction="bottom" className="flex justify-between items-center p-8">
        <Button
          icon={<IoMdArrowBack />}
          variant={"outline"}
          onClick={() => router.push("/")}
        >
          {t("home")}
        </Button>
        <LanguageSwitcher />
      </SlideIn>

      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <StaggerContainer
          stagger={0.2}
          from="bottom"
          delay={0.5}
          distance={60}
          className="w-full max-w-sm space-y-4"
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-greyscale-0">
              {isLogin ? t("login") : t("register")}
            </h1>
            <p className="text-greyscale-300">
              {isLogin ? t("loginSub") : t("registerSub")}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full gap-2 text-greyscale-900 bg-greyscale-0 hover:bg-greyscale-50"
            >
              <FcGoogle className="text-xl" />
              {t("google")}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 bg-[#1877F2] text-white hover:bg-[#166FE5]"
            >
              <FaFacebook className="text-xl" />
              {t("facebook")}
            </Button>
          </div>

          <div className="relative">
            <Separator className="border-greyscale-25 border" />
            <div className="absolute inset-0 flex justify-center items-center">
              <span className="bg-greyscale-800 px-2 text-xs text-greyscale-25 uppercase">
                {t("or")}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="lastName" className="text-greyscale-0">
                      {t("lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t("lastName")}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-transparent border-greyscale-25 text-greyscale-0 mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName" className="text-greyscale-0">
                      {t("firstName")}
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={t("firstName")}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-transparent border-greyscale-25 text-greyscale-0 mt-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <CommonDropdown
                    label={t("role")}
                    value={role}
                    onChange={(value) => setRole(value as Role)}
                    options={roleOptions}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-greyscale-0">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-greyscale-25 text-greyscale-0 mt-2"
                required
              />
            </div>

            {!isLogin ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="password" className="text-greyscale-0">
                    {t("password")}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-greyscale-25 text-greyscale-0 mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-greyscale-0">
                    {t("confirmPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t("confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-transparent border-greyscale-25 text-greyscale-0 mt-2"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="password" className="text-greyscale-0">
                  {t("password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-greyscale-25 text-greyscale-0 mt-2"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-[12px] text-secondary-200 hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary-200 hover:bg-primary-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : isLogin ? t("login") : t("register")}
            </Button>

            <div className="text-sm font-medium text-greyscale-0">
              {isLogin ? (
                <>
                  {t("noAccount")}{" "}
                  <Link
                    href="/auth/register"
                    className="text-secondary-200 font-medium hover:underline"
                  >
                    {t("createAccount")}
                  </Link>
                </>
              ) : (
                <>
                  {t("haveAccount")}{" "}
                  <Link
                    href="/auth/login"
                    className="text-secondary-200 font-semibold hover:underline"
                  >
                    {t("backToLogin")}
                  </Link>
                </>
              )}
            </div>
          </form>
        </StaggerContainer>
      </div>
    </div>
  );
}
