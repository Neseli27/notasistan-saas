import { db } from "@/lib/firebase";
import type { NewPaymentRequestInput, PaymentRequest, PaymentRequestStatus, Tenant, TenantPlan, TenantPlanStatus } from "@/types/domain";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

const planPrices: Record<TenantPlan, string> = {
  Starter: "₺0 / deneme",
  Pro: "₺799 / ay",
  Klinik: "₺1.499 / ay",
  Enterprise: "Özel teklif",
};

function normalizePlan(value: unknown): TenantPlan {
  const plan = String(value || "Starter");
  if (["Starter", "Pro", "Klinik", "Enterprise"].includes(plan)) return plan as TenantPlan;
  return "Starter";
}

function normalizePlanStatus(value: unknown): TenantPlanStatus {
  const status = String(value || "Deneme");
  if (["Deneme", "Aktif", "Askıda", "İptal"].includes(status)) return status as TenantPlanStatus;
  return "Deneme";
}

function normalizePaymentStatus(value: unknown): PaymentRequestStatus {
  const status = String(value || "Bekliyor");
  if (["Bekliyor", "Ödeme Alındı", "Reddedildi", "İptal"].includes(status)) return status as PaymentRequestStatus;
  return "Bekliyor";
}

function mapPaymentRequest(id: string, data: Record<string, unknown>): PaymentRequest {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    tenantName: String(data.tenantName ?? "İşletme"),
    requestedPlan: normalizePlan(data.requestedPlan),
    currentPlan: data.currentPlan ? normalizePlan(data.currentPlan) : undefined,
    amountLabel: String(data.amountLabel ?? planPrices[normalizePlan(data.requestedPlan)]),
    billingName: String(data.billingName ?? ""),
    taxNumber: String(data.taxNumber ?? ""),
    billingAddress: String(data.billingAddress ?? ""),
    contactEmail: String(data.contactEmail ?? ""),
    note: String(data.note ?? ""),
    status: normalizePaymentStatus(data.status),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    handledAt: data.handledAt,
    handledBy: data.handledBy ? String(data.handledBy) : undefined,
  };
}

export function getPlanPrice(plan: TenantPlan) {
  return planPrices[plan];
}

export function listenTenantBilling(tenantId: string, onChange: (tenant: Pick<Tenant, "id" | "name" | "plan" | "planStatus"> | null) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    doc(db, "tenants", tenantId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      const data = snapshot.data();
      onChange({
        id: snapshot.id,
        name: String(data.name ?? "İşletme"),
        plan: normalizePlan(data.plan),
        planStatus: normalizePlanStatus(data.planStatus),
      });
    },
    (error) => {
      console.error("Abonelik bilgisi okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenTenantPaymentRequests(tenantId: string, onChange: (items: PaymentRequest[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    query(collection(db, "paymentRequests"), where("tenantId", "==", tenantId)),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => mapPaymentRequest(docSnap.id, docSnap.data()));
      records.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""), "tr"));
      onChange(records);
    },
    (error) => {
      console.error("Ödeme talepleri okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function createPaymentRequest(input: NewPaymentRequestInput) {
  await addDoc(collection(db, "paymentRequests"), {
    ...input,
    status: "Bekliyor" satisfies PaymentRequestStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updatePaymentRequestStatus(requestId: string, status: PaymentRequestStatus, handledBy?: string) {
  await updateDoc(doc(db, "paymentRequests", requestId), {
    status,
    handledBy: handledBy || "Süper Admin",
    handledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
