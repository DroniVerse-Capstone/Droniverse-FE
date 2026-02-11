import { FadeIn } from '@/components/animation/FadeIn'
import { ScrollTrigger } from '@/components/animation/ScrollTrigger'
import AboutHero from '@/components/landing/about/AboutHero'
import AboutMission from '@/components/landing/about/AboutMission'
import AboutTeam from '@/components/landing/about/AboutTeam'
import AboutValue from '@/components/landing/about/AboutValue'
import React from 'react'

export default function AboutPage() {
  return (
    <div className='overflow-hidden'>
      <FadeIn from="bottom" duration={0.8} delay={0.2}>
        <AboutHero />
      </FadeIn>
      <ScrollTrigger animation="slideLeft" duration={0.8}>
        <AboutValue />
      </ScrollTrigger>
      
      <ScrollTrigger animation="slideRight" duration={0.8}>
        <AboutMission />
      </ScrollTrigger>
      
      <ScrollTrigger animation="slideUp" duration={0.8}>
        <AboutTeam />
      </ScrollTrigger>
    </div>
  )
}
