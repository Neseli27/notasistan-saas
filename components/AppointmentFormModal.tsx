"use client";

import { createAppointment } from "@/lib/services/appointment-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { AppointmentStatus, Customer, Sector } from "@/types/domain";
import { X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

interface AppointmentFormModalProps {
  tenantId: string;
  sector: Sector;
  customers: Customer[];
  onClose: () => void;
  onCreated?: () => void;
}

const serviceSuggestions: Record<Sector, string[]> = {
  beauty: ["Cilt Bakımı", "Saç Boyama", "Kaş Laminasyonu", "Protez Tırnak", "Lazer Epilasyon"],
  clinic: ["Diş Kontrolü", "Kontrol Muayenesi", "Diyetisyen Görüşmesi", "Fizik Tedavi Seansı", "Sonuç Bilgilendirme"],
  auto: ["Periyodik Bakım", "Yağ Değişimi", "Fren Balata Kontrolü", "Klima Bakımı", "Lastik Rot-Balans"],
  education: ["Öğrenci Görüşmesi", "Veli Bilgilendirme", "Deneme Analizi", "Ödev Kontrolü", "Konu Takibi"],
  consulting: ["Strateji Görüşmesi", "Teklif Değerlendirme", "Aylık Kontrol", "Rapor Görüşmesi", "Takip Toplantısı"],
};

const statusOptions: AppointmentStatus[] = ["Bekliyor", "Onaylandı", "Tamamlandı", "Gelmedi", "İptal"];

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AppointmentFormModal({ tenantId, sector, customers, onClose, onCreated }: AppointmentFormModalProps) {
  const preset = getSectorPreset(sector);
  const services = useMemo(() => serviceSuggestions[sector], [sector]);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("09:00");
  const [service, setService] = useState(services[0] ?? "Randevu");
  const [subService, setSubService] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("Bekliyor");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedCustomer = customers.find((customer) => customer.id === customerId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedCustomer) {
      setError(`Önce bir ${preset.customerLabel.toLocaleLowerCase("tr-TR")} seçmelisiniz.`);
      return;
    }

    if (!date || !time || !service.trim()) {
      setError("Tarih, saat ve işlem/hizmet alanı zorunludur.");
      return;
    }

    setSaving(true);
    try {
      await createAppointment({
        tenantId,
        sector,
        customer: selectedCustomer,
        date,
        time,
        service,
        subService,
        status,
        notes,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Randevu oluşturulamadı. Firebase bağlantısı ve Firestore kurallarını kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true">
      <section className="modalCard">
        <div className="modalHeader">
          <div>
            <span className="eyebrow">{preset.label}</span>
            <h2>Yeni Randevu Oluştur</h2>
            <p>{preset.customerLabel} seçin, tarih/saat belirleyin ve randevuyu Firestore’a kaydedin.</p>
          </div>
          <button className="modalClose" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        </div>

        {customers.length === 0 ? (
          <div className="emptyStateBox">
            <b>Henüz kayıtlı {preset.customerLabel.toLocaleLowerCase("tr-TR")} yok.</b>
            <p>Randevu oluşturmak için önce “{preset.customerLabel} Ekle” butonuyla bir kayıt oluşturun.</p>
            <button className="primaryButton compactButton" onClick={onClose}>Tamam</button>
          </div>
        ) : (
          <form className="customerForm" onSubmit={handleSubmit}>
            <label>
              {preset.customerLabel} seçimi *
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.name} — {customer.phone}</option>
                ))}
              </select>
            </label>

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
                Durum
                <select value={status} onChange={(event) => setStatus(event.target.value as AppointmentStatus)}>
                  {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <label>
              Kısa açıklama / alt işlem
              <input value={subService} onChange={(event) => setSubService(event.target.value)} placeholder="Örn. 10.000 km, HydraFacial, veli görüşmesi..." />
            </label>

            <label>
              Ön not
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Randevu öncesi bilinmesi gereken kısa bilgi..." rows={4} />
            </label>

            {selectedCustomer && (
              <div className="selectedCustomerBox">
                <span className="avatar smallAvatar">{selectedCustomer.avatar}</span>
                <div>
                  <b>{selectedCustomer.name}</b>
                  <p>{selectedCustomer.notes}</p>
                </div>
              </div>
            )}

            {error && <p className="formMessage errorMessage">{error}</p>}

            <div className="modalActions">
              <button type="button" className="secondaryButton compactButton" onClick={onClose}>Vazgeç</button>
              <button type="submit" className="primaryButton compactButton" disabled={saving}>{saving ? "Kaydediliyor..." : "Randevu Kaydet"}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
