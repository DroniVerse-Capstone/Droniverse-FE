import { ScrollTrigger } from '@/components/animation';
import PublicFooter from '@/components/layouts/PublicFooter';
import PublicHeader from '@/components/layouts/PublicHeader';
import React from 'react'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-greyscale-800 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[100px_100px]'> 
      <PublicHeader />
      
      <main>{children}</main>
      
      <ScrollTrigger animation="slideUp" duration={0.8}>
        <PublicFooter />
      </ScrollTrigger>
    </div>
  );
}