"use client";

import { createPaymentRequest, getPlanPrice, listenTenantBilling, listenTenantPaymentRequests } from "@/lib/services/billing-service";
import type { PaymentRequest, TenantPlan } from "@/types/domain";
import { CheckCircle2, CreditCard, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface BillingPanelProps {
  tenantId: string;
  tenantName: string;
  contactEmail?: string;
}

const planLabels: Record<TenantPlan, string> = {
  Starter: "Başlangıç",
  Pro: "Profesyonel",
  Klinik: "Klinik / Kurumsal",
  Enterprise: "Enterprise",
};

const planDetails: Record<TenantPlan, string[]> = {
  Starter: ["Demo ve başlangıç kullanımı", "Temel müşteri ve randevu takibi", "Sınırlı AI metin üretimi"],
  Pro: ["Aktif işletmeler için tam randevu yönetimi", "Müşteri paneli + PWA", "Mesaj merkezi ve takipler"],
  Klinik: ["Klinik, danışmanlık ve yoğun takip isteyen işletmeler", "Gelişmiş işlem notları", "Güvenlik ve kayıt disiplini"],
  Enterprise: ["Çok şubeli yapı", "Özel entegrasyon hazırlığı", "Özel destek ve kurumsal süreç"],
};

function formatDate(value: unknown) {
  if (!value) return "Tarih yok";
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format((value as { toDate: () => Date }).toDate());
    } catch {
      return "Tarih okunamadı";
    }
  }
  return String(value);
}

export function BillingPanel({ tenantId, tenantName, contactEmail }: BillingPanelProps) {
  const [tenantPlan, setTenantPlan] = useState<TenantPlan>("Starter");
  const [tenantPlanStatus, setTenantPlanStatus] = useState("Deneme");
  const [selectedPlan, setSelectedPlan] = useState<TenantPlan>("Pro");
  const [billingName, setBillingName] = useState(tenantName);
  const [taxNumber, setTaxNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tenantId) return;
    const unsubscribe = listenTenantBilling(
      tenantId,
      (tenant) => {
        if (!tenant) return;
        setTenantPlan(tenant.plan || "Starter");
        setTenantPlanStatus(tenant.planStatus || "Deneme");
      },
      () => setError("Abonelik bilgisi okunamadı. Firestore kurallarını kontrol edin.")
    );
    return unsubscribe;
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    const unsubscribe = listenTenantPaymentRequests(
      tenantId,
      setPaymentRequests,
      () => setError("Ödeme talepleri okunamadı. Firestore kurallarını kontrol edin.")
    );
    return unsubscribe;
  }, [tenantId]);

  const currentPlanPrice = getPlanPrice(tenantPlan);
  const selectedPlanPrice = getPlanPrice(selectedPlan);
  const openRequest = useMemo(() => paymentRequests.find((request) => request.status === "Bekliyor"), [paymentRequests]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tenantId) return;

    setIsSubmitting(true);
    setNotice("");
    setError("");

    try {
      await createPaymentRequest({
        tenantId,
        tenantName,
        currentPlan: tenantPlan,
        requestedPlan: selectedPlan,
        amountLabel: selectedPlanPrice,
        billingName,
        taxNumber,
        billingAddress,
        contactEmail: contactEmail || "",
        note,
      });
      setNotice("Paket yükseltme / ödeme talebiniz süper admin paneline iletildi.");
      setNote("");
    } catch (err) {
      console.error("Ödeme talebi oluşturulamadı:", err);
      setError("Ödeme talebi oluşturulamadı. Firestore kurallarını veya bağlantıyı kontrol edin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="panel widePanel billingPanel">
      <div className="panelHeader">
        <div>
          <h3>Abonelik ve Ödeme</h3>
          <p>Paket yükseltme talebi oluşturun; süper admin ödeme durumunu merkezi panelden yönetsin.</p>
        </div>
        <span className="billingSecureBadge"><ShieldCheck size={16} /> Manuel ödeme hazırlığı</span>
      </div>

      {notice && <p className="formMessage successMessage">{notice}</p>}
      {error && <p className="formMessage errorMessage">{error}</p>}

      <div className="billingGrid">
        <section className="billingCurrentCard">
          <span><CreditCard size={18} /> Mevcut Paket</span>
          <strong>{planLabels[tenantPlan]}</strong>
          <p>{currentPlanPrice}</p>
          <i>{tenantPlanStatus}</i>
          {openRequest && <small>Bekleyen talep: {planLabels[openRequest.requestedPlan]} · {openRequest.amountLabel}</small>}
        </section>

        <section className="billingPlanCards">
          {(["Starter", "Pro", "Klinik", "Enterprise"] as TenantPlan[]).map((plan) => (
            <button
              key={plan}
              type="button"
              className={selectedPlan === plan ? "billingPlanCard active" : "billingPlanCard"}
              onClick={() => setSelectedPlan(plan)}
            >
              <span>{planLabels[plan]}</span>
              <strong>{getPlanPrice(plan)}</strong>
              <ul>{planDetails[plan].map((detail) => <li key={detail}>{detail}</li>)}</ul>
            </button>
          ))}
        </section>
      </div>

      <form className="billingForm" onSubmit={handleSubmit}>
        <label>
          Fatura / Yetkili Adı
          <input value={billingName} onChange={(event) => setBillingName(event.target.value)} required />
        </label>
        <label>
          Vergi / T.C. No
          <input value={taxNumber} onChange={(event) => setTaxNumber(event.target.value)} placeholder="İsteğe bağlı" />
        </label>
        <label className="billingWideInput">
          Fatura Adresi
          <input value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} placeholder="İsteğe bağlı" />
        </label>
        <label className="billingWideInput">
          Not
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ödeme yöntemi, banka açıklaması veya özel talep..." />
        </label>
        <button className="primaryButton" type="submit" disabled={isSubmitting}>
          <Sparkles size={18} /> {isSubmitting ? "Gönderiliyor..." : "Paket / Ödeme Talebi Oluştur"}
        </button>
      </form>

      <div className="billingHistory">
        <div className="panelHeader miniPanelHeader"><h4>Ödeme Talep Geçmişi</h4><span>{paymentRequests.length} kayıt</span></div>
        {paymentRequests.length === 0 ? (
          <p className="emptyState">Henüz ödeme talebi oluşturulmadı.</p>
        ) : paymentRequests.slice(0, 5).map((request) => (
          <article key={request.id}>
            <FileText size={16} />
            <div>
              <b>{planLabels[request.requestedPlan]} · {request.amountLabel}</b>
              <span>{request.status} · {formatDate(request.createdAt)}</span>
              {request.note && <small>{request.note}</small>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
