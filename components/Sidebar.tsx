import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  ChartNoAxesColumnIncreasing,
  FileText,
  Gift,
  GraduationCap,
  Home,
  Settings,
  Sparkles,
  Target,
  UsersRound,
  UserRoundCog,
  Wrench
} from "lucide-react";
import type { SectorPreset } from "@/lib/sector-presets";

export type SidebarSectionId =
  | "home"
  | "appointments"
  | "customers"
  | "staff"
  | "services"
  | "extra"
  | "notes"
  | "reminders"
  | "followups"
  | "loyalty"
  | "ai"
  | "reports"
  | "settings";

interface SidebarProps {
  preset: SectorPreset;
  activeSection: SidebarSectionId;
  onSectionChange: (section: SidebarSectionId) => void;
}

export function Sidebar({ preset, activeSection, onSectionChange }: SidebarProps) {
  const extraIcon = preset.sidebarExtra?.type === "vehicle" ? Car : preset.sidebarExtra?.type === "student" ? GraduationCap : BriefcaseBusiness;
  const baseItems = [
    { id: "home", label: "Ana Panel", icon: Home },
    { id: "appointments", label: "Randevular", icon: CalendarDays },
    { id: "customers", label: preset.customerPluralLabel, icon: UsersRound },
    { id: "staff", label: "Personel", icon: UserRoundCog },
    { id: "services", label: "Hizmetler", icon: Wrench },
    ...(preset.sidebarExtra ? [{ id: "extra", label: preset.sidebarExtra.label, icon: extraIcon }] : []),
    { id: "notes", label: "İşlem Notları", icon: FileText },
    { id: "reminders", label: "Hatırlatmalar", icon: Bell },
    { id: "followups", label: "Takipler", icon: Target },
    { id: "loyalty", label: "Sadakat", icon: Gift },
    { id: "ai", label: "AI Asistan", icon: Sparkles },
    { id: "reports", label: "Raporlar", icon: ChartNoAxesColumnIncreasing },
    { id: "settings", label: "Ayarlar", icon: Settings }
  ] as Array<{ id: SidebarSectionId; label: string; icon: typeof Home }>;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">
          <Sparkles size={24} />
        </div>
        <span>Not Asistan</span>
      </div>

      <nav className="navList" aria-label="Ana menü">
        {baseItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              type="button"
              className={`navItem ${isActive ? "active" : ""}`}
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebarCta">
        <Sparkles size={20} />
        <p>{preset.ctaText}</p>
        <button type="button" className="sidebarCtaButton" onClick={() => onSectionChange("ai")}>AI Asistan’ı Keşfet →</button>
      </div>
    </aside>
  );
}
