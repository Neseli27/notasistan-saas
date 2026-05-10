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

interface SidebarProps {
  preset: SectorPreset;
}

export function Sidebar({ preset }: SidebarProps) {
  const extraIcon = preset.sidebarExtra?.type === "vehicle" ? Car : preset.sidebarExtra?.type === "student" ? GraduationCap : BriefcaseBusiness;
  const baseItems = [
    { label: "Ana Panel", icon: Home, active: true },
    { label: "Randevular", icon: CalendarDays },
    { label: preset.customerPluralLabel, icon: UsersRound },
    { label: "Personel", icon: UserRoundCog },
    { label: "Hizmetler", icon: Wrench },
    ...(preset.sidebarExtra ? [{ label: preset.sidebarExtra.label, icon: extraIcon }] : []),
    { label: "İşlem Notları", icon: FileText },
    { label: "Hatırlatmalar", icon: Bell },
    { label: "Takipler", icon: Target },
    { label: "Sadakat", icon: Gift },
    { label: "AI Asistan", icon: Sparkles },
    { label: "Raporlar", icon: ChartNoAxesColumnIncreasing },
    { label: "Ayarlar", icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">
          <Sparkles size={24} />
        </div>
        <span>Not Asistan</span>
      </div>

      <nav className="navList">
        {baseItems.map((item) => {
          const Icon = item.icon;
          return (
            <a className={`navItem ${item.active ? "active" : ""}`} href="#" key={item.label}>
              <Icon size={21} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="sidebarCta">
        <Sparkles size={20} />
        <p>{preset.ctaText}</p>
        <a href="#">AI Asistan’ı Keşfet →</a>
      </div>
    </aside>
  );
}
