"use client";
import AuthForm from "@/components/auth/AuthForm";
import LoginBanner from "@/components/auth/LoginBanner";
import React from "react";


export default function RegisterPage() {
  return (
    <div className="grid grid-cols-12 h-screen overflow-hidden">
      <LoginBanner />
      <AuthForm mode="register" />
    </div>
  );
}
