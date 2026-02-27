import { FadeIn } from "@/components/animation/FadeIn";
import { ScrollTrigger } from "@/components/animation/ScrollTrigger";
import ContactConnect from "@/components/landing/contact/ContactConnect";
import ContactHero from "@/components/landing/contact/ContactHero";
import ContactLink from "@/components/landing/contact/ContactLink";
import React from "react";

export default function ContactPage() {
  return (
    <div className="overflow-hidden">
      <FadeIn from="bottom" duration={0.8} delay={0.2}>
        <ContactHero />
      </FadeIn>

      <ScrollTrigger animation="slideUp" duration={0.8}>
        <ContactLink />
      </ScrollTrigger>
      
      <ScrollTrigger animation="slideUp" duration={0.8}>
        <ContactConnect />
      </ScrollTrigger>
    </div>
  );
}
