"use client";

import { AiSuggestions } from "@/components/AiSuggestions";
import { AppointmentFormModal } from "@/components/AppointmentFormModal";
import { AppointmentNoteModal } from "@/components/AppointmentNoteModal";
import { AppointmentTable } from "@/components/AppointmentTable";
import { BookingRequestsCard } from "@/components/BookingRequestsCard";
import { CalendarCard } from "@/components/CalendarCard";
import { CustomerCard } from "@/components/CustomerCard";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { FollowUpsCard } from "@/components/FollowUpsCard";
import { Header } from "@/components/Header";
import { RemindersCard } from "@/components/RemindersCard";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { StatusHistoryCard } from "@/components/StatusHistoryCard";
import { StatusMessageBanner } from "@/components/StatusMessageBanner";
import { listenAppointments, listenAppointmentStatusLogs, updateAppointmentStatus } from "@/lib/services/appointment-service";
import { listenAppointmentNotes, listenFollowUps, listenReminders } from "@/lib/services/appointment-note-service";
import { listenCustomers } from "@/lib/services/customer-service";
import { convertBookingRequestToAppointment, ensurePublicTenant, listenBookingRequests, rejectBookingRequest } from "@/lib/services/public-booking-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { Appointment, AppointmentNote, AppointmentStatus, AppointmentStatusLog, BookingRequest, Customer, FollowUp, Reminder, UserProfile } from "@/types/domain";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Bell, CalendarDays, Clock3, LogOut, Plus, Sparkles, StickyNote, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DashboardProps {
  user?: User;
  profile?: UserProfile;
}

const statIcons = [CalendarDays, Bell, Clock3, UsersRound];

function buildNoteSuggestions(notes: AppointmentNote[]) {
  return notes.slice(0, 4).map((note, index) => ({
    id: `note_ai_${note.id}`,
    title: `${note.customerName} için işlem özeti hazır`,
    description: note.nextAction || note.customerSummary || "Sonraki takip adımı oluşturuldu.",
    tone: (["green", "blue", "purple", "orange"] as const)[index] ?? "green",
  }));
}

export function Dashboard({ user, profile }: DashboardProps) {
  const displayName = profile?.displayName || user?.displayName || "Murat Yılmaz";
  const firstName = displayName.split(" ")[0] || "Murat";
  const preset = getSectorPreset(profile?.sector);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentNotes, setAppointmentNotes] = useState<AppointmentNote[]>([]);
  const [realFollowUps, setRealFollowUps] = useState<FollowUp[]>([]);
  const [realReminders, setRealReminders] = useState<Reminder[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [statusLogs, setStatusLogs] = useState<AppointmentStatusLog[]>([]);
  const [publicSlug, setPublicSlug] = useState("");
  const [appOrigin, setAppOrigin] = useState("");
  const [customersLoading, setCustomersLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [noteError, setNoteError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [appointmentStatusMessage, setAppointmentStatusMessage] = useState("");
  const [statusDraftMessage, setStatusDraftMessage] = useState<{ customerName: string; message: string } | null>(null);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [convertingRequestId, setConvertingRequestId] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointmentForNote, setSelectedAppointmentForNote] = useState<Appointment | null>(null);


  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.tenantName || !profile?.sector) return;

    let mounted = true;

    ensurePublicTenant({
      tenantId: profile.tenantId,
      tenantName: profile.tenantName,
      sector: profile.sector,
    })
      .then((slug) => {
        if (mounted && slug) setPublicSlug(slug);
      })
      .catch((error) => {
        console.error("Genel randevu linki hazırlanamadı:", error);
      });

    return () => {
      mounted = false;
    };
  }, [profile?.tenantId, profile?.tenantName, profile?.sector]);

  useEffect(() => {
    if (!profile?.tenantId) return;

    setBookingError("");
    const unsubscribe = listenBookingRequests(
      profile.tenantId,
      setBookingRequests,
      () => setBookingError("Müşteri randevu talepleri okunamadı. Firestore kurallarını kontrol edin.")
    );

    return unsubscribe;
  }, [profile?.tenantId]);

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

  useEffect(() => {
    if (!profile?.tenantId) return;

    const unsubscribe = listenAppointmentStatusLogs(
      profile.tenantId,
      setStatusLogs,
      () => setAppointmentError("Randevu durum geçmişi okunamadı. Firestore bağlantısını kontrol edin.")
    );

    return unsubscribe;
  }, [profile?.tenantId]);

  useEffect(() => {
    if (!profile?.tenantId) return;

    setNotesLoading(true);
    setNoteError("");

    const unsubscribeNotes = listenAppointmentNotes(
      profile.tenantId,
      (records) => {
        setAppointmentNotes(records);
        setNotesLoading(false);
      },
      () => {
        setNoteError("İşlem notları okunamadı. Firestore bağlantısını kontrol edin.");
        setNotesLoading(false);
      }
    );

    const unsubscribeFollowUps = listenFollowUps(profile.tenantId, setRealFollowUps, () => {
      setNoteError("Takip kayıtları okunamadı. Firestore bağlantısını kontrol edin.");
    });

    const unsubscribeReminders = listenReminders(profile.tenantId, setRealReminders, () => {
      setNoteError("Hatırlatma kayıtları okunamadı. Firestore bağlantısını kontrol edin.");
    });

    return () => {
      unsubscribeNotes();
      unsubscribeFollowUps();
      unsubscribeReminders();
    };
  }, [profile?.tenantId]);

  const historyLabel = preset.sector === "auto" ? "Servis Geçmişi" : preset.sector === "clinic" ? "Tedavi Geçmişi" : preset.sector === "education" ? "Görüşme Geçmişi" : "Hizmet Geçmişi";
  const featuredCustomer = customers[0] ?? preset.featuredCustomer;
  const realCustomerCount = customers.length;
  const realAppointmentCount = appointments.length;
  const realNoteCount = appointmentNotes.length;
  const visibleAppointments = realAppointmentCount > 0 ? appointments : preset.appointments;
  const visibleFollowUps = realFollowUps.length > 0 ? realFollowUps : preset.followUps;
  const visibleReminders = realReminders.length > 0 ? realReminders : preset.reminders;
  const visibleSuggestions = realNoteCount > 0 ? buildNoteSuggestions(appointmentNotes) : preset.aiSuggestions;
  const publicBookingUrl = publicSlug && appOrigin ? `${appOrigin}/randevu/${publicSlug}` : "";

  const stats = useMemo(() => {
    return preset.stats.map((stat, index) => {
      if (index === 0 && realAppointmentCount > 0) {
        return {
          ...stat,
          value: String(realAppointmentCount),
          detail: `Firestore’da ${realAppointmentCount} randevu`,
        };
      }
      if (index === 2 && visibleFollowUps.length > 0 && realFollowUps.length > 0) {
        return {
          ...stat,
          value: String(realFollowUps.length),
          detail: `Gerçek takip kaydı`,
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
  }, [preset.stats, realCustomerCount, realAppointmentCount, realFollowUps.length, visibleFollowUps.length]);


  async function handleAppointmentStatusChange(appointment: Appointment, status: AppointmentStatus) {
    if (!appointment.id || appointment.status === status) return;

    setAppointmentError("");
    setAppointmentStatusMessage("");
    setUpdatingAppointmentId(appointment.id);

    try {
      const message = await updateAppointmentStatus(appointment, status, profile?.tenantName, profile?.displayName || user?.email || "");
      setAppointmentStatusMessage(`${appointment.customerName} randevusu "${status}" olarak güncellendi.`);
      setStatusDraftMessage({ customerName: appointment.customerName, message });
      window.setTimeout(() => setAppointmentStatusMessage(""), 2800);
    } catch (error) {
      console.error("Randevu durumu güncellenemedi:", error);
      setAppointmentError("Randevu durumu güncellenemedi. Firestore bağlantısını kontrol edin.");
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  async function handleConvertBookingRequest(request: BookingRequest) {
    if (!profile?.tenantId || !profile?.sector) return;

    setBookingError("");
    setBookingSuccess("");
    setConvertingRequestId(request.id);

    try {
      await convertBookingRequestToAppointment({
        tenantId: profile.tenantId,
        sector: profile.sector,
        request,
      });
      setBookingSuccess(`${request.customerName} talebi randevuya çevrildi.`);
    } catch (error) {
      console.error("Randevu talebi dönüştürülemedi:", error);
      setBookingError("Randevu talebi randevuya çevrilemedi. Firestore kurallarını ve bağlantıyı kontrol edin.");
    } finally {
      setConvertingRequestId(null);
    }
  }


  async function handleRejectBookingRequest(request: BookingRequest) {
    if (!request.id) return;

    const approved = window.confirm(`${request.customerName} talebini reddedildi olarak işaretlemek istiyor musunuz?`);
    if (!approved) return;

    setBookingError("");
    setBookingSuccess("");
    setRejectingRequestId(request.id);

    try {
      await rejectBookingRequest(request.id);
      setBookingSuccess(`${request.customerName} talebi reddedildi olarak işaretlendi.`);
    } catch (error) {
      console.error("Randevu talebi reddedilemedi:", error);
      setBookingError("Randevu talebi reddedilemedi. Firestore kurallarını ve bağlantıyı kontrol edin.");
    } finally {
      setRejectingRequestId(null);
    }
  }

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
          {noteError && <p className="formMessage errorMessage dashboardMessage">{noteError}</p>}
          {bookingError && <p className="formMessage errorMessage dashboardMessage">{bookingError}</p>}
          {bookingSuccess && <p className="formMessage successMessage dashboardMessage">{bookingSuccess}</p>}
          {appointmentStatusMessage && <p className="formMessage successMessage dashboardMessage">{appointmentStatusMessage}</p>}
          {statusDraftMessage && (
            <StatusMessageBanner
              customerName={statusDraftMessage.customerName}
              message={statusDraftMessage.message}
              onClose={() => setStatusDraftMessage(null)}
            />
          )}
          {customersLoading && <p className="formMessage successMessage dashboardMessage">Firestore müşteri kayıtları okunuyor...</p>}
          {appointmentsLoading && <p className="formMessage successMessage dashboardMessage">Firestore randevu kayıtları okunuyor...</p>}
          {notesLoading && <p className="formMessage successMessage dashboardMessage">İşlem notları ve takipler okunuyor...</p>}

          {realNoteCount > 0 && (
            <div className="noteInsightBanner">
              <StickyNote size={20} />
              <span><b>{realNoteCount} işlem notu</b> kaydedildi. Takip ve hatırlatma kartları gerçek kayıtlarla güncelleniyor.</span>
            </div>
          )}

          {publicBookingUrl && (
            <div className="publicLinkBanner">
              <Sparkles size={20} />
              <div>
                <b>Müşteri randevu sayfanız hazır.</b>
                <span>{publicBookingUrl}</span>
              </div>
              <a href={publicBookingUrl} target="_blank" rel="noreferrer">Sayfayı Aç</a>
            </div>
          )}

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
              onAddNote={setSelectedAppointmentForNote}
              onStatusChange={handleAppointmentStatusChange}
              updatingAppointmentId={updatingAppointmentId}
            />
            <AiSuggestions suggestions={visibleSuggestions} sector={preset.sector} />
            <CustomerCard customer={featuredCustomer} customerLabel={preset.sector === "auto" ? "Müşteri & Araç" : preset.customerLabel} historyLabel={historyLabel} />
            <BookingRequestsCard
              requests={bookingRequests}
              publicUrl={publicBookingUrl}
              tenantName={profile?.tenantName}
              onConvert={handleConvertBookingRequest}
              convertingRequestId={convertingRequestId}
              onReject={handleRejectBookingRequest}
              rejectingRequestId={rejectingRequestId}
            />
            <StatusHistoryCard logs={statusLogs} />
            <CalendarCard />
            <RemindersCard reminders={visibleReminders} />
            <FollowUpsCard followUps={visibleFollowUps} />
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

      {selectedAppointmentForNote && profile?.tenantId && (
        <AppointmentNoteModal
          tenantId={profile.tenantId}
          sector={preset.sector}
          appointment={selectedAppointmentForNote}
          onClose={() => setSelectedAppointmentForNote(null)}
        />
      )}
    </div>
  );
}
