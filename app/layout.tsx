import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Not Asistan | Randevu, Not ve Takip Platformu",
  description: "Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası ve takip platformu."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
