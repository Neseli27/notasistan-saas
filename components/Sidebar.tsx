import {
  Bell,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  FileText,
  Gift,
  Home,
  Settings,
  Sparkles,
  Target,
  UsersRound
} from "lucide-react";

const items = [
  { label: "Ana Panel", icon: Home, active: true },
  { label: "Randevular", icon: CalendarDays },
  { label: "Müşteriler", icon: UsersRound },
  { label: "İşlem Notları", icon: FileText },
  { label: "Hatırlatmalar", icon: Bell },
  { label: "Takipler", icon: Target },
  { label: "Sadakat", icon: Gift },
  { label: "AI Asistan", icon: Sparkles },
  { label: "Raporlar", icon: ChartNoAxesColumnIncreasing },
  { label: "Ayarlar", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">
          <Sparkles size={24} />
        </div>
        <span>Not Asistan</span>
      </div>

      <nav className="navList">
        {items.map((item) => {
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
        <p>Not Asistan ile zaman kazanın, müşterilerinizi mutlu edin.</p>
        <a href="#">AI Asistan’ı Keşfet →</a>
      </div>
    </aside>
  );
}
