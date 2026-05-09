import { db } from "@/lib/firebase";
import type { BookingRequest, NewBookingRequestInput, PublicTenant, Sector } from "@/types/domain";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
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
