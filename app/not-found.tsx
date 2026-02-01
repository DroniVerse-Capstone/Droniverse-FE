'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animation';

export default function NotFound() {
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
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-greyscale-300 max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <div className="flex gap-4 justify-center mt-8">
              <Link href="/">
                <Button className="bg-primary-200 hover:bg-primary-300">
                  Go Back Home
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}