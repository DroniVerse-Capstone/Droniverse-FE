"use client";

import Link from 'next/link';
import { useTranslations } from '@/providers/i18n-provider';
import React from 'react';

export default function ClubFooter() {
  const t = useTranslations("PublicFooter");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px] border-t border-greyscale-700">
      <div className="px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <p className="text-greyscale-100">
            © {currentYear} Droniverse System. {t("rights")}
          </p>
          <span className="hidden sm:inline text-greyscale-600">|</span>
          <Link
            href="/policies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-200 hover:underline"
          >
            {t("community.policiesTerms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}