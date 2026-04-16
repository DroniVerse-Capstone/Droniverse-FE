"use client";
import AuthForm from "@/components/auth/AuthForm";
import LoginBanner from "@/components/auth/LoginBanner";
import React from "react";

export default function LoginPage() {
  return (
    <div className="grid grid-cols-12 gap-0 h-screen overflow-hidden">
      <LoginBanner />
      <AuthForm mode="login"/>
    </div>
  );
}
