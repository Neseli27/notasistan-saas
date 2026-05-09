"use client";

import {
  createCustomerActionRequest,
  listenCustomerActionRequests,
  listenCustomerAppointmentNotes,
  listenCustomerAppointments,
  listenCustomerBookingRequests,
} from "@/lib/services/customer-portal-service";
import type { Appointment, AppointmentNote, BookingRequest, CustomerActionRequest, PublicTenant, UserProfile } from "@/types/domain";
import { CalendarDays, Clock3, FileText, LogOut, MessageCircle, Plus, RefreshCw, XCircle } from "lucide-react";
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
    () => appointments.filter((item) => item.status !== "Tamamlandı" && item.status !== "İptal" && item.status !== "Gelmedi"),
    [appointments]
  );
  const pastAppointments = useMemo(
    () => appointments.filter((item) => item.status === "Tamamlandı" || item.status === "İptal" || item.status === "Gelmedi"),
    [appointments]
  );
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
      <header className="customerPanelHeader">
        <div>
          <div className="customerPanelBrand">✦ Not Asistan</div>
          <h1>Merhaba, {profile.displayName}</h1>
          <p>{tenant.name} müşteri paneliniz. Randevularınızı ve size özel işlem özetlerini buradan takip edebilirsiniz.</p>
        </div>
        <div className="customerPanelActions">
          <a className="primaryButton" href={bookingUrl}><Plus size={19} /> Yeni Randevu Talebi</a>
          <button className="secondaryButton" onClick={onSignOut}><LogOut size={18} /> Çıkış</button>
        </div>
      </header>

      {error && <p className="formMessage errorMessage dashboardMessage">{error}</p>}
      {success && <p className="formMessage successMessage dashboardMessage">{success}</p>}

      <section className="customerSummaryGrid">
        <div className="customerSummaryCard"><CalendarDays size={22} /><span>Yaklaşan Randevu</span><strong>{upcomingAppointments.length}</strong></div>
        <div className="customerSummaryCard"><Clock3 size={22} /><span>Bekleyen Talep</span><strong>{bookingRequests.filter((item) => item.status === "Yeni Talep" || item.status === "Görüldü").length}</strong></div>
        <div className="customerSummaryCard"><FileText size={22} /><span>İşlem Özeti</span><strong>{notes.length}</strong></div>
        <div className="customerSummaryCard"><MessageCircle size={22} /><span>Erteleme / İptal</span><strong>{actionRequests.length}</strong></div>
      </section>

      <section className="customerPanelGrid">
        <div className="customerPortalSection customerWidePanel">
          <div className="customerSectionHeader">
            <h2>Yaklaşan Randevularım</h2>
            <a href={bookingUrl}>Yeni talep oluştur →</a>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="customerEmptyText">Henüz yaklaşan randevunuz görünmüyor. Yeni randevu talebi oluşturabilirsiniz.</p>
          ) : (
            <div className="customerListStack">
              {upcomingAppointments.map((appointment) => (
                <article key={appointment.id} className="customerAppointmentItem">
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

        <div className="customerPortalSection">
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

        <div className="customerPortalSection customerWidePanel">
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
                </div>
              ))}
            </div>
          )}
        </div>

        {pastAppointments.length > 0 && (
          <div className="customerPortalSection customerWidePanel">
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
