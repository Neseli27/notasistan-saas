import { db } from "@/lib/firebase";
import type { NewServiceItemInput, NewStaffMemberInput, Sector, ServiceItem, StaffMember } from "@/types/domain";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

function normalizeStaffMember(id: string, data: Record<string, unknown>): StaffMember {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    sector: data.sector as Sector,
    name: String(data.name ?? "İsimsiz Personel"),
    title: String(data.title ?? "Personel"),
    phone: String(data.phone ?? ""),
    email: String(data.email ?? ""),
    specialty: String(data.specialty ?? ""),
    isActive: Boolean(data.isActive ?? true),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function normalizeServiceItem(id: string, data: Record<string, unknown>): ServiceItem {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    sector: data.sector as Sector,
    name: String(data.name ?? "Hizmet"),
    category: String(data.category ?? "Genel"),
    durationMinutes: Number(data.durationMinutes ?? 45),
    price: Number(data.price ?? 0),
    isActive: Boolean(data.isActive ?? true),
    isPublic: Boolean(data.isPublic ?? true),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function listenStaffMembers(
  tenantId: string,
  onChange: (items: StaffMember[]) => void,
  onError?: (error: Error) => void
) {
  const staffQuery = query(collection(db, "staff"), where("tenantId", "==", tenantId));

  return onSnapshot(
    staffQuery,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => normalizeStaffMember(docSnap.id, docSnap.data()));
      items.sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name, "tr"));
      onChange(items);
    },
    (error) => {
      console.error("Personel kayıtları okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenServiceItems(
  tenantId: string,
  onChange: (items: ServiceItem[]) => void,
  onError?: (error: Error) => void
) {
  const servicesQuery = query(collection(db, "services"), where("tenantId", "==", tenantId));

  return onSnapshot(
    servicesQuery,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => normalizeServiceItem(docSnap.id, docSnap.data()));
      items.sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.category.localeCompare(b.category, "tr") || a.name.localeCompare(b.name, "tr"));
      onChange(items);
    },
    (error) => {
      console.error("Hizmet kayıtları okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenPublicServiceItems(
  tenantId: string,
  onChange: (items: ServiceItem[]) => void,
  onError?: (error: Error) => void
) {
  const servicesQuery = query(
    collection(db, "services"),
    where("tenantId", "==", tenantId),
    where("isActive", "==", true),
    where("isPublic", "==", true)
  );

  return onSnapshot(
    servicesQuery,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => normalizeServiceItem(docSnap.id, docSnap.data()));
      items.sort((a, b) => a.category.localeCompare(b.category, "tr") || a.name.localeCompare(b.name, "tr"));
      onChange(items);
    },
    (error) => {
      console.error("Public hizmet kayıtları okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function createStaffMember(input: NewStaffMemberInput) {
  await addDoc(collection(db, "staff"), {
    tenantId: input.tenantId,
    sector: input.sector,
    name: input.name.trim(),
    title: input.title.trim() || "Personel",
    phone: input.phone.trim(),
    email: input.email.trim(),
    specialty: input.specialty.trim(),
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function createServiceItem(input: NewServiceItemInput) {
  await addDoc(collection(db, "services"), {
    tenantId: input.tenantId,
    sector: input.sector,
    name: input.name.trim(),
    category: input.category.trim() || "Genel",
    durationMinutes: Number(input.durationMinutes) || 45,
    price: Number(input.price) || 0,
    isActive: true,
    isPublic: input.isPublic,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateStaffMemberStatus(staffId: string, isActive: boolean) {
  await updateDoc(doc(db, "staff", staffId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

export async function updateServiceItemStatus(serviceId: string, isActive: boolean) {
  await updateDoc(doc(db, "services", serviceId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

export async function updateServiceItemVisibility(serviceId: string, isPublic: boolean) {
  await updateDoc(doc(db, "services", serviceId), {
    isPublic,
    updatedAt: serverTimestamp(),
  });
}
