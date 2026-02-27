"use client";
import { useTranslations } from '@/providers/i18n-provider';
import React from 'react'
import ValueCard from '@/components/ui/value-card';
import { IoPeople } from 'react-icons/io5';
import { RiBook2Fill } from 'react-icons/ri';
import { BiCodeBlock } from "react-icons/bi";

export default function AboutValue() {
  const t = useTranslations("About.value");

  const features = [
    {
      icon: <IoPeople />,
      title: t("feature1.title"),
      description: t("feature1.description"),
    },
    {
      icon: <RiBook2Fill />,
      title: t("feature2.title"),
      description: t("feature2.description"),
    },
    {
      icon: <BiCodeBlock />,
      title: t("feature3.title"),
      description: t("feature3.description"),
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
            <ValueCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
