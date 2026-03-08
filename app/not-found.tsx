'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animation';
import { useTranslations } from '@/providers/i18n-provider';
import { RiArrowGoBackFill } from 'react-icons/ri';

export default function NotFound() {
  const t = useTranslations("ErrorPage");
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-greyscale-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <FadeIn from="top" duration={0.8}>
          <div className="mb-8">
            <DotLottieReact
              src="/animations/404.lottie"
              loop
              autoplay
              className="w-full mx-auto"
            />
          </div>
        </FadeIn>

        <FadeIn from="bottom" duration={0.8} delay={0.3}>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-greyscale-100">
              {t("title")}
            </h2>
            <p className="text-lg text-greyscale-300 max-w-md mx-auto">
              {t("description")}
            </p>

            <div className="flex gap-4 justify-center mt-8">
              <Button
                className="bg-primary-200 hover:bg-primary-300"
                onClick={handleBack}
                icon={<RiArrowGoBackFill />}
              >
                {t("cta")}
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}