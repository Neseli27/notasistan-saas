"use client";

import { createAppointmentNote } from "@/lib/services/appointment-note-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { Appointment, ReminderChannel, Sector } from "@/types/domain";
import { Sparkles, X } from "lucide-react";
import { FormEvent, useState } from "react";

interface AppointmentNoteModalProps {
  tenantId: string;
  sector: Sector;
  appointment: Appointment;
  onClose: () => void;
  onCreated?: () => void;
}

const reminderChannels: ReminderChannel[] = ["WhatsApp", "SMS", "E-posta"];

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultNextAction(sector: Sector) {
  const values: Record<Sector, string> = {
    beauty: "30 gün sonra bakım / kontrol için tekrar iletişime geç.",
    clinic: "Kontrol randevusu gerekip gerekmediğini yetkili personel değerlendirsin.",
    auto: "Bir sonraki periyodik bakım zamanı için müşteriye hatırlatma gönder.",
    education: "Öğrencinin gelişimi için veliye kısa bilgilendirme mesajı hazırla.",
    consulting: "Görüşme sonrası belirlenen aksiyonları takip et ve dönüş planla.",
  };

  return values[sector];
}

function getDefaultFollowUpDays(sector: Sector) {
  const values: Record<Sector, number> = {
    beauty: 30,
    clinic: 14,
    auto: 90,
    education: 7,
    consulting: 14,
  };

  return values[sector];
}

function buildSummary(rawNote: string, appointment: Appointment, sector: Sector) {
  const clean = rawNote.trim();
  if (!clean) return "";

  const sectorIntro: Record<Sector, string> = {
    beauty: "Bugünkü işlemde müşterinin bakım süreci tamamlandı.",
    clinic: "Bugünkü görüşme/işlem yetkili personel tarafından değerlendirildi.",
    auto: "Bugünkü servis işleminde araçla ilgili gerekli kontrol ve bakım adımları kaydedildi.",
    education: "Bugünkü görüşmede öğrencinin gelişim durumu ve sonraki çalışma adımları değerlendirildi.",
    consulting: "Bugünkü görüşmede ana konu, kararlar ve sonraki aksiyonlar kayıt altına alındı.",
  };

  return `${sectorIntro[sector]} ${appointment.service} için not: ${clean}`;
}

export function AppointmentNoteModal({ tenantId, sector, appointment, onClose, onCreated }: AppointmentNoteModalProps) {
  const preset = getSectorPreset(sector);
  const [rawNote, setRawNote] = useState(appointment.notes ?? "");
  const [customerSummary, setCustomerSummary] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [nextAction, setNextAction] = useState(getDefaultNextAction(sector));
  const [followUpDate, setFollowUpDate] = useState(addDays(getDefaultFollowUpDays(sector)));
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>("WhatsApp");
  const [createReminder, setCreateReminder] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleSmartSummary() {
    const summary = buildSummary(rawNote, appointment, sector);
    setCustomerSummary(summary || `${appointment.customerName} için işlem özeti hazırlanacak.`);

    if (!internalNote.trim()) {
      setInternalNote(`Randevu: ${appointment.date || "Tarih yok"} ${appointment.time}. İşlem: ${appointment.service}. Durum tamamlandı olarak işaretlenecek.`);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!rawNote.trim()) {
      setError("İşlem notu alanı zorunludur.");
      return;
    }

    if (!customerSummary.trim()) {
      setError("Müşteriye gönderilecek kısa özet boş kalmamalı. 'Notu Düzenle' butonunu kullanabilirsiniz.");
      return;
    }

    setSaving(true);
    try {
      await createAppointmentNote({
        tenantId,
        appointment,
        rawNote,
        customerSummary,
        internalNote,
        nextAction,
        followUpDate,
        reminderChannel,
        createReminder,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("İşlem notu kaydedilemedi. Randevunun gerçek Firestore kaydı olduğundan ve kuralların yayınlandığından emin olun.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true">
      <section className="modalCard noteModalCard">
        <div className="modalHeader">
          <div>
            <span className="eyebrow">{preset.label}</span>
            <h2>İşlem Notu ve Takip Oluştur</h2>
            <p>{appointment.customerName} için yapılan işlemi kaydedin, müşteriye gönderilecek özeti hazırlayın ve sonraki takibi planlayın.</p>
          </div>
          <button className="modalClose" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        </div>

        <div className="appointmentSummaryBox">
          <span className="avatar smallAvatar">{appointment.avatar}</span>
          <div>
            <b>{appointment.customerName}</b>
            <p>{appointment.date || "Tarih yok"} • {appointment.time} • {appointment.service} {appointment.subService ? `• ${appointment.subService}` : ""}</p>
          </div>
          <span className="status done">Tamamlanacak</span>
        </div>

        <form className="customerForm" onSubmit={handleSubmit}>
          <label>
            Yapılan işlem / görüşme notu *
            <textarea value={rawNote} onChange={(event) => setRawNote(event.target.value)} placeholder="Örn. Araç yağ değişimi yapıldı, filtreler kontrol edildi. Bir sonraki bakım 10.000 km sonra..." rows={5} />
          </label>

          <button type="button" className="smartSummaryButton" onClick={handleSmartSummary}>
            <Sparkles size={18} /> Notu Düzenle ve Müşteri Özeti Hazırla
          </button>

          <label>
            Müşteriye gönderilecek kısa özet *
            <textarea value={customerSummary} onChange={(event) => setCustomerSummary(event.target.value)} placeholder="Müşteriye gönderilecek sade ve profesyonel işlem özeti..." rows={4} />
          </label>

          <label>
            İç not / personel notu
            <textarea value={internalNote} onChange={(event) => setInternalNote(event.target.value)} placeholder="Sadece işletme/personel tarafından görülecek ek not..." rows={3} />
          </label>

          <div className="formGridTwo">
            <label>
              Sonraki yapılacak iş
              <input value={nextAction} onChange={(event) => setNextAction(event.target.value)} placeholder="Örn. 30 gün sonra kontrol için ara" />
            </label>
            <label>
              Takip tarihi
              <input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
            </label>
          </div>

          <div className="formGridTwo">
            <label>
              Hatırlatma kanalı
              <select value={reminderChannel} onChange={(event) => setReminderChannel(event.target.value as ReminderChannel)}>
                {reminderChannels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
              </select>
            </label>
            <label className="checkboxField">
              <input type="checkbox" checked={createReminder} onChange={(event) => setCreateReminder(event.target.checked)} />
              Hatırlatma kaydı da oluştur
            </label>
          </div>

          {error && <p className="formMessage errorMessage">{error}</p>}

          <div className="modalActions">
            <button type="button" className="secondaryButton compactButton" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="primaryButton compactButton" disabled={saving}>{saving ? "Kaydediliyor..." : "İşlem Notunu Kaydet"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
