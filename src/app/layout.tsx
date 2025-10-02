import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { CategoryProvider } from "@/contexts/CategoryContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calendrier de Productivité",
  description: "Application de gestion du temps et de planification des tâches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider>
          <CategoryProvider>
            <div className="flex h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1 lg:ml-0 overflow-auto">
                {children}
              </main>
            </div>
          </CategoryProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
