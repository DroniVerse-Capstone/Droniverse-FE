"use client";
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/providers/i18n-provider';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function HomeConnect() {
  const router = useRouter();
  const t = useTranslations("Home.connect");
  return (
    <section>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Content */}
        <div className="flex flex-col gap-6 justify-center items-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-greyscale-0 max-w-3xl">
            {t("title")}
          </h1>
          <p className="text-base md:text-lg text-greyscale-100 max-w-2xl">
            {t("description")}
          </p>

          <div className="mt-4">
            <Button
              variant={"secondary"}
              onClick={() => router.push("/contact")}
              size="lg"
            >
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
