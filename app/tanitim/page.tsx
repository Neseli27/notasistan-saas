import type { Metadata } from "next";
import { MarketingLandingPage } from "@/components/marketing/MarketingLandingPage";

export const metadata: Metadata = {
  title: "Not Asistan | Randevu, İşlem Notu ve Müşteri Takip Platformu",
  description: "Randevulu çalışan işletmeler için yapay zekâ destekli müşteri hafızası, randevu ve takip yönetimi.",
};

export default function TanitimPage() {
  return <MarketingLandingPage />;
}
