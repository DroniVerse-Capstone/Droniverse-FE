import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import {
  FadeIn,
  StaggerContainer,
  FloatingElement,
} from "@/components/animation";

export default function LoginBanner() {
  const t = useTranslations("Auth.loginBanner");
  return (
    <div className="hidden lg:col-span-5 lg:flex items-center justify-center relative overflow-hidden bg-greyscale-900">
      {/* Background Drone Graphic Effect */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-primary-200 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-secondary-200 rounded-full blur-[80px]"></div>
      <FadeIn from="center" duration={1.2} delay={0.3} className="absolute">
        <Image
          className="opacity-10 object-cover"
          src="/images/Logo-NoBg.png"
          alt="Drone Background"
          width={582}
          height={582}
        />
      </FadeIn>

      <div className="z-10 px-12 max-w-xl">
        <StaggerContainer stagger={0.2} from="left" delay={0.5} distance={60}>
          <h1 className="text-5xl font-medium text-greyscale-0 mb-6">
            {t("welcome")}
            <br />
            {t("to")}{" "}
            <span className="text-primary-200 text-[56px]">Droniverse</span>
          </h1>

          <p className="text-3xl text-secondary-0 mb-6 font-medium">
            &quot;{t("slogan1")}{" "}
            <span className="text-secondary-200">{t("slogan2")}</span>&quot;
          </p>

          <p className="text-greyscale-200 text-base font-medium leading-relaxed">
            {t("description")}
          </p>
        </StaggerContainer>
      </div>
    </div>
  );
}
