"use client";

import { useTranslations } from '@/providers/i18n-provider';
import React from 'react';

export default function ClubFooter() {
  const t = useTranslations("PublicFooter");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px] border-t border-greyscale-700">
      <div className="px-4 md:px-6 py-4">
        <p className="text-center text-sm text-greyscale-100">
          © {currentYear} Droniverse System. {t("rights")}
        </p>
      </div>
    </footer>
  );
}