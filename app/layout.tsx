import "./globals.css";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { AppProvider } from "@/providers/app-provider";

import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Droniverse",
  description: "Nền tảng kết nối cộng đồng drone, học tập qua khóa học và lab mô phỏng 3D.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/images/Logo.png",
  },
};

const geistSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "vi";

  return (
    <html>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider initialLocale={locale}>{children}</AppProvider>
      </body>
    </html>
  );
}
