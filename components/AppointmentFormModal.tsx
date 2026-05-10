"use client";

import { createAppointment } from "@/lib/services/appointment-service";
import { listenServiceItems, listenStaffMembers } from "@/lib/services/catalog-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { AppointmentStatus, Customer, Sector, ServiceItem, StaffMember } from "@/types/domain";
import { X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface AppointmentFormModalProps {
  tenantId: string;
  sector: Sector;
  customers: Customer[];
  onClose: () => void;
  onCreated?: () => void;
}

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
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [catalogError, setCatalogError] = useState("");

  const activeServices = useMemo(() => serviceItems.filter((item) => item.isActive), [serviceItems]);
  const services = useMemo(() => activeServices.map((item) => item.name), [activeServices]);
  const activeStaff = useMemo(() => staffMembers.filter((item) => item.isActive), [staffMembers]);

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("09:00");
  const [service, setService] = useState(services[0] ?? "Genel Randevu");
  const [staffId, setStaffId] = useState("");
  const [subService, setSubService] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("Bekliyor");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribeServices = listenServiceItems(tenantId, setServiceItems, () => setCatalogError("Hizmet kayıtları okunamadı. Varsayılan liste kullanılacak."));
    const unsubscribeStaff = listenStaffMembers(tenantId, setStaffMembers, () => setCatalogError("Personel kayıtları okunamadı. Randevu personelsiz oluşturulabilir."));

    return () => {
      unsubscribeServices();
      unsubscribeStaff();
    };
  }, [tenantId]);

  useEffect(() => {
    if (!service || !services.includes(service)) {
      setService(services[0] ?? "Genel Randevu");
    }
  }, [services, service]);

  const selectedCustomer = customers.find((customer) => customer.id === customerId);
  const selectedService = activeServices.find((item) => item.name === service);
  const selectedStaff = activeStaff.find((item) => item.id === staffId);

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

    const staffText = selectedStaff ? selectedStaff.name : "";
    const durationText = selectedService?.durationMinutes ? `${selectedService.durationMinutes} dk` : "";
    const suggestedSubService = [staffText, durationText].filter(Boolean).join(" • ");

    setSaving(true);
    try {
      await createAppointment({
        tenantId,
        sector,
        customer: selectedCustomer,
        date,
        time,
        service,
        subService: subService.trim() || suggestedSubService,
        staffId: selectedStaff?.id,
        staffName: selectedStaff?.name,
        durationMinutes: selectedService?.durationMinutes,
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
            <p>{preset.customerLabel} seçin; işletmenizin kendi hizmet ve personel kayıtlarıyla randevu oluşturun.</p>
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
            {catalogError && <p className="formMessage errorMessage">{catalogError}</p>}
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
