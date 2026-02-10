"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/providers/i18n-provider'

export default function HomeHero() {
  const router = useRouter();
  const t = useTranslations("Home.hero");
  return (
    <section className="min-h-[500px] md:min-h-[600px] py-12 md:py-16">
      <div className="mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-greyscale-0 leading-tight">
              {t("title")}
            </h1>
            <p className="text-lg md:text-lg text-greyscale-100 leading-relaxed">
              {t("description")}
            </p>
            <div className="pt-2">
              <Button 
                onClick={() => router.push('/auth/login')}
                size="lg"
                className="w-full sm:w-auto"
              >
                {t("cta")}
              </Button>
            </div>
          </div>

          {/* Right Animation */}
          <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center">
            <DotLottieReact
              src="/animations/tech.lottie"
              loop
              autoplay
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}