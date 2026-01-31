import { LanguageSwitcher } from "@/components/layouts/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "@/providers/i18n-provider";
import { SlideIn, StaggerContainer } from "@/components/animation";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("Auth.authForm");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ email, password, name, confirmPassword });
  };

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

      {/* Form Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <StaggerContainer stagger={0.2} from="bottom" delay={0.5} distance={60}  className="w-full max-w-xs space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-greyscale-0">
              {isLogin ? t("login") : t("register")}
            </h1>
            <p className="text-greyscale-300">
              {isLogin
                ? t("loginSub")
                : t("registerSub")}
            </p>
          </div>

          {/* Social Login Buttons */}
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

          {/* Divider */}
          <div className="relative">
            <Separator className="border-greyscale-25 border" />
            <div className="absolute inset-0 flex justify-center items-center">
              <span className="bg-greyscale-800 px-2 text-xs text-greyscale-25 uppercase">
                {t("or")}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-greyscale-0">
                  {t("name")}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-greyscale-25 text-greyscale-0 mt-2"
                  required
                />
              </div>
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

            {!isLogin && (
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
                  className="bg-transparent border-greyscale-25 text-greyscale-0 mt-2 mb-4"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-[12px] text-secondary-200 hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary-200 hover:bg-primary-300"
            >
              {isLogin ? t("login") : t("register")}
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
