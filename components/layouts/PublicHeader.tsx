"use client";

import { LanguageSwitcher } from "@/components/layouts/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { labelKey: "home", href: "/" },
  { labelKey: "about", href: "/about" },
  { labelKey: "sandbox", href: "/sandbox" },
  { labelKey: "contact", href: "/contact" },
  { labelKey: "map-editor", href: "/map-editor" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("PublicHeader");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isMenuOpen]);


  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`sticky top-0 z-50 h-24 w-full flex items-center justify-between px-4 md:px-8 py-2 transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-greyscale-900/60 backdrop-blur-md shadow-lg border-greyscale-700/50" 
          : "bg-transparent border-transparent"
      }`}
    >
      <Link href="/" className="transition-transform hover:scale-105">
        <Image src="/images/Logo-NoBg.png" alt="logo" width={80} height={80} />
      </Link>
      
      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex flex-col gap-1.5 z-70 relative"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`w-6 h-0.5 bg-greyscale-0 transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`w-6 h-0.5 bg-greyscale-0 transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
        <span className={`w-6 h-0.5 bg-greyscale-0 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center gap-6">
        <ul className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="group">
                <Link
                  href={item.href}
                  className={`text-base font-medium pb-2 relative inline-block transition-colors duration-300 ${
                    isActive
                      ? "text-greyscale-0"
                      : "text-greyscale-50 group-hover:text-greyscale-0"
                  }`}
                >
                  {t(item.labelKey)}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-primary-300 transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <LanguageSwitcher />

        <Button onClick={() => router.push('/auth/login')}>
          {t("login")}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed inset-0 bg-greyscale-900 z-[60] touch-none overflow-hidden"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8">
              <ul className="flex flex-col items-center gap-6">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`text-2xl font-medium pb-2 relative inline-block transition-colors duration-300 ${
                          isActive
                            ? "text-greyscale-0"
                            : "text-greyscale-50 hover:text-greyscale-0"
                        }`}
                      >
                        {t(item.labelKey)}
                        <span
                          className={`absolute bottom-0 left-0 h-0.5 bg-primary-300 transition-all duration-300 ${
                            isActive ? "w-full" : "w-0"
                          }`}
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
              >
                <LanguageSwitcher />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
              >
                <Button onClick={() => {
                  router.push('/auth/login');
                  setIsMenuOpen(false);
                }}>
                  {t("login")}
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}