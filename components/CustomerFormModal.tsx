"use client";

import { createCustomer } from "@/lib/services/customer-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { Sector } from "@/types/domain";
import { X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

interface CustomerFormModalProps {
  tenantId: string;
  sector: Sector;
  onClose: () => void;
  onCreated?: () => void;
}

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
}

const sectorFields: Record<Sector, FieldDef[]> = {
  beauty: [
    { key: "Cilt / saç tipi", label: "Cilt / saç tipi", placeholder: "Hassas cilt, kuru saç, karma cilt..." },
    { key: "Tercih", label: "Tercih", placeholder: "Parfümsüz ürün, doğal ton, kısa işlem..." },
    { key: "Hassasiyet", label: "Hassasiyet", placeholder: "Alerji, güneş hassasiyeti, boya hassasiyeti..." },
  ],
  clinic: [
    { key: "Özel not", label: "Özel not", placeholder: "Sabah saatlerini tercih eder, kontrol bekliyor..." },
    { key: "Kontrol zamanı", label: "Kontrol zamanı", placeholder: "2 hafta sonra, 6 ay sonra..." },
    { key: "Tercih", label: "Tercih", placeholder: "Doktor, saat, iletişim tercihi..." },
  ],
  auto: [
    { key: "Araç", label: "Araç marka/model", placeholder: "VW Passat, Renault Clio, Hyundai i20..." },
    { key: "Plaka", label: "Plaka", placeholder: "34 ABC 123" },
    { key: "Kilometre / yakıt", label: "Kilometre / yakıt", placeholder: "158.000 km • Dizel" },
  ],
  education: [
    { key: "Veli", label: "Veli adı", placeholder: "Veli adı ve yakınlık bilgisi" },
    { key: "Sınıf / seviye", label: "Sınıf / seviye", placeholder: "10-A, TYT, AYT, LGS..." },
    { key: "Eksik konu", label: "Eksik konu", placeholder: "Paragraf, problem, yazım kuralları..." },
  ],
  consulting: [
    { key: "Kurum / şirket", label: "Kurum / şirket", placeholder: "Firma veya dosya adı" },
    { key: "Görüşme konusu", label: "Görüşme konusu", placeholder: "Strateji, teklif, takip, rapor..." },
    { key: "Beklenen çıktı", label: "Beklenen çıktı", placeholder: "Teklif, toplantı özeti, yol haritası..." },
  ],
};

export function CustomerFormModal({ tenantId, sector, onClose, onCreated }: CustomerFormModalProps) {
  const preset = getSectorPreset(sector);
  const fields = useMemo(() => sectorFields[sector], [sector]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [sectorData, setSectorData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim()) {
      setError(`${preset.customerLabel} adı ve telefon zorunludur.`);
      return;
    }

    setSaving(true);
    try {
      await createCustomer({
        tenantId,
        sector,
        name,
        phone,
        email,
        notes,
        sectorData,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Kayıt oluşturulamadı. Firebase bağlantısı ve Firestore kurallarını kontrol edin.");
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
            <h2>Yeni {preset.customerLabel} Ekle</h2>
            <p>Sektöre uygun alanlar otomatik hazırlandı. Kayıt Firestore’a yazılacak.</p>
          </div>
          <button className="modalClose" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        </div>

        <form className="customerForm" onSubmit={handleSubmit}>
          <div className="formGridTwo">
            <label>
              {preset.customerLabel} adı *
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Telefon *
              <input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
          </div>

          <label>
            E-posta
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <div className="sectorFieldGrid">
            {fields.map((field) => (
              <label key={field.key}>
                {field.label}
                <input
                  value={sectorData[field.key] ?? ""}
                  onChange={(event) => setSectorData((current) => ({ ...current, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                />
              </label>
            ))}
          </div>

          <label>
            Genel not
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
          </label>

          {error && <p className="formMessage errorMessage">{error}</p>}

          <div className="modalActions">
            <button type="button" className="secondaryButton compactButton" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="primaryButton compactButton" disabled={saving}>{saving ? "Kaydediliyor..." : `${preset.customerLabel} Kaydet`}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
