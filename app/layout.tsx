import "./globals.css";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { AppProvider } from "@/providers/app-provider";

export const metadata: Metadata = {
  title: "Droniverse",
  description: "Mô phỏng drone 3D và học lập trình điều khiển bằng Blockly",
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
  return (
    <html>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
