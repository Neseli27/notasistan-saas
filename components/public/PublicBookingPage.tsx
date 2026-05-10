"use client";

import { createPublicBookingRequest, getPublicTenantBySlug } from "@/lib/services/public-booking-service";
import { listenPublicServiceItems } from "@/lib/services/catalog-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { PublicTenant, ServiceItem } from "@/types/domain";
import { CalendarDays, CheckCircle2, Clock3, Loader2, LogIn, Mail, Phone, Send, Sparkles, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface PublicBookingPageProps {
  slug: string;
}

const timeOptions = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getSectorHeroText(sector: PublicTenant["sector"]) {
  const texts = {
    beauty: "Size en uygun bakım randevusu için talebinizi bırakın. İşletme sizinle kısa sürede iletişime geçsin.",
    clinic: "Kontrol veya görüşme randevusu talebinizi güvenli şekilde iletin. Klinik ekibi uygun saat için dönüş yapsın.",
    auto: "Araç servis talebinizi, tercih ettiğiniz gün ve saatle birlikte iletin. Servis ekibi sizi arasın.",
    education: "Öğrenci görüşmesi veya veli bilgilendirme talebinizi kolayca oluşturun.",
    consulting: "Danışmanlık görüşme talebinizi iletin; ekip uygun zaman için sizinle iletişime geçsin.",
  } as const;

  return texts[sector] ?? texts.beauty;
}

export function PublicBookingPage({ slug }: PublicBookingPageProps) {
  const [tenant, setTenant] = useState<PublicTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantError, setTenantError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [service, setService] = useState("");
  const [preferredDate, setPreferredDate] = useState(getToday());
  const [preferredTime, setPreferredTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [publicServices, setPublicServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadTenant() {
      setLoading(true);
      setTenantError("");

      try {
        const publicTenant = await getPublicTenantBySlug(slug);
        if (!mounted) return;

        if (!publicTenant?.isActive) {
          setTenantError("Bu randevu sayfası henüz aktif değil veya bulunamadı.");
          setTenant(null);
          return;
        }

        setTenant(publicTenant);
        const preset = getSectorPreset(publicTenant.sector);
        setService(preset.appointments[0]?.service || "Randevu");
      } catch (error) {
        console.error("Randevu sayfası yüklenemedi:", error);
        if (mounted) setTenantError("Randevu sayfası yüklenirken bir sorun oluştu.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTenant();

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!tenant?.tenantId) return;

    const unsubscribe = listenPublicServiceItems(
      tenant.tenantId,
      (items) => {
        setPublicServices(items);
        if (items.length > 0) {
          setService((current) => current && items.some((item) => item.name === current) ? current : items[0].name);
        }
      },
      () => {
        // Public hizmet okuma kuralı henüz yayınlanmadıysa varsayılan sektör hizmetleri kullanılmaya devam eder.
        setPublicServices([]);
      }
    );

    return unsubscribe;
  }, [tenant?.tenantId]);

  const preset = useMemo(() => getSectorPreset(tenant?.sector), [tenant?.sector]);
  const serviceOptions = useMemo(() => {
    if (publicServices.length > 0) {
      return publicServices.map((item) => item.name);
    }

    const unique = Array.from(new Set(preset.appointments.map((appointment) => appointment.service)));
    return unique.length > 0 ? unique : ["Randevu"];
  }, [preset.appointments, publicServices]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!tenant) {
      setFormError("İşletme bilgisi bulunamadı.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !service.trim() || !preferredDate || !preferredTime) {
      setFormError("Lütfen ad soyad, telefon, hizmet, tarih ve saat alanlarını doldurun.");
      return;
    }

    setSubmitting(true);
    try {
      await createPublicBookingRequest({
        tenantId: tenant.tenantId,
        tenantSlug: tenant.slug,
        sector: tenant.sector,
        customerName,
        customerPhone,
        customerEmail,
        service,
        preferredDate,
        preferredTime,
        notes,
      });
      setSuccess(true);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");
    } catch (error) {
      console.error("Randevu talebi kaydedilemedi:", error);
      setFormError("Randevu talebi kaydedilemedi. Lütfen biraz sonra tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className={`publicBookingPage theme-${preset.sector}`}>
        <section className="publicBookingLoading">
          <Loader2 className="spin" size={26} />
          <h1>Randevu sayfası hazırlanıyor...</h1>
          <p>Not Asistan işletme bilgilerini kontrol ediyor.</p>
        </section>
      </main>
    );
  }

  if (tenantError || !tenant) {
    return (
      <main className="publicBookingPage theme-beauty">
        <section className="publicBookingLoading publicBookingError">
          <Sparkles size={28} />
          <h1>Randevu sayfası bulunamadı</h1>
          <p>{tenantError || "Bağlantı hatalı olabilir. İşletmeden yeni randevu linki isteyin."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={`publicBookingPage theme-${tenant.sector}`}>
      <section className="publicBookingShell">
        <div className="publicBookingHero">
          <div className="publicBrandPill"><Sparkles size={16} /> Not Asistan</div>
          <h1>{tenant.name}</h1>
          <p>{getSectorHeroText(tenant.sector)}</p>
          <div className="publicHeroBadges">
            <span><CalendarDays size={16} /> Kolay randevu talebi</span>
            <span><Clock3 size={16} /> Hızlı dönüş</span>
            <span><CheckCircle2 size={16} /> Takipli hizmet</span>
          </div>
          <a className="publicCustomerLogin" href={`/musteri/${tenant.slug}`}>
            <LogIn size={17} /> Müşteri paneline giriş yap
          </a>
        </div>

        <form className="publicBookingForm" onSubmit={handleSubmit}>
          <div className="publicFormHeader">
            <h2>Randevu Talebi Oluştur</h2>
            <p>Bilgilerinizi bırakın; işletme uygun randevu için sizinle iletişime geçsin.</p>
          </div>

          {success && (
            <div className="publicSuccessBox">
              <CheckCircle2 size={20} />
              <div>
                <strong>Talebiniz alındı.</strong>
                <span>İşletme sizi en kısa sürede bilgilendirecek.</span>
              </div>
            </div>
          )}

          {formError && <p className="formMessage errorMessage">{formError}</p>}

          <label className="publicField">
            <span><UserRound size={16} /> Ad Soyad</span>
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Adınız ve soyadınız" />
          </label>

          <div className="publicTwoCol">
            <label className="publicField">
              <span><Phone size={16} /> Telefon</span>
              <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="05xx xxx xx xx" />
            </label>
            <label className="publicField">
              <span><Mail size={16} /> E-posta</span>
              <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="isteğe bağlı" />
            </label>
          </div>

          <label className="publicField">
            <span>Hizmet / İşlem</span>
            <select value={service} onChange={(event) => setService(event.target.value)}>
              {serviceOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <div className="publicTwoCol">
            <label className="publicField">
              <span>Tercih Edilen Tarih</span>
              <input type="date" min={getToday()} value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} />
            </label>
            <label className="publicField">
              <span>Tercih Edilen Saat</span>
              <select value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)}>
                {timeOptions.map((time) => <option key={time}>{time}</option>)}
              </select>
            </label>
          </div>

          <label className="publicField">
            <span>Ön Not</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Kısa açıklama, tercih, araç bilgisi, kontrol isteği vb." rows={4} />
          </label>

          <button className="publicSubmitButton" type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
            {submitting ? "Talep gönderiliyor..." : "Randevu Talebini Gönder"}
          </button>

          <p className="publicPrivacyNote">Bu form randevu talebi oluşturur. Kesin randevu saati işletme tarafından onaylandıktan sonra geçerli olur.</p>
          <a className="publicInlineLogin" href={`/musteri/${tenant.slug}`}>Müşteri hesabınız varsa panelinize giriş yapın →</a>
        </form>
      </section>
    </main>
  );
}
