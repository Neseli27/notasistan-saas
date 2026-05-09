import { AiSuggestions } from "@/components/AiSuggestions";
import { AppointmentTable } from "@/components/AppointmentTable";
import { CalendarCard } from "@/components/CalendarCard";
import { CustomerCard } from "@/components/CustomerCard";
import { FollowUpsCard } from "@/components/FollowUpsCard";
import { Header } from "@/components/Header";
import { RemindersCard } from "@/components/RemindersCard";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { Bell, CalendarDays, Clock3, Plus, Sparkles, UserPlus, UsersRound } from "lucide-react";

export function Dashboard() {
  return (
    <div className="appShell">
      <Sidebar />
      <main className="mainArea">
        <Header />
        <section className="content">
          <div className="heroRow">
            <div>
              <h1>Günaydın, Murat 👋</h1>
              <p>Bugünkü planınız ve işletmenizin özeti aşağıda.</p>
            </div>
            <div className="actionRow">
              <button className="primaryButton"><Plus size={20} /> Yeni Randevu</button>
              <button className="secondaryButton"><UserPlus size={20} /> Müşteri Ekle</button>
              <button className="secondaryButton"><Sparkles size={20} /> AI ile Mesaj Yaz</button>
            </div>
          </div>

          <div className="statsGrid">
            <StatCard title="Bugünkü Randevular" value="14" detail="3 onay bekliyor" icon={CalendarDays} tone="blue" />
            <StatCard title="Bekleyen Hatırlatmalar" value="9" detail="2’si bugün" icon={Bell} tone="orange" />
            <StatCard title="Takip Zamanı Gelenler" value="6" detail="3 müşteri" icon={Clock3} tone="green" />
            <StatCard title="Sadık Müşteriler" value="128" detail="%18 artış (bu ay)" icon={UsersRound} tone="purple" />
          </div>

          <div className="dashboardGrid">
            <AppointmentTable />
            <AiSuggestions />
            <CustomerCard />
            <CalendarCard />
            <RemindersCard />
            <FollowUpsCard />
          </div>
        </section>
      </main>
    </div>
  );
}
