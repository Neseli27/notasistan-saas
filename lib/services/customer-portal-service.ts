import { db } from "@/lib/firebase";
import type {
  Appointment,
  AppointmentNote,
  BookingRequest,
  Customer,
  CustomerActionRequest,
  PublicTenant,
  Sector,
  UserProfile,
} from "@/types/domain";
import type { User } from "firebase/auth";
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

function getCustomerNextAction(sector: Sector) {
  const actions: Record<Sector, string> = {
    beauty: "Bir sonraki bakım ve randevu zamanını panelden takip edin.",
    clinic: "Kontrol ve bilgilendirme adımlarınızı panelden takip edin.",
    auto: "Araç bakım geçmişinizi ve sonraki servis zamanınızı panelden takip edin.",
    education: "Görüşme, ödev ve takip adımlarınızı panelden izleyin.",
    consulting: "Görüşme özetleri ve sonraki adımlarınızı panelden takip edin.",
  };

  return actions[sector];
}

function normalizeAppointment(id: string, data: Record<string, unknown>): Appointment {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    customerId: data.customerId ? String(data.customerId) : undefined,
    date: String(data.date ?? ""),
    time: String(data.time ?? ""),
    customerName: String(data.customerName ?? "İsimsiz Kayıt"),
    customerPhone: String(data.customerPhone ?? ""),
    avatar: String(data.avatar ?? "NA"),
    service: String(data.service ?? "Randevu"),
    subService: String(data.subService ?? "Ön bilgi yok"),
    resourceName: String(data.resourceName ?? ""),
    resourceDetail: String(data.resourceDetail ?? ""),
    status: (data.status as Appointment["status"]) ?? "Bekliyor",
    notes: String(data.notes ?? ""),
    sector: data.sector as Sector | undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function normalizeAppointmentNote(id: string, data: Record<string, unknown>): AppointmentNote {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    appointmentId: String(data.appointmentId ?? ""),
    customerId: String(data.customerId ?? ""),
    customerName: String(data.customerName ?? ""),
    service: String(data.service ?? ""),
    rawNote: String(data.rawNote ?? ""),
    customerSummary: String(data.customerSummary ?? ""),
    internalNote: "",
    nextAction: String(data.nextAction ?? ""),
    followUpDate: String(data.followUpDate ?? ""),
    reminderChannel: (data.reminderChannel as AppointmentNote["reminderChannel"]) ?? "WhatsApp",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
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

function normalizeActionRequest(id: string, data: Record<string, unknown>): CustomerActionRequest {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    tenantSlug: String(data.tenantSlug ?? ""),
    customerId: String(data.customerId ?? ""),
    customerName: String(data.customerName ?? ""),
    customerPhone: String(data.customerPhone ?? ""),
    appointmentId: data.appointmentId ? String(data.appointmentId) : undefined,
    appointmentService: data.appointmentService ? String(data.appointmentService) : undefined,
    appointmentDate: data.appointmentDate ? String(data.appointmentDate) : undefined,
    appointmentTime: data.appointmentTime ? String(data.appointmentTime) : undefined,
    requestedDate: data.requestedDate ? String(data.requestedDate) : undefined,
    requestedTime: data.requestedTime ? String(data.requestedTime) : undefined,
    decisionMessage: data.decisionMessage ? String(data.decisionMessage) : undefined,
    handledBy: data.handledBy ? String(data.handledBy) : undefined,
    type: (data.type as CustomerActionRequest["type"]) ?? "Erteleme",
    message: String(data.message ?? ""),
    status: (data.status as CustomerActionRequest["status"]) ?? "Yeni Talep",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function registerCustomerPortalAccount(params: {
  user: User;
  tenant: PublicTenant;
  displayName: string;
  phone: string;
}) {
  const name = params.displayName.trim() || params.user.displayName || "Müşteri";
  const email = params.user.email || "";
  const phone = params.phone.trim();
  let customerId = "";

  if (phone) {
    const phoneQuery = query(
      collection(db, "customers"),
      where("tenantId", "==", params.tenant.tenantId),
      where("phone", "==", phone),
      limit(1)
    );
    const phoneSnapshot = await getDocs(phoneQuery);
    const existing = phoneSnapshot.docs[0];

    if (existing) {
      customerId = existing.id;
      await updateDoc(doc(db, "customers", customerId), {
        name,
        email,
        userId: params.user.uid,
        portalEnabled: true,
        updatedAt: serverTimestamp(),
      });
    }
  }

  if (!customerId && email) {
    const emailQuery = query(
      collection(db, "customers"),
      where("tenantId", "==", params.tenant.tenantId),
      where("email", "==", email),
      limit(1)
    );
    const emailSnapshot = await getDocs(emailQuery);
    const existing = emailSnapshot.docs[0];

    if (existing) {
      customerId = existing.id;
      await updateDoc(doc(db, "customers", customerId), {
        name,
        phone,
        userId: params.user.uid,
        portalEnabled: true,
        updatedAt: serverTimestamp(),
      });
    }
  }

  if (!customerId) {
    const customerDoc = await addDoc(collection(db, "customers"), {
      tenantId: params.tenant.tenantId,
      sector: params.tenant.sector,
      name,
      phone,
      email,
      userId: params.user.uid,
      portalEnabled: true,
      avatar: getInitials(name),
      notes: "Müşteri paneli üzerinden kayıt oluşturuldu.",
      nextAction: getCustomerNextAction(params.tenant.sector),
      historyCount: 0,
      lastVisit: "Müşteri paneli kaydı",
      segment: "Yeni",
      sectorData: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    customerId = customerDoc.id;
  }

  const profile: UserProfile = {
    uid: params.user.uid,
    email,
    displayName: name,
    role: "customer",
    tenantId: params.tenant.tenantId,
    tenantName: params.tenant.name,
    tenantSlug: params.tenant.slug,
    sector: params.tenant.sector,
    customerId,
    customerPhone: phone,
  };

  await setDoc(doc(db, "users", params.user.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profile;
}

export function listenCustomerAppointments(
  profile: UserProfile,
  onChange: (appointments: Appointment[]) => void,
  onError?: (error: Error) => void
) {
  if (!profile.customerId) return () => undefined;

  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("tenantId", "==", profile.tenantId),
    where("customerId", "==", profile.customerId)
  );

  return onSnapshot(
    appointmentsQuery,
    (snapshot) => {
      const appointments = snapshot.docs.map((docSnap) => normalizeAppointment(docSnap.id, docSnap.data()));
      appointments.sort((a, b) => `${a.date ?? ""} ${a.time}`.localeCompare(`${b.date ?? ""} ${b.time}`, "tr"));
      onChange(appointments);
    },
    (error) => {
      console.error("Müşteri randevuları okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenCustomerBookingRequests(
  profile: UserProfile,
  onChange: (requests: BookingRequest[]) => void,
  onError?: (error: Error) => void
) {
  if (!profile.customerPhone) return () => undefined;

  const requestsQuery = query(
    collection(db, "bookingRequests"),
    where("tenantId", "==", profile.tenantId),
    where("customerPhone", "==", profile.customerPhone)
  );

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => normalizeBookingRequest(docSnap.id, docSnap.data()));
      requests.sort((a, b) => `${a.preferredDate} ${a.preferredTime}`.localeCompare(`${b.preferredDate} ${b.preferredTime}`, "tr"));
      onChange(requests);
    },
    (error) => {
      console.error("Müşteri randevu talepleri okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenCustomerAppointmentNotes(
  profile: UserProfile,
  onChange: (notes: AppointmentNote[]) => void,
  onError?: (error: Error) => void
) {
  if (!profile.customerId) return () => undefined;

  const notesQuery = query(
    collection(db, "appointmentNotes"),
    where("tenantId", "==", profile.tenantId),
    where("customerId", "==", profile.customerId)
  );

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      const notes = snapshot.docs.map((docSnap) => normalizeAppointmentNote(docSnap.id, docSnap.data()));
      onChange(notes);
    },
    (error) => {
      console.error("Müşteri işlem özetleri okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenCustomerActionRequests(
  profile: UserProfile,
  onChange: (requests: CustomerActionRequest[]) => void,
  onError?: (error: Error) => void
) {
  if (!profile.customerId) return () => undefined;

  const requestsQuery = query(
    collection(db, "customerActionRequests"),
    where("tenantId", "==", profile.tenantId),
    where("customerId", "==", profile.customerId)
  );

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => normalizeActionRequest(docSnap.id, docSnap.data()));
      requests.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""), "tr"));
      onChange(requests);
    },
    (error) => {
      console.error("Müşteri erteleme/iptal talepleri okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function createCustomerActionRequest(input: {
  profile: UserProfile;
  appointment: Appointment;
  type: "Erteleme" | "İptal";
  message: string;
}) {
  await addDoc(collection(db, "customerActionRequests"), {
    tenantId: input.profile.tenantId,
    tenantSlug: input.profile.tenantSlug || "",
    customerId: input.profile.customerId || "",
    customerName: input.profile.displayName,
    customerPhone: input.profile.customerPhone || "",
    appointmentId: input.appointment.id,
    appointmentService: input.appointment.service,
    appointmentDate: input.appointment.date || "",
    appointmentTime: input.appointment.time || "",
    type: input.type,
    message: input.message.trim(),
    status: "Yeni Talep",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function listenTenantCustomerActionRequests(
  tenantId: string,
  onChange: (requests: CustomerActionRequest[]) => void,
  onError?: (error: Error) => void
) {
  const requestsQuery = query(collection(db, "customerActionRequests"), where("tenantId", "==", tenantId));

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => normalizeActionRequest(docSnap.id, docSnap.data()));
      requests.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""), "tr"));
      onChange(requests);
    },
    (error) => {
      console.error("İşletme müşteri işlem talepleri okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function updateCustomerActionRequestStatus(input: {
  request: CustomerActionRequest;
  status: CustomerActionRequest["status"];
  handledBy?: string;
}) {
  await updateDoc(doc(db, "customerActionRequests", input.request.id), {
    status: input.status,
    handledBy: input.handledBy || "",
    updatedAt: serverTimestamp(),
  });
}

export function buildCustomerActionResponseMessage(input: {
  request: CustomerActionRequest;
  tenantName?: string;
  approved: boolean;
}) {
  const { request, tenantName, approved } = input;
  const brand = tenantName || "İşletmemiz";

  if (approved) {
    if (request.decisionMessage) return request.decisionMessage;

    if (request.type === "İptal") {
      return `Merhaba ${request.customerName}, ${request.appointmentDate || ""} ${request.appointmentTime || ""} tarihli ${request.appointmentService || "randevu"} için ilettiğiniz iptal talebi alınmış ve işleme alınmıştır. ${brand} olarak sizi yeniden ağırlamaktan memnuniyet duyarız.`;
    }

    if (request.requestedDate && request.requestedTime) {
      return `Merhaba ${request.customerName}, ${brand} için ${request.appointmentService || "randevu"} erteleme talebiniz onaylandı. Yeni randevu zamanınız: ${request.requestedDate} saat ${request.requestedTime}. Görüşmek üzere.`;
    }

    return `Merhaba ${request.customerName}, ${request.appointmentDate || ""} ${request.appointmentTime || ""} tarihli ${request.appointmentService || "randevu"} için ilettiğiniz erteleme talebi alınmıştır. Size uygun yeni saat için işletmemiz en kısa sürede dönüş yapacaktır. ${brand}`;
  }

  if (request.type === "İptal") {
    return `Merhaba ${request.customerName}, ${request.appointmentService || "randevu"} için ilettiğiniz iptal talebini aldık. İşletmemiz uygunluk durumunu kontrol ederek sizinle ayrıca iletişime geçecektir. ${brand}`;
  }

  return `Merhaba ${request.customerName}, ${request.appointmentService || "randevu"} için ilettiğiniz erteleme talebini aldık. Şu an uygunluk kontrolü yapılmaktadır; net bilgi için sizinle iletişime geçeceğiz. ${brand}`;
}

export async function completeCustomerRescheduleRequest(input: {
  request: CustomerActionRequest;
  newDate: string;
  newTime: string;
  tenantName?: string;
  handledBy?: string;
}) {
  if (!input.request.appointmentId) {
    throw new Error("Erteleme talebine bağlı randevu bulunamadı.");
  }

  if (!input.newDate || !input.newTime) {
    throw new Error("Yeni tarih ve saat gereklidir.");
  }

  const appointmentRef = doc(db, "appointments", input.request.appointmentId);
  const appointmentSnap = await getDoc(appointmentRef);
  const appointmentData = appointmentSnap.exists() ? appointmentSnap.data() : {};
  const previousStatus = String(appointmentData.status ?? "Bekliyor");
  const service = String(appointmentData.service ?? input.request.appointmentService ?? "Randevu");
  const previousDate = String(appointmentData.date ?? input.request.appointmentDate ?? "");
  const previousTime = String(appointmentData.time ?? input.request.appointmentTime ?? "");
  const brand = input.tenantName || "İşletmemiz";
  const message = `Merhaba ${input.request.customerName}, ${brand} için ${service} erteleme talebiniz onaylandı. Önceki randevunuz ${previousDate} ${previousTime} idi. Yeni randevu zamanınız: ${input.newDate} saat ${input.newTime}. Görüşmek üzere.`;

  await updateDoc(appointmentRef, {
    date: input.newDate,
    time: input.newTime,
    status: "Onaylandı",
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "customerActionRequests", input.request.id), {
    status: "Tamamlandı",
    requestedDate: input.newDate,
    requestedTime: input.newTime,
    handledBy: input.handledBy || "",
    decisionMessage: message,
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "appointmentStatusLogs"), {
    tenantId: input.request.tenantId,
    appointmentId: input.request.appointmentId,
    customerId: input.request.customerId || "",
    customerName: input.request.customerName,
    customerPhone: input.request.customerPhone,
    service,
    previousStatus,
    newStatus: "Onaylandı",
    previousDate,
    previousTime,
    newDate: input.newDate,
    newTime: input.newTime,
    message,
    updatedBy: input.handledBy || "",
    actionType: "Erteleme Talebi Onayı",
    createdAt: serverTimestamp(),
  });

  return message;
}
