import { db } from "@/lib/firebase";
import type { Customer, NewCustomerInput, Sector } from "@/types/domain";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";
  return parts.slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "").join("");
}

function buildSectorNotes(sector: Sector, sectorData: Record<string, string>, notes: string) {
  const filled = Object.entries(sectorData)
    .filter(([, value]) => value?.trim())
    .map(([key, value]) => `${key}: ${value.trim()}`)
    .join(" • ");

  return [filled, notes.trim()].filter(Boolean).join(". ") || "Yeni kayıt. İlk işlem sonrası detaylı not girilecek.";
}

function getNextAction(sector: Sector) {
  const actions: Record<Sector, string> = {
    beauty: "İlk işlem sonrası bakım ve tekrar randevu zamanı belirle.",
    clinic: "Kontrol veya bilgilendirme randevusu gerekiyorsa planla.",
    auto: "Araç için bakım geçmişini tamamla ve sonraki bakım zamanını belirle.",
    education: "Öğrenci için ilk görüşme notu ve takip planı oluştur.",
    consulting: "Görüşme sonrası özet ve sonraki adım planını hazırla.",
  };

  return actions[sector];
}

function normalizeCustomer(id: string, data: Record<string, unknown>): Customer {
  const name = String(data.name ?? "İsimsiz Kayıt");
  const sector = data.sector as Sector | undefined;
  const sectorData = (data.sectorData ?? {}) as Record<string, string>;

  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    name,
    phone: String(data.phone ?? ""),
    email: String(data.email ?? ""),
    avatar: String(data.avatar ?? getInitials(name)),
    lastVisit: String(data.lastVisit ?? "Henüz işlem yok"),
    historyCount: Number(data.historyCount ?? 0),
    notes: String(data.notes ?? buildSectorNotes(sector ?? "beauty", sectorData, "")),
    nextAction: String(data.nextAction ?? getNextAction(sector ?? "beauty")),
    segment: (data.segment as Customer["segment"]) ?? "Yeni",
    sector,
    sectorData,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function listenCustomers(tenantId: string, onChange: (customers: Customer[]) => void, onError?: (error: Error) => void) {
  const customersQuery = query(collection(db, "customers"), where("tenantId", "==", tenantId));

  return onSnapshot(
    customersQuery,
    (snapshot) => {
      const customers = snapshot.docs.map((docSnap) => normalizeCustomer(docSnap.id, docSnap.data()));
      customers.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      onChange(customers);
    },
    (error) => {
      console.error("Müşteriler okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function createCustomer(input: NewCustomerInput) {
  const notes = buildSectorNotes(input.sector, input.sectorData, input.notes);

  await addDoc(collection(db, "customers"), {
    tenantId: input.tenantId,
    sector: input.sector,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    avatar: getInitials(input.name),
    notes,
    nextAction: getNextAction(input.sector),
    historyCount: 0,
    lastVisit: "Henüz işlem yok",
    segment: "Yeni",
    sectorData: input.sectorData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
