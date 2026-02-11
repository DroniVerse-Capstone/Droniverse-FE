"use client";
import ValueCard from '@/components/ui/value-card';
import { useTranslations } from '@/providers/i18n-provider';
import React from 'react'
import { FaDiscord, FaFacebook, FaPhoneVolume } from 'react-icons/fa';
import { IoMdMailUnread } from 'react-icons/io';

export default function ContactLink() {
   const t = useTranslations("Contact.link");
  
    const features = [
      {
        icon: <IoMdMailUnread />,
        title: t("feature.feature1"),
        link: "Email: contact@droniverse.com",
        url: "mailto:contact@droniverse.com",
      },
      {
        icon: <FaFacebook />,
        title: t("feature.feature2"),
        link: "View On Facebook",
        url: "https://www.facebook.com",
      },
      {
        icon: <FaDiscord />,
        title: t("feature.feature3"),
        link: "View On Discord",
        url: "https://www.discord.com",
      },
      {
        icon: <FaPhoneVolume />,
        title: t("feature.feature4"),
        link: "+84 908 454 45",
        url: "tel:+8490845445",
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
  
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <ValueCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                link={feature.link}
                url={feature.url}
              />
            ))}
          </div>
        </div>
      </section>
    );
}
