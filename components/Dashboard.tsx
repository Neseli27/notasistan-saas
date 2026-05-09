"use client";

import { AiSuggestions } from "@/components/AiSuggestions";
import { AppointmentTable } from "@/components/AppointmentTable";
import { CalendarCard } from "@/components/CalendarCard";
import { CustomerCard } from "@/components/CustomerCard";
import { AppointmentFormModal } from "@/components/AppointmentFormModal";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { FollowUpsCard } from "@/components/FollowUpsCard";
import { Header } from "@/components/Header";
import { RemindersCard } from "@/components/RemindersCard";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { listenAppointments } from "@/lib/services/appointment-service";
import { listenCustomers } from "@/lib/services/customer-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { Appointment, Customer, UserProfile } from "@/types/domain";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Bell, CalendarDays, Clock3, LogOut, Plus, Sparkles, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DashboardProps {
  user?: User;
  profile?: UserProfile;
}

const statIcons = [CalendarDays, Bell, Clock3, UsersRound];

export function Dashboard({ user, profile }: DashboardProps) {
  const displayName = profile?.displayName || user?.displayName || "Murat Yılmaz";
  const firstName = displayName.split(" ")[0] || "Murat";
  const preset = getSectorPreset(profile?.sector);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId) return;

    setCustomersLoading(true);
    setCustomerError("");

    const unsubscribe = listenCustomers(
      profile.tenantId,
      (records) => {
        setCustomers(records);
        setCustomersLoading(false);
      },
      () => {
        setCustomerError("Müşteri kayıtları okunamadı. Firestore bağlantısını kontrol edin.");
        setCustomersLoading(false);
      }
    );

    return unsubscribe;
  }, [profile?.tenantId]);

  useEffect(() => {
    if (!profile?.tenantId) return;

    setAppointmentsLoading(true);
    setAppointmentError("");

    const unsubscribe = listenAppointments(
      profile.tenantId,
      (records) => {
        setAppointments(records);
        setAppointmentsLoading(false);
      },
      () => {
        setAppointmentError("Randevu kayıtları okunamadı. Firestore bağlantısını kontrol edin.");
        setAppointmentsLoading(false);
      }
    );

    return unsubscribe;
  }, [profile?.tenantId]);

  const historyLabel = preset.sector === "auto" ? "Servis Geçmişi" : preset.sector === "clinic" ? "Tedavi Geçmişi" : preset.sector === "education" ? "Görüşme Geçmişi" : "Hizmet Geçmişi";
  const featuredCustomer = customers[0] ?? preset.featuredCustomer;
  const realCustomerCount = customers.length;
  const realAppointmentCount = appointments.length;
  const visibleAppointments = realAppointmentCount > 0 ? appointments : preset.appointments;

  const stats = useMemo(() => {
    return preset.stats.map((stat, index) => {
      if (index === 0 && realAppointmentCount > 0) {
        return {
          ...stat,
          value: String(realAppointmentCount),
          detail: `Firestore’da ${realAppointmentCount} randevu`,
        };
      }
      if (index === 3 && realCustomerCount > 0) {
        return {
          ...stat,
          value: String(realCustomerCount),
          detail: `Firestore’da ${realCustomerCount} kayıt`,
        };
      }
      return stat;
    });
  }, [preset.stats, realCustomerCount, realAppointmentCount]);

  return (
    <div className={`appShell theme-${preset.sector}`}>
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
              <button className="primaryButton" onClick={() => setIsAppointmentModalOpen(true)}><Plus size={20} /> Yeni Randevu</button>
              <button className="secondaryButton" onClick={() => setIsCustomerModalOpen(true)}><UserPlus size={20} /> {preset.customerLabel} Ekle</button>
              <button className="secondaryButton"><Sparkles size={20} /> AI ile Mesaj Yaz</button>
              {user && <button className="logoutButton" onClick={() => signOut(auth)} title="Çıkış Yap"><LogOut size={20} /></button>}
            </div>
          </div>

          {customerError && <p className="formMessage errorMessage dashboardMessage">{customerError}</p>}
          {appointmentError && <p className="formMessage errorMessage dashboardMessage">{appointmentError}</p>}
          {customersLoading && <p className="formMessage successMessage dashboardMessage">Firestore müşteri kayıtları okunuyor...</p>}
          {appointmentsLoading && <p className="formMessage successMessage dashboardMessage">Firestore randevu kayıtları okunuyor...</p>}

          <div className="statsGrid">
            {stats.map((stat, index) => {
              const Icon = statIcons[index] ?? CalendarDays;
              return <StatCard key={stat.title} title={stat.title} value={stat.value} detail={stat.detail} icon={Icon} tone={stat.tone} />;
            })}
          </div>

          <div className="dashboardGrid">
            <AppointmentTable
              title={preset.appointmentTitle}
              customerLabel={preset.customerLabel}
              serviceColumnLabel={preset.serviceColumnLabel}
              appointments={visibleAppointments}
              showResourceColumn={preset.sector === "auto"}
            />
            <AiSuggestions suggestions={preset.aiSuggestions} sector={preset.sector} />
            <CustomerCard customer={featuredCustomer} customerLabel={preset.sector === "auto" ? "Müşteri & Araç" : preset.customerLabel} historyLabel={historyLabel} />
            <CalendarCard />
            <RemindersCard reminders={preset.reminders} />
            <FollowUpsCard followUps={preset.followUps} />
          </div>
        </section>
      </main>

      {isCustomerModalOpen && profile?.tenantId && (
        <CustomerFormModal
          tenantId={profile.tenantId}
          sector={preset.sector}
          onClose={() => setIsCustomerModalOpen(false)}
        />
      )}

      {isAppointmentModalOpen && profile?.tenantId && (
        <AppointmentFormModal
          tenantId={profile.tenantId}
          sector={preset.sector}
          customers={customers}
          onClose={() => setIsAppointmentModalOpen(false)}
        />
      )}
    </div>
  );
}
