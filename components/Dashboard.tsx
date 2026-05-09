"use client";

import { AiSuggestions } from "@/components/AiSuggestions";
import { AppointmentTable } from "@/components/AppointmentTable";
import { CalendarCard } from "@/components/CalendarCard";
import { CustomerCard } from "@/components/CustomerCard";
import { FollowUpsCard } from "@/components/FollowUpsCard";
import { Header } from "@/components/Header";
import { RemindersCard } from "@/components/RemindersCard";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { getSectorPreset } from "@/lib/sector-presets";
import type { UserProfile } from "@/types/domain";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Bell, CalendarDays, Clock3, LogOut, Plus, Sparkles, UserPlus, UsersRound } from "lucide-react";

interface DashboardProps {
  user?: User;
  profile?: UserProfile;
}

const statIcons = [CalendarDays, Bell, Clock3, UsersRound];

export function Dashboard({ user, profile }: DashboardProps) {
  const displayName = profile?.displayName || user?.displayName || "Murat Yılmaz";
  const firstName = displayName.split(" ")[0] || "Murat";
  const preset = getSectorPreset(profile?.sector);
  const historyLabel = preset.sector === "auto" ? "Servis Geçmişi" : preset.sector === "clinic" ? "Tedavi Geçmişi" : "Hizmet Geçmişi";

  return (
    <div className="appShell">
      <Sidebar preset={preset} />
      <main className="mainArea">
        <Header displayName={displayName} roleLabel={preset.userRoleLabel} searchPlaceholder={preset.searchPlaceholder} />
        <section className="content">
          <div className="heroRow">
            <div>
              <h1>Günaydın, {firstName} {preset.greetingEmoji}</h1>
              <p>{profile?.tenantName ? `${profile.tenantName} için bugünkü plan ve özet aşağıda.` : "Bugünkü planınız ve işletmenizin özeti aşağıda."}</p>
            </div>
            <div className="actionRow">
              <button className="primaryButton"><Plus size={20} /> Yeni Randevu</button>
              <button className="secondaryButton"><UserPlus size={20} /> {preset.customerLabel} Ekle</button>
              <button className="secondaryButton"><Sparkles size={20} /> AI ile Mesaj Yaz</button>
              {user && <button className="logoutButton" onClick={() => signOut(auth)} title="Çıkış Yap"><LogOut size={20} /></button>}
            </div>
          </div>

          <div className="statsGrid">
            {preset.stats.map((stat, index) => {
              const Icon = statIcons[index] ?? CalendarDays;
              return <StatCard key={stat.title} title={stat.title} value={stat.value} detail={stat.detail} icon={Icon} tone={stat.tone} />;
            })}
          </div>

          <div className="dashboardGrid">
            <AppointmentTable
              title={preset.appointmentTitle}
              customerLabel={preset.customerLabel}
              serviceColumnLabel={preset.serviceColumnLabel}
              appointments={preset.appointments}
              showResourceColumn={preset.sector === "auto"}
            />
            <AiSuggestions suggestions={preset.aiSuggestions} sector={preset.sector} />
            <CustomerCard customer={preset.featuredCustomer} customerLabel={preset.sector === "auto" ? "Müşteri & Araç" : preset.customerLabel} historyLabel={historyLabel} />
            <CalendarCard />
            <RemindersCard reminders={preset.reminders} />
            <FollowUpsCard followUps={preset.followUps} />
          </div>
        </section>
      </main>
    </div>
  );
}
