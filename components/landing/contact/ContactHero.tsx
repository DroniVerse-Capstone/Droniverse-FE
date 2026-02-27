"use client";
import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import React from "react";

export default function ContactHero() {
  const t = useTranslations("Contact.hero");

  return (
    <section className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center py-20 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/contact.jpg"
          fill
          className="object-cover opacity-40"
          alt="Contact background"
          priority
        />
      </div>

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-greyscale-950/60 via-greyscale-900/70 to-greyscale-950/80 z-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto px-4 md:px-8 text-center space-y-6 md:space-y-8">
        {/* Drone Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/Logo-NoBg.png"
            width={100}
            height={100}
            alt="Drone Icon"
            className="animate-pulse"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-5xl font-semibold text-greyscale-0 leading-tight">
          {t("title")}
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-greyscale-100 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>
    </section>
  );
}
