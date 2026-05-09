import { db } from "@/lib/firebase";
import type { AppointmentStatus, BookingRequest, CustomerActionRequest, Role, Sector, TenantPlan, TenantPlanStatus } from "@/types/domain";
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";

export interface SuperAdminTenant {
  id: string;
  name: string;
  sector: Sector;
  slug: string;
  ownerUid: string;
  isActive?: boolean;
  plan?: TenantPlan;
  planStatus?: TenantPlanStatus;
  trialEndsAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SuperAdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  tenantId?: string;
  tenantName?: string;
  sector?: Sector;
  customerId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SuperAdminCustomer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  sector?: Sector;
  createdAt?: unknown;
}

export interface SuperAdminAppointment {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  service: string;
  date?: string;
  time?: string;
  status: AppointmentStatus;
  sector?: Sector;
  createdAt?: unknown;
}

function normalizeSector(value: unknown): Sector {
  const sector = String(value || "beauty");
  if (["beauty", "clinic", "auto", "education", "consulting"].includes(sector)) {
    return sector as Sector;
  }
  return "beauty";
}


function normalizePlan(value: unknown): TenantPlan {
  const plan = String(value || "Starter");
  if (["Starter", "Pro", "Klinik", "Enterprise"].includes(plan)) {
    return plan as TenantPlan;
  }
  return "Starter";
}

function normalizePlanStatus(value: unknown): TenantPlanStatus {
  const status = String(value || "Deneme");
  if (["Deneme", "Aktif", "Askıda", "İptal"].includes(status)) {
    return status as TenantPlanStatus;
  }
  return "Deneme";
}

function normalizeRole(value: unknown): Role {
  const role = String(value || "owner");
  if (["super_admin", "owner", "manager", "staff", "customer"].includes(role)) {
    return role as Role;
  }
  return "owner";
}

export function listenSuperAdminTenants(onChange: (items: SuperAdminTenant[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    collection(db, "tenants"),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: String(data.name ?? "İsimsiz İşletme"),
          sector: normalizeSector(data.sector),
          slug: String(data.slug ?? ""),
          ownerUid: String(data.ownerUid ?? ""),
          isActive: data.isActive === false ? false : true,
          plan: normalizePlan(data.plan),
          planStatus: normalizePlanStatus(data.planStatus),
          trialEndsAt: data.trialEndsAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } satisfies SuperAdminTenant;
      });

      records.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      onChange(records);
    },
    (error) => {
      console.error("Süper admin işletme listesi okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenSuperAdminUsers(onChange: (items: SuperAdminUser[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          uid: String(data.uid ?? docSnap.id),
          email: String(data.email ?? ""),
          displayName: String(data.displayName ?? "İsimsiz Kullanıcı"),
          role: normalizeRole(data.role),
          tenantId: data.tenantId ? String(data.tenantId) : undefined,
          tenantName: data.tenantName ? String(data.tenantName) : undefined,
          sector: data.sector ? normalizeSector(data.sector) : undefined,
          customerId: data.customerId ? String(data.customerId) : undefined,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } satisfies SuperAdminUser;
      });

      records.sort((a, b) => a.displayName.localeCompare(b.displayName, "tr"));
      onChange(records);
    },
    (error) => {
      console.error("Süper admin kullanıcı listesi okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenSuperAdminCustomers(onChange: (items: SuperAdminCustomer[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    collection(db, "customers"),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          tenantId: String(data.tenantId ?? ""),
          name: String(data.name ?? "İsimsiz Müşteri"),
          phone: String(data.phone ?? ""),
          email: String(data.email ?? ""),
          sector: data.sector ? normalizeSector(data.sector) : undefined,
          createdAt: data.createdAt,
        } satisfies SuperAdminCustomer;
      });

      records.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      onChange(records);
    },
    (error) => {
      console.error("Süper admin müşteri listesi okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenSuperAdminAppointments(onChange: (items: SuperAdminAppointment[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    collection(db, "appointments"),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          tenantId: String(data.tenantId ?? ""),
          customerName: String(data.customerName ?? "İsimsiz Müşteri"),
          customerPhone: String(data.customerPhone ?? ""),
          service: String(data.service ?? "Randevu"),
          date: data.date ? String(data.date) : undefined,
          time: data.time ? String(data.time) : undefined,
          status: (data.status as AppointmentStatus) ?? "Bekliyor",
          sector: data.sector ? normalizeSector(data.sector) : undefined,
          createdAt: data.createdAt,
        } satisfies SuperAdminAppointment;
      });

      records.sort((a, b) => `${b.date ?? ""} ${b.time ?? ""}`.localeCompare(`${a.date ?? ""} ${a.time ?? ""}`, "tr"));
      onChange(records);
    },
    (error) => {
      console.error("Süper admin randevu listesi okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenSuperAdminBookingRequests(onChange: (items: BookingRequest[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    collection(db, "bookingRequests"),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          tenantId: String(data.tenantId ?? ""),
          tenantSlug: String(data.tenantSlug ?? ""),
          sector: normalizeSector(data.sector),
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
        } satisfies BookingRequest;
      });

      records.sort((a, b) => `${b.preferredDate} ${b.preferredTime}`.localeCompare(`${a.preferredDate} ${a.preferredTime}`, "tr"));
      onChange(records);
    },
    (error) => {
      console.error("Süper admin randevu talebi listesi okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenSuperAdminCustomerActionRequests(onChange: (items: CustomerActionRequest[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    collection(db, "customerActionRequests"),
    (snapshot) => {
      const records = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          tenantId: String(data.tenantId ?? ""),
          tenantSlug: String(data.tenantSlug ?? ""),
          customerId: String(data.customerId ?? ""),
          customerName: String(data.customerName ?? "İsimsiz Müşteri"),
          customerPhone: String(data.customerPhone ?? ""),
          appointmentId: data.appointmentId ? String(data.appointmentId) : undefined,
          appointmentService: data.appointmentService ? String(data.appointmentService) : undefined,
          appointmentDate: data.appointmentDate ? String(data.appointmentDate) : undefined,
          appointmentTime: data.appointmentTime ? String(data.appointmentTime) : undefined,
          type: data.type === "İptal" ? "İptal" : "Erteleme",
          message: String(data.message ?? ""),
          status: (data.status as CustomerActionRequest["status"]) ?? "Yeni Talep",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } satisfies CustomerActionRequest;
      });

      records.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""), "tr"));
      onChange(records);
    },
    (error) => {
      console.error("Süper admin müşteri aksiyon talebi listesi okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function updateTenantStatus(tenantId: string, isActive: boolean) {
  await updateDoc(doc(db, "tenants", tenantId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
}


export async function updateTenantPlan(tenantId: string, plan: TenantPlan, planStatus: TenantPlanStatus) {
  await updateDoc(doc(db, "tenants", tenantId), {
    plan,
    planStatus,
    updatedAt: serverTimestamp(),
  });
}
