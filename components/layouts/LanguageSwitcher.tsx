"use client";

import { setCookie } from "cookies-next";
import { useLocale, useChangeLocale } from "@/providers/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const changeLocale = useChangeLocale();

  const changeLang = async (lang: "vi" | "en") => {
    setCookie("locale", lang);
    await changeLocale(lang);
  };

  const languages = [
    { code: "vi", name: "Tiếng Việt", flag: "/images/vi_flag.png" },
    { code: "en", name: "English", flag: "/images/en_flag.png" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full p-0 w-10 h-10 border-none overflow-hidden">
          {currentLanguage && (
            <div
              className="w-full h-full rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${currentLanguage.flag})` }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLang(lang.code as "vi" | "en")}
            className={`cursor-pointer ${
              currentLocale === lang.code ? "bg-greyscale-700" : ""
            }`}
          >
            <div
              className="w-10 h-10 mr-2 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${lang.flag})` }}
            />
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
