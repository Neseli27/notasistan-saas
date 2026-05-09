import { db } from "@/lib/firebase";
import type { BookingRequest, NewBookingRequestInput, PublicTenant, Sector } from "@/types/domain";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}

function buildSectorDataFromRequest(sector: Sector, request: BookingRequest): Record<string, string> {
  if (sector === "auto") {
    return {
      "Araç": "Talep sonrası tamamlanacak",
      "Plaka": "Talep sonrası tamamlanacak",
      "Kilometre / yakıt": "Talep sonrası tamamlanacak",
    };
  }

  if (sector === "clinic") {
    return {
      "Kontrol / işlem konusu": request.service,
      "Tercih notu": request.notes || "Public randevu talebi",
    };
  }

  if (sector === "education") {
    return {
      "Görüşme konusu": request.service,
      "Veli": request.customerName,
    };
  }

  if (sector === "consulting") {
    return {
      "Görüşme konusu": request.service,
      "Kurum / şirket": "Talep sonrası tamamlanacak",
    };
  }

  return {
    "İlk talep": request.service,
    "Tercih / not": request.notes || "Public randevu talebi",
  };
}

function getPublicRequestNextAction(sector: Sector) {
  const actions: Record<Sector, string> = {
    beauty: "Randevu teyidi gönder ve işlem öncesi hazırlık notlarını paylaş.",
    clinic: "Randevu teyidi gönder; gerekli ön bilgilendirmeyi yetkili personel kontrolünden sonra paylaş.",
    auto: "Araç bilgilerini tamamla, randevu saatini teyit et ve servis kabul notunu hazırla.",
    education: "Veli/öğrenci ile görüşme saatini teyit et ve ön değerlendirme notu hazırla.",
    consulting: "Görüşme saatini teyit et ve toplantı gündemini oluştur.",
  };

  return actions[sector];
}

function normalizeBookingRequest(id: string, data: Record<string, unknown>): BookingRequest {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    tenantSlug: String(data.tenantSlug ?? ""),
    sector: data.sector as Sector,
    customerName: String(data.customerName ?? "İsimsiz Talep"),
    customerPhone: String(data.customerPhone ?? ""),
    customerEmail: String(data.customerEmail ?? ""),
    service: String(data.service ?? "Randevu Talebi"),
    preferredDate: String(data.preferredDate ?? ""),
    preferredTime: String(data.preferredTime ?? ""),
    notes: String(data.notes ?? ""),
    status: (data.status as BookingRequest["status"]) ?? "Yeni Talep",
    source: String(data.source ?? "public-pwa"),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getPublicTenantBySlug(slug: string): Promise<PublicTenant | null> {
  const safeSlug = slug.trim().toLocaleLowerCase("tr-TR");
  if (!safeSlug) return null;

  const snapshot = await getDoc(doc(db, "publicTenants", safeSlug));
  if (!snapshot.exists()) return null;

  return snapshot.data() as PublicTenant;
}

export async function ensurePublicTenant(profile: {
  tenantId: string;
  tenantName: string;
  sector: Sector;
}) {
  const slug = profile.tenantName
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!slug) return null;

  await setDoc(
    doc(db, "publicTenants", slug),
    {
      tenantId: profile.tenantId,
      name: profile.tenantName,
      sector: profile.sector,
      slug,
      isActive: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return slug;
}

export async function createPublicBookingRequest(input: NewBookingRequestInput) {
  await addDoc(collection(db, "bookingRequests"), {
    tenantId: input.tenantId,
    tenantSlug: input.tenantSlug,
    sector: input.sector,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    customerEmail: input.customerEmail.trim(),
    customerAvatar: getInitials(input.customerName),
    service: input.service.trim(),
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    notes: input.notes.trim(),
    status: "Yeni Talep",
    source: "public-pwa",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function listenBookingRequests(
  tenantId: string,
  onChange: (requests: BookingRequest[]) => void,
  onError?: (error: Error) => void
) {
  const requestsQuery = query(collection(db, "bookingRequests"), where("tenantId", "==", tenantId));

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => normalizeBookingRequest(docSnap.id, docSnap.data()));
      requests.sort((a, b) => `${a.preferredDate} ${a.preferredTime}`.localeCompare(`${b.preferredDate} ${b.preferredTime}`, "tr"));
      onChange(requests);
    },
    (error) => {
      console.error("Randevu talepleri okunamadı:", error);
      onError?.(error as Error);
    }
  );
}


export async function convertBookingRequestToAppointment(input: {
  tenantId: string;
  sector: Sector;
  request: BookingRequest;
}) {
  const request = input.request;
  const normalizedPhone = request.customerPhone.trim();
  let customerId = "";
  let customerAvatar = getInitials(request.customerName);
  let customerNotes = request.notes.trim() || "Public randevu talebi üzerinden oluşturuldu.";

  if (normalizedPhone) {
    const existingCustomerQuery = query(
      collection(db, "customers"),
      where("tenantId", "==", input.tenantId),
      where("phone", "==", normalizedPhone),
      limit(1)
    );
    const existingCustomerSnapshot = await getDocs(existingCustomerQuery);
    const existingCustomer = existingCustomerSnapshot.docs[0];

    if (existingCustomer) {
      customerId = existingCustomer.id;
      const existingData = existingCustomer.data();
      customerAvatar = String(existingData.avatar ?? customerAvatar);
      customerNotes = [String(existingData.notes ?? "").trim(), request.notes.trim()].filter(Boolean).join(". ");
    }
  }

  if (!customerId) {
    const customerDoc = await addDoc(collection(db, "customers"), {
      tenantId: input.tenantId,
      sector: input.sector,
      name: request.customerName.trim(),
      phone: normalizedPhone,
      email: request.customerEmail.trim(),
      avatar: customerAvatar,
      notes: customerNotes,
      nextAction: getPublicRequestNextAction(input.sector),
      historyCount: 0,
      lastVisit: "Public talep alındı",
      segment: "Yeni",
      sectorData: buildSectorDataFromRequest(input.sector, request),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    customerId = customerDoc.id;
  }

  await addDoc(collection(db, "appointments"), {
    tenantId: input.tenantId,
    sector: input.sector,
    customerId,
    customerName: request.customerName.trim(),
    customerPhone: normalizedPhone,
    avatar: customerAvatar,
    date: request.preferredDate,
    time: request.preferredTime,
    service: request.service.trim(),
    subService: request.notes.trim() || "Public randevu talebi",
    resourceName: input.sector === "auto" ? "Araç bilgisi talep sonrası tamamlanacak" : "",
    resourceDetail: input.sector === "auto" ? "Plaka bilgisi talep sonrası tamamlanacak" : "",
    status: "Bekliyor",
    notes: request.notes.trim(),
    bookingRequestId: request.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "bookingRequests", request.id), {
    status: "Randevuya Çevrildi",
    convertedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markBookingRequestSeen(requestId: string) {
  await updateDoc(doc(db, "bookingRequests", requestId), {
    status: "Görüldü",
    updatedAt: serverTimestamp(),
  });
}


export async function rejectBookingRequest(requestId: string) {
  await updateDoc(doc(db, "bookingRequests", requestId), {
    status: "Reddedildi",
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
