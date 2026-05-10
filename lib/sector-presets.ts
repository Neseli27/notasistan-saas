import type { AiSuggestion, Appointment, Customer, FollowUp, Reminder, Sector } from "@/types/domain";
import { BriefcaseBusiness, Car, GraduationCap } from "lucide-react";

export interface SectorPreset {
  sector: Sector;
  label: string;
  greetingEmoji: string;
  userRoleLabel: string;
  searchPlaceholder: string;
  customerLabel: string;
  customerPluralLabel: string;
  appointmentTitle: string;
  serviceColumnLabel: string;
  ctaText: string;
  stats: Array<{
    title: string;
    value: string;
    detail: string;
    tone: "blue" | "orange" | "green" | "purple";
  }>;
  appointments: Appointment[];
  featuredCustomer?: Customer;
  aiSuggestions: AiSuggestion[];
  reminders: Reminder[];
  followUps: FollowUp[];
  sidebarExtra?: {
    label: string;
    type: "vehicle" | "student" | "case";
  };
}

function emptyStats(labels: [string, string, string, string]): SectorPreset["stats"] {
  return [
    { title: labels[0], value: "0", detail: "Henüz kayıt yok", tone: "blue" },
    { title: labels[1], value: "0", detail: "Henüz kayıt yok", tone: "orange" },
    { title: labels[2], value: "0", detail: "Henüz kayıt yok", tone: "green" },
    { title: labels[3], value: "0", detail: "Henüz kayıt yok", tone: "purple" },
  ];
}

const commonEmpty = {
  appointments: [] as Appointment[],
  aiSuggestions: [] as AiSuggestion[],
  reminders: [] as Reminder[],
  followUps: [] as FollowUp[],
};

const beauty: SectorPreset = {
  sector: "beauty",
  label: "Güzellik / Kuaför",
  greetingEmoji: "🌸",
  userRoleLabel: "Yönetici",
  searchPlaceholder: "Ara...",
  customerLabel: "Müşteri",
  customerPluralLabel: "Müşteriler",
  appointmentTitle: "Bugünkü Randevular",
  serviceColumnLabel: "Hizmet",
  ctaText: "AI Asistan ile işlem notlarını düzenleyin, müşteri mesajlarını hazırlayın.",
  stats: emptyStats(["Bugünkü Randevular", "Bekleyen Hatırlatmalar", "Takip Zamanı Gelenler", "Sadık Müşteriler"]),
  ...commonEmpty,
};

const clinic: SectorPreset = {
  sector: "clinic",
  label: "Klinik / Sağlık",
  greetingEmoji: "👋",
  userRoleLabel: "Klinik Yöneticisi",
  searchPlaceholder: "Ara...",
  customerLabel: "Hasta",
  customerPluralLabel: "Hastalar",
  appointmentTitle: "Bugünkü Randevular",
  serviceColumnLabel: "İşlem",
  ctaText: "AI Asistan ile işlem özetlerini ve hatırlatma metinlerini güvenli biçimde hazırlayın.",
  stats: emptyStats(["Bugünkü Randevular", "Bekleyen Hatırlatmalar", "Kontrol Zamanı Gelenler", "Düzenli Hastalar"]),
  ...commonEmpty,
};

const auto: SectorPreset = {
  sector: "auto",
  label: "Otomotiv / Oto Servis",
  greetingEmoji: "🔧",
  userRoleLabel: "Servis Yöneticisi",
  searchPlaceholder: "Ara...",
  customerLabel: "Müşteri",
  customerPluralLabel: "Müşteriler",
  appointmentTitle: "Bugünkü Servis Randevuları",
  serviceColumnLabel: "İşlem",
  ctaText: "AI Asistan ile servis notlarını, bakım hatırlatmalarını ve müşteri dönüşlerini hızlandırın.",
  sidebarExtra: { label: "Araçlar", type: "vehicle" },
  stats: emptyStats(["Bugünkü Servis Randevuları", "Bekleyen Hatırlatmalar", "Bakım Zamanı Gelenler", "Düzenli Müşteriler"]),
  ...commonEmpty,
};

const education: SectorPreset = {
  sector: "education",
  label: "Eğitim / Kurs",
  greetingEmoji: "📚",
  userRoleLabel: "Eğitim Yöneticisi",
  searchPlaceholder: "Ara...",
  customerLabel: "Öğrenci",
  customerPluralLabel: "Öğrenciler",
  appointmentTitle: "Bugünkü Görüşmeler",
  serviceColumnLabel: "Görüşme",
  ctaText: "AI Asistan ile görüşme notlarını, veli bilgilendirmelerini ve takipleri düzenleyin.",
  sidebarExtra: { label: "Öğrenciler", type: "student" },
  stats: emptyStats(["Bugünkü Görüşmeler", "Bekleyen Hatırlatmalar", "Takip Zamanı Gelenler", "Aktif Öğrenciler"]),
  ...commonEmpty,
};

const consulting: SectorPreset = {
  sector: "consulting",
  label: "Danışmanlık",
  greetingEmoji: "💼",
  userRoleLabel: "Danışman",
  searchPlaceholder: "Ara...",
  customerLabel: "Danışan",
  customerPluralLabel: "Danışanlar",
  appointmentTitle: "Bugünkü Görüşmeler",
  serviceColumnLabel: "Görüşme",
  ctaText: "AI Asistan ile görüşme özetlerini, teklif takiplerini ve aksiyonları yönetin.",
  sidebarExtra: { label: "Dosyalar", type: "case" },
  stats: emptyStats(["Bugünkü Görüşmeler", "Bekleyen Hatırlatmalar", "Takip Zamanı Gelenler", "Aktif Danışanlar"]),
  ...commonEmpty,
};

export const sectorPresets: Record<Sector, SectorPreset> = {
  beauty,
  clinic,
  auto,
  education,
  consulting,
};

export function getSectorPreset(sector?: Sector | null): SectorPreset {
  return sectorPresets[sector ?? "beauty"] ?? beauty;
}

export const sectorIconMap = {
  beauty: BriefcaseBusiness,
  clinic: BriefcaseBusiness,
  auto: Car,
  education: GraduationCap,
  consulting: BriefcaseBusiness,
};
