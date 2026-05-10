import type { Metadata, Viewport } from "next";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Not Asistan | Randevu, Not ve Takip Platformu",
  description: "Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası ve takip platformu.",
  applicationName: "Not Asistan",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Not Asistan",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#061b4f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        {children}
        <PwaInstallBanner />
      </body>
    </html>
  );
}
