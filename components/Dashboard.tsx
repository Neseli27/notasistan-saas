"use client";

import { AiSuggestions } from "@/components/AiSuggestions";
import { AppearanceSettings } from "@/components/AppearanceSettings";
import { BillingPanel } from "@/components/BillingPanel";
import { AppointmentFormModal } from "@/components/AppointmentFormModal";
import { AppointmentEditModal } from "@/components/AppointmentEditModal";
import { AppointmentNoteModal } from "@/components/AppointmentNoteModal";
import { AppointmentTable } from "@/components/AppointmentTable";
import { BookingRequestsCard } from "@/components/BookingRequestsCard";
import { CalendarCard } from "@/components/CalendarCard";
import { CustomerCard } from "@/components/CustomerCard";
import { CustomerDirectory } from "@/components/CustomerDirectory";
import { CustomerActionRequestsCard } from "@/components/CustomerActionRequestsCard";
import { MessageCenter } from "@/components/MessageCenter";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { FollowUpsCard } from "@/components/FollowUpsCard";
import { Header } from "@/components/Header";
import { RemindersCard } from "@/components/RemindersCard";
import { Sidebar } from "@/components/Sidebar";
import type { SidebarSectionId } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { StatusHistoryCard } from "@/components/StatusHistoryCard";
import { StatusMessageBanner } from "@/components/StatusMessageBanner";
import { StaffServiceManager } from "@/components/StaffServiceManager";
import { deleteAppointment, listenAppointments, listenAppointmentStatusLogs, updateAppointmentStatus } from "@/lib/services/appointment-service";
import { listenAppointmentNotes, listenFollowUps, listenReminders, updateFollowUpStatus, updateReminderStatus } from "@/lib/services/appointment-note-service";
import { listenCustomers } from "@/lib/services/customer-service";
import { convertBookingRequestToAppointment, ensurePublicTenant, listenBookingRequests, rejectBookingRequest } from "@/lib/services/public-booking-service";
import { buildCustomerActionResponseMessage, completeCustomerCancellationRequest, completeCustomerRescheduleRequest, listenTenantCustomerActionRequests, updateCustomerActionRequestStatus } from "@/lib/services/customer-portal-service";
import { getSectorPreset } from "@/lib/sector-presets";
import { getDefaultAppearance, listenTenantAppearance } from "@/lib/services/appearance-service";
import type { Appointment, AppointmentNote, AppointmentStatus, AppointmentStatusLog, BookingRequest, Customer, CustomerActionRequest, FollowUp, Reminder, TenantAppearance, UserProfile } from "@/types/domain";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Bell, CalendarDays, Clock3, LogOut, Plus, Sparkles, StickyNote, UserPlus, UsersRound } from "lucide-react";
import type { CSSProperties } from "react";
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
  const displayName = profile?.displayName || user?.displayName || user?.email || "Not Asistan Kullanıcısı";
  const firstName = displayName.split(" ")[0] || "Merhaba";
  const preset = getSectorPreset(profile?.sector);
  const [appearance, setAppearance] = useState<TenantAppearance>(() => getDefaultAppearance(preset.sector, profile?.tenantName));
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentNotes, setAppointmentNotes] = useState<AppointmentNote[]>([]);
  const [realFollowUps, setRealFollowUps] = useState<FollowUp[]>([]);
  const [realReminders, setRealReminders] = useState<Reminder[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [statusLogs, setStatusLogs] = useState<AppointmentStatusLog[]>([]);
  const [customerActionRequests, setCustomerActionRequests] = useState<CustomerActionRequest[]>([]);
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
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [convertingRequestId, setConvertingRequestId] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [processingActionRequestId, setProcessingActionRequestId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SidebarSectionId>("home");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointmentForNote, setSelectedAppointmentForNote] = useState<Appointment | null>(null);
  const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState<Appointment | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.tenantName) {
      setAppearance(getDefaultAppearance(preset.sector, profile?.tenantName));
      return;
    }

    const unsubscribe = listenTenantAppearance(
      profile.tenantId,
      preset.sector,
      profile.tenantName,
      setAppearance,
      () => setBookingError("Görünüm ayarları okunamadı. Firestore kurallarını kontrol edin.")
    );

    return unsubscribe;
  }, [profile?.tenantId, profile?.tenantName, preset.sector]);

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

    const unsubscribe = listenTenantCustomerActionRequests(
      profile.tenantId,
      setCustomerActionRequests,
      () => setBookingError("Müşteri erteleme/iptal talepleri okunamadı. Firestore bağlantısını kontrol edin.")
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
  const featuredCustomer = customers[0] ?? null;
  const realCustomerCount = customers.length;
  const realAppointmentCount = appointments.length;
  const realNoteCount = appointmentNotes.length;
  const visibleAppointments = appointments;
  const visibleFollowUps = realFollowUps;
  const visibleReminders = realReminders;
  const visibleSuggestions = realNoteCount > 0 ? buildNoteSuggestions(appointmentNotes) : [];
  const publicBookingUrl = publicSlug && appOrigin ? `${appOrigin}/randevu/${publicSlug}` : "";
  const customerPortalUrl = publicSlug && appOrigin ? `${appOrigin}/musteri/${publicSlug}` : "";
  const activeBrandName = appearance.brandName || profile?.tenantName || "Not Asistan";
  const themeStyle = appearance.themeMode === "custom"
    ? ({
        "--theme-primary": appearance.primaryColor,
        "--theme-primary-dark": appearance.primaryColor,
        "--theme-accent": appearance.accentColor,
        "--theme-soft": `${appearance.accentColor}18`,
      } as CSSProperties)
    : undefined;


  const stats = useMemo(() => {
    return preset.stats.map((stat, index) => {
      if (index === 0) {
        return { ...stat, value: String(realAppointmentCount), detail: realAppointmentCount > 0 ? "Gerçek randevu kaydı" : "Henüz randevu yok" };
      }
      if (index === 1) {
        return { ...stat, value: String(realReminders.length), detail: realReminders.length > 0 ? "Gerçek hatırlatma kaydı" : "Henüz hatırlatma yok" };
      }
      if (index === 2) {
        return { ...stat, value: String(realFollowUps.length), detail: realFollowUps.length > 0 ? "Gerçek takip kaydı" : "Henüz takip yok" };
      }
      if (index === 3) {
        return { ...stat, value: String(realCustomerCount), detail: realCustomerCount > 0 ? "Gerçek müşteri kaydı" : "Henüz müşteri yok" };
      }
      return stat;
    });
  }, [preset.stats, realCustomerCount, realAppointmentCount, realFollowUps.length, realReminders.length]);


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


  async function handleDeleteAppointment(appointment: Appointment) {
    if (!appointment.id) return;

    const approved = window.confirm(`${appointment.customerName} için ${appointment.date || "tarihsiz"} ${appointment.time} randevusunu silmek istiyor musunuz? Bu işlem randevu kaydını kaldırır.`);
    if (!approved) return;

    setAppointmentError("");
    setAppointmentStatusMessage("");
    setDeletingAppointmentId(appointment.id);

    try {
      await deleteAppointment(appointment.id);
      setAppointmentStatusMessage(`${appointment.customerName} randevusu silindi.`);
      window.setTimeout(() => setAppointmentStatusMessage(""), 2800);
    } catch (error) {
      console.error("Randevu silinemedi:", error);
      setAppointmentError("Randevu silinemedi. Firestore bağlantısını ve kurallarını kontrol edin.");
    } finally {
      setDeletingAppointmentId(null);
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


  async function handleCustomerActionDecision(request: CustomerActionRequest, status: CustomerActionRequest["status"]) {
    const actionLabel = status === "Tamamlandı" ? "tamamlandı" : "reddedildi";
    const confirmationText = request.type === "İptal" && status === "Tamamlandı"
      ? `${request.customerName} iptal talebini onaylayıp randevuyu İptal durumuna almak istiyor musunuz?`
      : `${request.customerName} tarafından gönderilen ${request.type.toLocaleLowerCase("tr-TR")} talebini ${actionLabel} olarak işaretlemek istiyor musunuz?`;
    const approved = window.confirm(confirmationText);
    if (!approved) return;

    setBookingError("");
    setBookingSuccess("");
    setProcessingActionRequestId(request.id);

    try {
      if (request.type === "İptal" && status === "Tamamlandı") {
        const message = await completeCustomerCancellationRequest({
          request,
          tenantName: profile?.tenantName,
          handledBy: profile?.displayName || user?.email || "",
        });
        setBookingSuccess(`${request.customerName} iptal talebi onaylandı ve randevu iptal edildi.`);
        setStatusDraftMessage({ customerName: request.customerName, message });
        return;
      }

      await updateCustomerActionRequestStatus({
        request,
        status,
        handledBy: profile?.displayName || user?.email || "",
      });
      setBookingSuccess(`${request.customerName} ${request.type.toLocaleLowerCase("tr-TR")} talebi ${actionLabel} olarak işaretlendi.`);
    } catch (error) {
      console.error("Müşteri işlem talebi güncellenemedi:", error);
      setBookingError("Müşteri işlem talebi güncellenemedi. Firestore bağlantısını ve randevu kaydını kontrol edin.");
    } finally {
      setProcessingActionRequestId(null);
    }
  }

  async function handleApproveRescheduleRequest(request: CustomerActionRequest, newDate: string, newTime: string) {
    if (!request.appointmentId) {
      setBookingError("Bu erteleme talebine bağlı randevu bulunamadı.");
      return;
    }

    const approved = window.confirm(`${request.customerName} randevusunu ${newDate} saat ${newTime} olarak güncellemek istiyor musunuz?`);
    if (!approved) return;

    setBookingError("");
    setBookingSuccess("");
    setProcessingActionRequestId(request.id);

    try {
      const message = await completeCustomerRescheduleRequest({
        request,
        newDate,
        newTime,
        tenantName: profile?.tenantName,
        handledBy: profile?.displayName || user?.email || "",
      });
      setBookingSuccess(`${request.customerName} erteleme talebi onaylandı ve randevu güncellendi.`);
      setStatusDraftMessage({ customerName: request.customerName, message });
    } catch (error) {
      console.error("Erteleme talebi randevuya uygulanamadı:", error);
      setBookingError("Erteleme talebi randevuya uygulanamadı. Firestore bağlantısını ve randevu kaydını kontrol edin.");
    } finally {
      setProcessingActionRequestId(null);
    }
  }

  async function handleCopyCustomerActionMessage(request: CustomerActionRequest, approved: boolean) {
    const message = buildCustomerActionResponseMessage({
      request,
      tenantName: profile?.tenantName,
      approved,
    });

    try {
      await navigator.clipboard.writeText(message);
      setBookingSuccess(`${request.customerName} için dönüş metni panoya kopyalandı.`);
    } catch {
      setStatusDraftMessage({ customerName: request.customerName, message });
    }
  }

  async function handleReminderStatusChange(reminder: Reminder, status: Reminder["status"]) {
    setNoteError("");
    try {
      await updateReminderStatus(reminder.id, status);
      setBookingSuccess(`${reminder.title} hatırlatması ${status?.toLocaleLowerCase("tr-TR")} olarak işaretlendi.`);
      window.setTimeout(() => setBookingSuccess(""), 2600);
    } catch (error) {
      console.error("Hatırlatma durumu güncellenemedi:", error);
      setNoteError("Hatırlatma durumu güncellenemedi. Firestore bağlantısını kontrol edin.");
    }
  }

  async function handleFollowUpStatusChange(followUp: FollowUp, status: FollowUp["status"]) {
    setNoteError("");
    try {
      await updateFollowUpStatus(followUp.id, status);
      setBookingSuccess(`${followUp.customerName} takibi ${status?.toLocaleLowerCase("tr-TR")} olarak işaretlendi.`);
      window.setTimeout(() => setBookingSuccess(""), 2600);
    } catch (error) {
      console.error("Takip durumu güncellenemedi:", error);
      setNoteError("Takip durumu güncellenemedi. Firestore bağlantısını kontrol edin.");
    }
  }



  function renderSettingsPanel() {
    return (
      <div className="dashboardGrid">
        <div className="panel widePanel">
          <div className="panelHeader">
            <div>
              <h3>Ayarlar</h3>
              <p>İşletme bağlantıları, sektör bilgisi ve tema altyapısı.</p>
            </div>
          </div>
          <div className="publicLinkBanner compactPublicLinkBanner">
            <Sparkles size={20} />
            <div>
              <b>{profile?.tenantName || "İşletme"}</b>
              <span>Sektör: {preset.sector}</span>
              {publicBookingUrl && <span>Randevu sayfası: {publicBookingUrl}</span>}
              {customerPortalUrl && <span>Müşteri paneli: {customerPortalUrl}</span>}
            </div>
          </div>
          <div className="miniList">
            <div><b>Tema</b><span>Sektöre göre otomatik tema veya işletmeye özel renk seçimi kullanılabilir.</span></div>
            <div><b>PWA</b><span>Müşteri paneli telefona eklenebilir şekilde hazırlanmıştır.</span></div>
            <div><b>Güvenlik</b><span>Tenant ve rol bazlı güvenlik kuralları aktiftir.</span></div>
          </div>
        </div>

        {profile?.tenantId && (
          <AppearanceSettings
            tenantId={profile.tenantId}
            tenantName={profile.tenantName || "İşletme"}
            sector={preset.sector}
            publicSlug={publicSlug}
            appearance={appearance}
            onAppearanceChange={setAppearance}
          />
        )}

        {profile?.tenantId && (
          <BillingPanel
            tenantId={profile.tenantId}
            tenantName={profile.tenantName || "İşletme"}
            contactEmail={profile.email || user?.email || ""}
          />
        )}
      </div>
    );
  }

  function renderActiveSection() {
    if (activeSection === "appointments") {
      return (
        <div className="dashboardGrid">
          <AppointmentTable
            title={preset.appointmentTitle}
            customerLabel={preset.customerLabel}
            serviceColumnLabel={preset.serviceColumnLabel}
            appointments={visibleAppointments}
            showResourceColumn={preset.sector === "auto"}
            onAddNote={setSelectedAppointmentForNote}
            onStatusChange={handleAppointmentStatusChange}
            onEdit={setSelectedAppointmentForEdit}
            onDelete={handleDeleteAppointment}
            updatingAppointmentId={updatingAppointmentId}
            deletingAppointmentId={deletingAppointmentId}
          />
          <BookingRequestsCard
            requests={bookingRequests}
            publicUrl={publicBookingUrl}
            tenantName={profile?.tenantName}
            onConvert={handleConvertBookingRequest}
            convertingRequestId={convertingRequestId}
            onReject={handleRejectBookingRequest}
            rejectingRequestId={rejectingRequestId}
          />
          <CustomerActionRequestsCard
            requests={customerActionRequests}
            processingRequestId={processingActionRequestId}
            onApprove={(request) => handleCustomerActionDecision(request, "Tamamlandı")}
            onApproveReschedule={handleApproveRescheduleRequest}
            onReject={(request) => handleCustomerActionDecision(request, "Reddedildi")}
            onCopyMessage={handleCopyCustomerActionMessage}
          />
          <CalendarCard />
          <StatusHistoryCard logs={statusLogs} />
        </div>
      );
    }

    if (activeSection === "customers" || activeSection === "extra") {
      return (
        <div className="dashboardGrid">
          <CustomerDirectory
            customers={customers}
            appointments={appointments}
            appointmentNotes={appointmentNotes}
            customerLabel={preset.customerLabel}
            sector={preset.sector}
            historyLabel={historyLabel}
            onAddCustomer={() => setIsCustomerModalOpen(true)}
          />
          <CustomerCard customer={featuredCustomer} customerLabel={preset.sector === "auto" ? "Müşteri & Araç" : preset.customerLabel} historyLabel={historyLabel} />
          <CustomerActionRequestsCard
            requests={customerActionRequests}
            processingRequestId={processingActionRequestId}
            onApprove={(request) => handleCustomerActionDecision(request, "Tamamlandı")}
            onApproveReschedule={handleApproveRescheduleRequest}
            onReject={(request) => handleCustomerActionDecision(request, "Reddedildi")}
            onCopyMessage={handleCopyCustomerActionMessage}
          />
        </div>
      );
    }

    if (activeSection === "staff" || activeSection === "services") {
      return (
        <div className="dashboardGrid">
          {profile?.tenantId && (
            <StaffServiceManager tenantId={profile.tenantId} sector={preset.sector} />
          )}
          <AppointmentTable
            title="Personel / hizmet bağlantılı randevular"
            customerLabel={preset.customerLabel}
            serviceColumnLabel={preset.serviceColumnLabel}
            appointments={visibleAppointments}
            showResourceColumn={preset.sector === "auto"}
            onAddNote={setSelectedAppointmentForNote}
            onStatusChange={handleAppointmentStatusChange}
            onEdit={setSelectedAppointmentForEdit}
            onDelete={handleDeleteAppointment}
            updatingAppointmentId={updatingAppointmentId}
            deletingAppointmentId={deletingAppointmentId}
          />
        </div>
      );
    }

    if (activeSection === "notes") {
      return (
        <div className="dashboardGrid">
          <AiSuggestions suggestions={visibleSuggestions} sector={preset.sector} />
          <StatusHistoryCard logs={statusLogs} />
          <MessageCenter
            tenantName={profile?.tenantName}
            sector={preset.sector}
            reminders={visibleReminders}
            followUps={visibleFollowUps}
            onReminderStatusChange={handleReminderStatusChange}
            onFollowUpStatusChange={handleFollowUpStatusChange}
          />
        </div>
      );
    }

    if (activeSection === "reminders") {
      return (
        <div className="dashboardGrid">
          <MessageCenter
            tenantName={profile?.tenantName}
            sector={preset.sector}
            reminders={visibleReminders}
            followUps={visibleFollowUps}
            onReminderStatusChange={handleReminderStatusChange}
            onFollowUpStatusChange={handleFollowUpStatusChange}
          />
          <RemindersCard reminders={visibleReminders} />
        </div>
      );
    }

    if (activeSection === "followups") {
      return (
        <div className="dashboardGrid">
          <MessageCenter
            tenantName={profile?.tenantName}
            sector={preset.sector}
            reminders={visibleReminders}
            followUps={visibleFollowUps}
            onReminderStatusChange={handleReminderStatusChange}
            onFollowUpStatusChange={handleFollowUpStatusChange}
          />
          <FollowUpsCard followUps={visibleFollowUps} />
          <CustomerActionRequestsCard
            requests={customerActionRequests}
            processingRequestId={processingActionRequestId}
            onApprove={(request) => handleCustomerActionDecision(request, "Tamamlandı")}
            onApproveReschedule={handleApproveRescheduleRequest}
            onReject={(request) => handleCustomerActionDecision(request, "Reddedildi")}
            onCopyMessage={handleCopyCustomerActionMessage}
          />
        </div>
      );
    }

    if (activeSection === "loyalty") {
      return (
        <div className="dashboardGrid">
          <CustomerDirectory
            customers={customers}
            appointments={appointments}
            appointmentNotes={appointmentNotes}
            customerLabel={preset.customerLabel}
            sector={preset.sector}
            historyLabel={historyLabel}
            onAddCustomer={() => setIsCustomerModalOpen(true)}
          />
          <AiSuggestions suggestions={visibleSuggestions} sector={preset.sector} />
        </div>
      );
    }

    if (activeSection === "ai") {
      return (
        <div className="dashboardGrid">
          <AiSuggestions suggestions={visibleSuggestions} sector={preset.sector} />
          <MessageCenter
            tenantName={profile?.tenantName}
            sector={preset.sector}
            reminders={visibleReminders}
            followUps={visibleFollowUps}
            onReminderStatusChange={handleReminderStatusChange}
            onFollowUpStatusChange={handleFollowUpStatusChange}
          />
          <CustomerCard customer={featuredCustomer} customerLabel={preset.sector === "auto" ? "Müşteri & Araç" : preset.customerLabel} historyLabel={historyLabel} />
        </div>
      );
    }

    if (activeSection === "reports") {
      return (
        <div className="dashboardGrid">
          <StatusHistoryCard logs={statusLogs} />
          <CalendarCard />
          <RemindersCard reminders={visibleReminders} />
          <FollowUpsCard followUps={visibleFollowUps} />
        </div>
      );
    }

    if (activeSection === "settings") {
      return renderSettingsPanel();
    }

    return (
      <div className="dashboardGrid">
        <AppointmentTable
          title={preset.appointmentTitle}
          customerLabel={preset.customerLabel}
          serviceColumnLabel={preset.serviceColumnLabel}
          appointments={visibleAppointments}
          showResourceColumn={preset.sector === "auto"}
          onAddNote={setSelectedAppointmentForNote}
          onStatusChange={handleAppointmentStatusChange}
          onEdit={setSelectedAppointmentForEdit}
          onDelete={handleDeleteAppointment}
          updatingAppointmentId={updatingAppointmentId}
          deletingAppointmentId={deletingAppointmentId}
        />
        <AiSuggestions suggestions={visibleSuggestions} sector={preset.sector} />
        <CustomerCard customer={featuredCustomer} customerLabel={preset.sector === "auto" ? "Müşteri & Araç" : preset.customerLabel} historyLabel={historyLabel} />
        <CustomerDirectory
          customers={customers}
          appointments={appointments}
          appointmentNotes={appointmentNotes}
          customerLabel={preset.customerLabel}
          sector={preset.sector}
          historyLabel={historyLabel}
          onAddCustomer={() => setIsCustomerModalOpen(true)}
        />
        {profile?.tenantId && (
          <StaffServiceManager tenantId={profile.tenantId} sector={preset.sector} />
        )}
        <MessageCenter
          tenantName={profile?.tenantName}
          sector={preset.sector}
          reminders={visibleReminders}
          followUps={visibleFollowUps}
          onReminderStatusChange={handleReminderStatusChange}
          onFollowUpStatusChange={handleFollowUpStatusChange}
        />
        <BookingRequestsCard
          requests={bookingRequests}
          publicUrl={publicBookingUrl}
          tenantName={profile?.tenantName}
          onConvert={handleConvertBookingRequest}
          convertingRequestId={convertingRequestId}
          onReject={handleRejectBookingRequest}
          rejectingRequestId={rejectingRequestId}
        />
        <CustomerActionRequestsCard
          requests={customerActionRequests}
          processingRequestId={processingActionRequestId}
          onApprove={(request) => handleCustomerActionDecision(request, "Tamamlandı")}
          onApproveReschedule={handleApproveRescheduleRequest}
          onReject={(request) => handleCustomerActionDecision(request, "Reddedildi")}
          onCopyMessage={handleCopyCustomerActionMessage}
        />
        <StatusHistoryCard logs={statusLogs} />
        <CalendarCard />
        <RemindersCard reminders={visibleReminders} />
        <FollowUpsCard followUps={visibleFollowUps} />
      </div>
    );
  }
  return (
    <div className={`appShell theme-${preset.sector}`} style={themeStyle}>
      <Sidebar preset={preset} activeSection={activeSection} onSectionChange={setActiveSection} brandName={activeBrandName} logoUrl={appearance.logoUrl} />
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
                <b>Müşteri randevu sayfanız ve müşteri paneliniz hazır.</b>
                <span>{publicBookingUrl}</span>
                {customerPortalUrl && <span>{customerPortalUrl}</span>}
              </div>
              <div className="publicLinkActions">
                <a href={publicBookingUrl} target="_blank" rel="noreferrer">Randevu Sayfası</a>
                {customerPortalUrl && <a href={customerPortalUrl} target="_blank" rel="noreferrer">Müşteri Paneli</a>}
              </div>
            </div>
          )}

          <div className="statsGrid">
            {stats.map((stat, index) => {
              const Icon = statIcons[index] ?? CalendarDays;
              return <StatCard key={stat.title} title={stat.title} value={stat.value} detail={stat.detail} icon={Icon} tone={stat.tone} />;
            })}
          </div>

          {renderActiveSection()}
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

      {selectedAppointmentForEdit && (
        <AppointmentEditModal
          sector={preset.sector}
          appointment={selectedAppointmentForEdit}
          onClose={() => setSelectedAppointmentForEdit(null)}
          onUpdated={() => {
            setAppointmentStatusMessage(`${selectedAppointmentForEdit.customerName} randevusu güncellendi.`);
            window.setTimeout(() => setAppointmentStatusMessage(""), 2800);
          }}
        />
      )}
    </div>
  );
}
