import type { Metadata } from "next";
import { MarketingLandingPage } from "@/components/marketing/MarketingLandingPage";

export const metadata: Metadata = {
  title: "Not Asistan Fiyatlandırma | SaaS Paketleri",
  description: "Not Asistan başlangıç, profesyonel ve kurumsal paketleri için fiyatlandırma taslağı.",
};

export default function FiyatlandirmaPage() {
  return <MarketingLandingPage focus="pricing" />;
}
