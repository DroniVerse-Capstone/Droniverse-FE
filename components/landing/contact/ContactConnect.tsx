"use client";
import { GlassCard } from "@/components/ui/glass-card";
import { useTranslations } from "@/providers/i18n-provider";
import React from "react";
import { FaHandshake } from "react-icons/fa";
import { IoSchoolSharp } from "react-icons/io5";
import { MdGroupAdd } from "react-icons/md";

export default function ContactConnect() {
  const t = useTranslations("Contact.connect");

  const features = [
    {
      icon: <MdGroupAdd />,
      title: t("feature.feature1.title"),
      description: t("feature.feature1.description"),
    },
    {
      icon: <IoSchoolSharp />,
      title: t("feature.feature2.title"),
      description: t("feature.feature2.description"),
    },
    {
      icon: <FaHandshake />,
      title: t("feature.feature3.title"),
      description: t("feature.feature3.description"),
    },
  ];

  return (
    <section>
      <div className="mx-auto px-4 md:px-8 py-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold text-greyscale-0 mb-6">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <GlassCard
              variant="vertical"
              icon={feature.icon}
              key={index}
              title={feature.title}
            >
              {feature.description}
            </GlassCard>
          ))}
        </div>

        <div className="text-center mt-6">
          <a
            href="mailto:contact@droniverse.com"
            className="underline text-base text-greyscale-100"
          >
            Email: contact@droniverse.com
          </a>
        </div>
      </div>
    </section>
  );
}
