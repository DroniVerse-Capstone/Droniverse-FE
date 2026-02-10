import HomeCommunity from '@/components/landing/home/HomeCommunity'
import HomeConnect from '@/components/landing/home/HomeConnect'
import HomeHero from '@/components/landing/home/HomeHero'
import HomeLab3D from '@/components/landing/home/HomeLab3D'
import { ScrollTrigger } from '@/components/animation/ScrollTrigger'
import React from 'react'

export default function HomePage() {
  return (
    <div className='overflow-hidden'>
      <ScrollTrigger animation="fade" duration={1}>
        <HomeHero />
      </ScrollTrigger>
      
      <ScrollTrigger animation="slideLeft" duration={0.8}>
        <HomeCommunity />
      </ScrollTrigger>
      
      <ScrollTrigger animation="slideRight" duration={0.8}>
        <HomeLab3D />
      </ScrollTrigger>
      
      <ScrollTrigger animation="fade" duration={0.8}>
        <HomeConnect />
      </ScrollTrigger>
    </div>
  )
}