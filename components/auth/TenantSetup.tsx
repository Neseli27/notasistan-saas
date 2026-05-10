"use client";

import { createTenantForUser } from "@/lib/services/user-service";
import type { Sector, UserProfile } from "@/types/domain";
import type { User } from "firebase/auth";
import { Building2, CheckCircle2, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

interface TenantSetupProps {
  user: User;
  onCompleted: (profile: UserProfile) => void;
}

const sectorOptions: { value: Sector; label: string; description: string }[] = [
  { value: "beauty", label: "Güzellik / Kuaför", description: "Bakım, paket, işlem ve müşteri tercihi takibi" },
  { value: "clinic", label: "Klinik / Sağlık", description: "Randevu, kontrol zamanı ve hasta iletişimi" },
  { value: "auto", label: "Oto Servis", description: "Araç bakım notları ve periyodik hatırlatmalar" },
  { value: "education", label: "Eğitim / Kurs", description: "Öğrenci görüşmeleri, veli notları ve takipler" },
  { value: "consulting", label: "Danışmanlık", description: "Görüşme notu ve sonraki adım yönetimi" },
];

export function TenantSetup({ user, onCompleted }: TenantSetupProps) {
  const [tenantName, setTenantName] = useState("");
  const [sector, setSector] = useState<Sector>("beauty");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const profile = await createTenantForUser({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "Not Asistan Kullanıcısı",
        tenantName: tenantName.trim(),
        sector,
      });
      setTenantName("");
      onCompleted(profile);
    } catch (err) {
      console.error(err);
      setError("İşletme oluşturulurken bir hata oluştu. Firestore kurallarını ve internet bağlantınızı kontrol edin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="tenantPage">
      <section className="tenantCard">
        <span className="eyebrow"><Sparkles size={16} /> İlk Kurulum</span>
        <h1>İşletme çalışma alanınızı oluşturalım</h1>
        <p>
          Not Asistan çok işletmeli SaaS mantığıyla çalışır. Her işletmenin müşterileri, randevuları ve işlem notları ayrı tutulur.
        </p>

        <form className="tenantForm" onSubmit={handleSubmit} autoComplete="off">
          <label>
            <span>İşletme adı</span>
            <div className="inputWithIcon"><Building2 size={18} /><input name="not-asistan-tenant-name" autoComplete="off" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required /></div>
          </label>

          <div className="sectorGrid">
            {sectorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`sectorCard ${sector === option.value ? "selected" : ""}`}
                onClick={() => setSector(option.value)}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
                {sector === option.value && <CheckCircle2 size={20} />}
              </button>
            ))}
          </div>

          {error && <p className="formMessage errorMessage">{error}</p>}

          <button className="authSubmit" disabled={submitting} type="submit">
            {submitting ? "İşletme oluşturuluyor..." : "İşletmeyi Oluştur ve Panele Geç"}
          </button>
        </form>
      </section>
    </main>
  );
}
