"use client";

import {
  createCustomerActionRequest,
  listenCustomerActionRequests,
  listenCustomerAppointmentNotes,
  listenCustomerAppointments,
  listenCustomerBookingRequests,
} from "@/lib/services/customer-portal-service";
import type { Appointment, AppointmentNote, BookingRequest, CustomerActionRequest, PublicTenant, UserProfile } from "@/types/domain";
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Home,
  LogOut,
  MessageCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CustomerPanelProps {
  tenant: PublicTenant;
  profile: UserProfile;
  onSignOut: () => void;
}

function statusTone(status: string) {
  if (status === "Onaylandı" || status === "Randevuya Çevrildi") return "green";
  if (status === "Tamamlandı") return "blue";
  if (status === "İptal" || status === "Reddedildi" || status === "Gelmedi") return "red";
  return "orange";
}

function formatDateTime(date?: string, time?: string) {
  return [date, time].filter(Boolean).join(" • ") || "Zaman bilgisi yok";
}

function compareAppointment(a: Appointment, b: Appointment) {
  const aKey = `${a.date || "9999-99-99"} ${a.time || "99:99"}`;
  const bKey = `${b.date || "9999-99-99"} ${b.time || "99:99"}`;
  return aKey.localeCompare(bKey);
}

function sectorLabel(sector: PublicTenant["sector"]) {
  const labels: Record<PublicTenant["sector"], string> = {
    auto: "servis ve bakım",
    beauty: "bakım ve güzellik",
    clinic: "kontrol ve randevu",
    education: "görüşme ve takip",
    consulting: "danışmanlık ve takip",
  };

  return labels[sector] || "randevu ve takip";
}

export function CustomerPanel({ tenant, profile, onSignOut }: CustomerPanelProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [notes, setNotes] = useState<AppointmentNote[]>([]);
  const [actionRequests, setActionRequests] = useState<CustomerActionRequest[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sendingActionId, setSendingActionId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState<"Erteleme" | "İptal">("Erteleme");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    setError("");
    const unsubAppointments = listenCustomerAppointments(profile, setAppointments, () => setError("Randevularınız okunamadı."));
    const unsubRequests = listenCustomerBookingRequests(profile, setBookingRequests, () => setError("Randevu talepleriniz okunamadı."));
    const unsubNotes = listenCustomerAppointmentNotes(profile, setNotes, () => setError("İşlem özetleriniz okunamadı."));
    const unsubActions = listenCustomerActionRequests(profile, setActionRequests, () => setError("Erteleme/iptal talepleriniz okunamadı."));

    return () => {
      unsubAppointments();
      unsubRequests();
      unsubNotes();
      unsubActions();
    };
  }, [profile]);

  const upcomingAppointments = useMemo(
    () => appointments.filter((item) => item.status !== "Tamamlandı" && item.status !== "İptal" && item.status !== "Gelmedi").sort(compareAppointment),
    [appointments]
  );

  const nextAppointment = upcomingAppointments[0];

  const pastAppointments = useMemo(
    () => appointments.filter((item) => item.status === "Tamamlandı" || item.status === "İptal" || item.status === "Gelmedi").sort(compareAppointment).reverse(),
    [appointments]
  );

  const openBookingRequests = useMemo(
    () => bookingRequests.filter((item) => item.status === "Yeni Talep" || item.status === "Görüldü"),
    [bookingRequests]
  );

  const openActionRequests = useMemo(
    () => actionRequests.filter((item) => item.status === "Yeni Talep" || item.status === "Görüldü"),
    [actionRequests]
  );

  const latestNote = notes[0];
  const bookingUrl = `/randevu/${tenant.slug}`;

  function openActionModal(appointment: Appointment, type: "Erteleme" | "İptal") {
    setSelectedAppointment(appointment);
    setActionType(type);
    setActionMessage(type === "Erteleme" ? "Randevumu uygun başka bir tarihe ertelemek istiyorum." : "Bu randevuyu iptal etmek istiyorum.");
    setSuccess("");
    setError("");
  }

  async function submitActionRequest() {
    if (!selectedAppointment) return;
    setSendingActionId(selectedAppointment.id);
    setError("");
    setSuccess("");

    try {
      await createCustomerActionRequest({
        profile,
        appointment: selectedAppointment,
        type: actionType,
        message: actionMessage,
      });
      setSuccess(`${actionType} talebiniz işletmeye iletildi.`);
      setSelectedAppointment(null);
    } catch (err) {
      console.error("Müşteri işlem talebi oluşturulamadı:", err);
      setError("Talebiniz kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSendingActionId(null);
    }
  }

  return (
    <main className={`customerPanelPage customer-theme-${tenant.sector}`}>
      <header className="customerPanelHeader customerAppHeader">
        <div>
          <div className="customerPanelBrand">✦ Not Asistan</div>
          <h1>Merhaba, {profile.displayName}</h1>
          <p>{tenant.name} müşteri paneliniz. Randevularınızı, taleplerinizi ve size açık işlem özetlerini buradan takip edebilirsiniz.</p>
        </div>
        <div className="customerPanelActions">
          <a className="primaryButton" href={bookingUrl}><Plus size={19} /> Yeni Randevu Talebi</a>
          <button className="secondaryButton" onClick={onSignOut}><LogOut size={18} /> Çıkış</button>
        </div>
      </header>

      {error && <p className="formMessage errorMessage dashboardMessage customerAppMessage">{error}</p>}
      {success && <p className="formMessage successMessage dashboardMessage customerAppMessage">{success}</p>}

      <section className="customerAppHero" id="ozet">
        <div className="customerAppHeroMain">
          <span className="customerAppEyebrow"><Smartphone size={16} /> Müşteri uygulamanız hazır</span>
          <h2>{tenant.name}</h2>
          <p>Bu panel, {sectorLabel(tenant.sector)} süreçleriniz için telefonda uygulama gibi kullanılacak şekilde düzenlendi.</p>
          <div className="customerHeroBadges customerAppHeroBadges">
            <span><ShieldCheck size={14} /> Güvenli giriş</span>
            <span><BellRing size={14} /> Talep takibi</span>
            <span><CheckCircle2 size={14} /> Güncel randevu</span>
          </div>
        </div>

        <article className="customerNextAppointmentCard">
          <span className="customerAppEyebrow"><CalendarDays size={16} /> Sıradaki randevu</span>
          {nextAppointment ? (
            <>
              <strong>{nextAppointment.service}</strong>
              <p>{formatDateTime(nextAppointment.date, nextAppointment.time)}</p>
              {nextAppointment.resourceName && <small>{nextAppointment.resourceName} {nextAppointment.resourceDetail ? `• ${nextAppointment.resourceDetail}` : ""}</small>}
              <span className={`statusBadge ${statusTone(nextAppointment.status)}`}>{nextAppointment.status}</span>
            </>
          ) : (
            <>
              <strong>Henüz yaklaşan randevunuz yok</strong>
              <p>Yeni randevu talebi oluşturarak işletmeye uygun zaman isteyebilirsiniz.</p>
              <a className="customerInlineAction" href={bookingUrl}>Talep oluştur →</a>
            </>
          )}
        </article>
      </section>

      <section className="customerSummaryGrid customerAppSummaryGrid">
        <div className="customerSummaryCard"><CalendarDays size={22} /><span>Yaklaşan Randevu</span><strong>{upcomingAppointments.length}</strong></div>
        <div className="customerSummaryCard"><Clock3 size={22} /><span>Bekleyen Talep</span><strong>{openBookingRequests.length}</strong></div>
        <div className="customerSummaryCard"><FileText size={22} /><span>İşlem Özeti</span><strong>{notes.length}</strong></div>
        <div className="customerSummaryCard"><MessageCircle size={22} /><span>Açık Erteleme / İptal</span><strong>{openActionRequests.length}</strong></div>
      </section>

      <section className="customerAppQuickGrid">
        <a href={bookingUrl}><Plus size={18} /><span>Yeni randevu talebi</span></a>
        <a href="#randevular"><CalendarDays size={18} /><span>Randevularım</span></a>
        <a href="#ozetler"><FileText size={18} /><span>İşlem özetlerim</span></a>
        <a href="#talepler"><MessageCircle size={18} /><span>Taleplerim</span></a>
      </section>

      {latestNote && (
        <section className="customerLatestNoteCard" id="son-islem">
          <div>
            <span className="customerAppEyebrow"><FileText size={16} /> Son paylaşılan işlem özeti</span>
            <h2>{latestNote.service}</h2>
            <p>{latestNote.customerSummary || "Bu işlem için müşteriye açık özet henüz yazılmamış."}</p>
            {latestNote.nextAction && <b>Sonraki adım: {latestNote.nextAction}</b>}
          </div>
        </section>
      )}

      <section className="customerPanelGrid customerAppGrid">
        <div className="customerPortalSection customerWidePanel" id="randevular">
          <div className="customerSectionHeader">
            <h2>Yaklaşan Randevularım</h2>
            <a href={bookingUrl}>Yeni talep oluştur →</a>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="customerEmptyText">Henüz yaklaşan randevunuz görünmüyor. Yeni randevu talebi oluşturabilirsiniz.</p>
          ) : (
            <div className="customerListStack">
              {upcomingAppointments.map((appointment) => (
                <article key={appointment.id} className="customerAppointmentItem customerAppAppointmentItem">
                  <div>
                    <strong>{appointment.service}</strong>
                    <span>{formatDateTime(appointment.date, appointment.time)}</span>
                    {appointment.resourceName && <small>{appointment.resourceName} {appointment.resourceDetail ? `• ${appointment.resourceDetail}` : ""}</small>}
                  </div>
                  <div className="customerAppointmentActions">
                    <span className={`statusBadge ${statusTone(appointment.status)}`}>{appointment.status}</span>
                    <button onClick={() => openActionModal(appointment, "Erteleme")}><RefreshCw size={15} /> Ertele</button>
                    <button onClick={() => openActionModal(appointment, "İptal")}><XCircle size={15} /> İptal</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="customerPortalSection" id="talepler">
          <div className="customerSectionHeader"><h2>Bekleyen Randevu Taleplerim</h2></div>
          {bookingRequests.length === 0 ? <p className="customerEmptyText">Bekleyen talep bulunmuyor.</p> : (
            <div className="customerMiniList">
              {bookingRequests.map((request) => (
                <div key={request.id}>
                  <b>{request.service}</b>
                  <span>{formatDateTime(request.preferredDate, request.preferredTime)}</span>
                  <em className={`statusBadge ${statusTone(request.status)}`}>{request.status}</em>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="customerPortalSection customerWidePanel" id="ozetler">
          <div className="customerSectionHeader"><h2>Müşteriye Açık İşlem Özetlerim</h2></div>
          {notes.length === 0 ? <p className="customerEmptyText">Henüz paylaşılmış işlem özeti yok.</p> : (
            <div className="customerListStack">
              {notes.map((note) => (
                <article key={note.id} className="customerNoteItem">
                  <strong>{note.service}</strong>
                  <p>{note.customerSummary || "Bu işlem için müşteriye açık özet henüz yazılmamış."}</p>
                  {note.nextAction && <span>Sonraki adım: {note.nextAction}</span>}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="customerPortalSection">
          <div className="customerSectionHeader"><h2>Erteleme / İptal Taleplerim</h2></div>
          {actionRequests.length === 0 ? <p className="customerEmptyText">Henüz erteleme veya iptal talebiniz yok.</p> : (
            <div className="customerMiniList">
              {actionRequests.map((request) => (
                <div key={request.id}>
                  <b>{request.type}</b>
                  <span>{request.appointmentService} • {formatDateTime(request.appointmentDate, request.appointmentTime)}</span>
                  <em className={`statusBadge ${statusTone(request.status)}`}>{request.status}</em>
                  {request.decisionMessage && <small className="customerDecisionMessage">{request.decisionMessage}</small>}
                </div>
              ))}
            </div>
          )}
        </div>

        {pastAppointments.length > 0 && (
          <div className="customerPortalSection customerWidePanel" id="gecmis">
            <div className="customerSectionHeader"><h2>Geçmiş Randevularım</h2></div>
            <div className="customerMiniList twoColumnMiniList">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id}>
                  <b>{appointment.service}</b>
                  <span>{formatDateTime(appointment.date, appointment.time)}</span>
                  <em className={`statusBadge ${statusTone(appointment.status)}`}>{appointment.status}</em>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <nav className="customerBottomNav" aria-label="Müşteri paneli hızlı gezinme">
        <a href="#ozet"><Home size={18} /><span>Özet</span></a>
        <a href="#randevular"><CalendarDays size={18} /><span>Randevu</span></a>
        <a href={bookingUrl}><Plus size={19} /><span>Yeni</span></a>
        <a href="#ozetler"><FileText size={18} /><span>Notlar</span></a>
        <a href="#gecmis"><History size={18} /><span>Geçmiş</span></a>
      </nav>

      {selectedAppointment && (
        <div className="modalOverlay">
          <section className="modalCard customerActionModal">
            <div className="modalHeader">
              <div>
                <span className="eyebrow">Müşteri Talebi</span>
                <h2>{actionType} talebi gönder</h2>
                <p>{selectedAppointment.service} • {formatDateTime(selectedAppointment.date, selectedAppointment.time)}</p>
              </div>
              <button onClick={() => setSelectedAppointment(null)}>×</button>
            </div>
            <label className="formField">
              <span>Talep mesajınız</span>
              <textarea value={actionMessage} onChange={(e) => setActionMessage(e.target.value)} rows={5} />
            </label>
            <div className="modalActions">
              <button className="secondaryButton" onClick={() => setSelectedAppointment(null)}>Vazgeç</button>
              <button className="primaryButton" onClick={submitActionRequest} disabled={sendingActionId === selectedAppointment.id}>
                {sendingActionId === selectedAppointment.id ? "Gönderiliyor..." : "Talebi Gönder"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
