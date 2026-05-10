"use client";

import { updateAppointment } from "@/lib/services/appointment-service";
import { listenServiceItems, listenStaffMembers } from "@/lib/services/catalog-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { Appointment, AppointmentStatus, Sector, ServiceItem, StaffMember } from "@/types/domain";
import { CalendarClock, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface AppointmentEditModalProps {
  sector: Sector;
  appointment: Appointment;
  onClose: () => void;
  onUpdated?: () => void;
}

const statusOptions: AppointmentStatus[] = ["Bekliyor", "Onaylandı", "Tamamlandı", "Gelmedi", "İptal"];

function fallbackDate(date?: string) {
  if (date) return date;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function AppointmentEditModal({ sector, appointment, onClose, onUpdated }: AppointmentEditModalProps) {
  const preset = getSectorPreset(sector);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    if (!appointment.tenantId) return;
    const unsubscribeServices = listenServiceItems(appointment.tenantId, setServiceItems);
    const unsubscribeStaff = listenStaffMembers(appointment.tenantId, setStaffMembers);
    return () => {
      unsubscribeServices();
      unsubscribeStaff();
    };
  }, [appointment.tenantId]);

  const activeServices = useMemo(() => serviceItems.filter((item) => item.isActive), [serviceItems]);
  const services = useMemo(() => {
    const dynamic = activeServices.map((item) => item.name);
    const base = appointment.service ? [appointment.service, ...dynamic.filter((item) => item !== appointment.service)] : dynamic;
    return base.length > 0 ? base : ["Genel Randevu"];
  }, [appointment.service, activeServices]);
  const activeStaff = useMemo(() => staffMembers.filter((item) => item.isActive), [staffMembers]);

  const [date, setDate] = useState(fallbackDate(appointment.date));
  const [time, setTime] = useState(appointment.time || "09:00");
  const [service, setService] = useState(appointment.service || services[0]);
  const [staffId, setStaffId] = useState(appointment.staffId || "");
  const [subService, setSubService] = useState(appointment.subService || "");
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status || "Bekliyor");
  const [notes, setNotes] = useState(appointment.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedService = activeServices.find((item) => item.name === service);
  const selectedStaff = activeStaff.find((item) => item.id === staffId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!date || !time || !service.trim()) {
      setError("Tarih, saat ve işlem/hizmet alanı zorunludur.");
      return;
    }

    setSaving(true);
    try {
      await updateAppointment({
        appointmentId: appointment.id,
        date,
        time,
        service,
        subService,
        staffId: selectedStaff?.id || "",
        staffName: selectedStaff?.name || "",
        durationMinutes: selectedService?.durationMinutes || appointment.durationMinutes || 0,
        status,
        notes,
      });
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Randevu güncellenemedi. Firebase bağlantısı ve Firestore kurallarını kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true">
      <section className="modalCard appointmentEditModalCard">
        <div className="modalHeader">
          <div>
            <span className="eyebrow">{preset.label}</span>
            <h2>Randevu Düzenle</h2>
            <p>{appointment.customerName} için tarih, saat, işlem, personel ve durum bilgilerini güncelleyin.</p>
          </div>
          <button className="modalClose" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        </div>

        <div className="appointmentSummaryBox compactSummaryBox">
          <div className="avatar smallAvatar">{appointment.avatar}</div>
          <div>
            <b>{appointment.customerName}</b>
            <p>{appointment.customerPhone}</p>
            {appointment.resourceName && <p>{appointment.resourceName} {appointment.resourceDetail ? `• ${appointment.resourceDetail}` : ""}</p>}
          </div>
          <span className="status approved"><CalendarClock size={14} /> {appointment.date} {appointment.time}</span>
        </div>

        <form className="customerForm" onSubmit={handleSubmit}>
          <div className="formGridTwo">
            <label>
              Randevu tarihi *
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label>
              Randevu saati *
              <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </label>
          </div>

          <div className="formGridTwo">
            <label>
              {preset.serviceColumnLabel} / hizmet *
              <select value={service} onChange={(event) => setService(event.target.value)}>
                {services.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Sorumlu personel
              <select value={staffId} onChange={(event) => setStaffId(event.target.value)}>
                <option value="">Personel seçmeden devam et</option>
                {activeStaff.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.title}</option>)}
              </select>
            </label>
          </div>

          <div className="formGridTwo">
            <label>
              Durum
              <select value={status} onChange={(event) => setStatus(event.target.value as AppointmentStatus)}>
                {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Kısa açıklama / alt işlem
              <input value={subService} onChange={(event) => setSubService(event.target.value)} />
            </label>
          </div>

          {selectedService && (
            <div className="selectedCustomerBox serviceSelectionBox">
              <div>
                <b>{selectedService.name}</b>
                <p>{selectedService.category} • {selectedService.durationMinutes} dakika {selectedService.price ? `• ${selectedService.price} TL` : ""}</p>
              </div>
            </div>
          )}

          <label>
            Ön not
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
          </label>

          {error && <p className="formMessage errorMessage">{error}</p>}

          <div className="modalActions">
            <button type="button" className="secondaryButton compactButton" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="primaryButton compactButton" disabled={saving}>{saving ? "Güncelleniyor..." : "Randevuyu Güncelle"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
