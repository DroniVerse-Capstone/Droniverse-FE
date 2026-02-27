"use client";

import { useTranslations } from "@/providers/i18n-provider";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaDiscord, FaFacebook } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";


export default function PublicFooter() {
  const t = useTranslations("PublicFooter");
  return (
    <footer className="bg-greyscale-900 text-greyscale-100">
      <div className="mx-auto px-4 md:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <Image
                src="/images/Logo-NoBg.png"
                alt="Droniverse Logo"
                width={160}
                height={160}
              />
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-semibold text-greyscale-0">
                  Droniverse
                </h3>
                <p className="text-md">
                  {t("description")}
                </p>
                <p className="text-md">
                  Email:{" "}
                  <a
                    href="mailto:contact@droniverse.com"
                    className="hover:text-primary-300 transition-colors"
                  >
                    contact@droniverse.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Liên kết */}
          <div className="md:col-span-2">
            <h4 className="text-greyscale-0 text-2xl font-semibold mb-4">{t("links.title")}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-md hover:text-primary-300 transition-colors"
                >
                  {t("links.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-md hover:text-primary-300 transition-colors"
                >
                  {t("links.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/sandbox"
                  className="text-md hover:text-primary-300 transition-colors"
                >
                  {t("links.sandbox")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-md hover:text-primary-300 transition-colors"
                >
                  {t("links.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cộng đồng */}
          <div className="md:col-span-3">
            <h4 className="text-greyscale-0 text-2xl font-semibold mb-4">{t("community.title")}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/login"
                  className="text-md hover:text-primary-300 transition-colors"
                >
                  {t("community.join")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-md hover:text-primary-300 transition-colors"
                >
                  {t("community.ask")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-md hover:text-primary-300 transition-colors"
                >
                  {t("community.instruction")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-md hover:text-primary-300 transition-colors"
                >
                  {t("community.support")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Kết nối */}
          <div className="md:col-span-2">
            <h4 className="text-greyscale-0 text-2xl font-semibold mb-4">{t("connect")}</h4>
            <div className="flex gap-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                aria-label="Instagram"
              >
                <RiInstagramFill size={24} />
              </Link>
              <Link
                href="https://discord.com"
                target="_blank"
                aria-label="Discord"
              >
                <FaDiscord size={24} />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-greyscale-700 text-center">
          <p className="text-sm">
            © 2026 Droniverse System. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
