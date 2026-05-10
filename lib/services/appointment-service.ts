import { db } from "@/lib/firebase";
import type { Appointment, AppointmentStatusLog, NewAppointmentInput, Sector, UpdateAppointmentInput } from "@/types/domain";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

function getCustomerResource(sector: Sector, sectorData?: Record<string, string>) {
  if (!sectorData) return { resourceName: "", resourceDetail: "" };

  if (sector === "auto") {
    return {
      resourceName: sectorData["Araç"] || "Araç bilgisi yok",
      resourceDetail: sectorData["Plaka"] || sectorData["Kilometre / yakıt"] || "Plaka yok",
    };
  }

  if (sector === "education") {
    return {
      resourceName: sectorData["Sınıf / seviye"] || "Seviye belirtilmedi",
      resourceDetail: sectorData["Veli"] || "Veli bilgisi yok",
    };
  }

  if (sector === "consulting") {
    return {
      resourceName: sectorData["Kurum / şirket"] || "Dosya bilgisi yok",
      resourceDetail: sectorData["Görüşme konusu"] || "Konu belirtilmedi",
    };
  }

  return { resourceName: "", resourceDetail: "" };
}

function normalizeAppointment(id: string, data: Record<string, unknown>): Appointment {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    customerId: String(data.customerId ?? ""),
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

function normalizeStatusLog(id: string, data: Record<string, unknown>): AppointmentStatusLog {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    appointmentId: String(data.appointmentId ?? ""),
    customerId: data.customerId ? String(data.customerId) : undefined,
    customerName: String(data.customerName ?? "İsimsiz Kayıt"),
    customerPhone: String(data.customerPhone ?? ""),
    service: String(data.service ?? "Randevu"),
    previousStatus: (data.previousStatus as Appointment["status"]) ?? "Bekliyor",
    newStatus: (data.newStatus as Appointment["status"]) ?? "Bekliyor",
    message: String(data.message ?? ""),
    createdAt: data.createdAt,
    updatedBy: data.updatedBy ? String(data.updatedBy) : undefined,
  };
}

export function buildAppointmentStatusMessage(appointment: Appointment, status: Appointment["status"], tenantName?: string) {
  const businessName = tenantName || "Not Asistan";
  const dateText = [appointment.date, appointment.time].filter(Boolean).join(" ");
  const serviceText = appointment.service || "randevunuz";

  if (status === "Onaylandı") {
    return `Merhaba ${appointment.customerName}, ${businessName} için ${serviceText} randevunuz onaylandı. Randevu zamanı: ${dateText}. Sizi bekliyoruz.`;
  }

  if (status === "Tamamlandı") {
    return `Merhaba ${appointment.customerName}, ${businessName} ziyaretiniz için teşekkür ederiz. ${serviceText} işleminiz tamamlandı. Bir sonraki takip veya hatırlatma için sizinle gerektiğinde iletişime geçeceğiz.`;
  }

  if (status === "Gelmedi") {
    return `Merhaba ${appointment.customerName}, ${businessName} için planlanan ${serviceText} randevunuza katılamadığınızı gördük. Uygun olduğunuzda yeni bir randevu planlayabiliriz.`;
  }

  if (status === "İptal") {
    return `Merhaba ${appointment.customerName}, ${businessName} için ${dateText} tarihli ${serviceText} randevunuz iptal edilmiştir. Yeni bir zaman belirlemek isterseniz bizimle iletişime geçebilirsiniz.`;
  }

  return `Merhaba ${appointment.customerName}, ${businessName} için ${serviceText} randevunuz bekleme durumundadır. Uygunluk netleştiğinde sizinle iletişime geçeceğiz.`;
}

export function listenAppointments(tenantId: string, onChange: (appointments: Appointment[]) => void, onError?: (error: Error) => void) {
  const appointmentsQuery = query(collection(db, "appointments"), where("tenantId", "==", tenantId));

  return onSnapshot(
    appointmentsQuery,
    (snapshot) => {
      const appointments = snapshot.docs.map((docSnap) => normalizeAppointment(docSnap.id, docSnap.data()));
      appointments.sort((a, b) => `${a.date ?? ""} ${a.time}`.localeCompare(`${b.date ?? ""} ${b.time}`, "tr"));
      onChange(appointments);
    },
    (error) => {
      console.error("Randevular okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenAppointmentStatusLogs(tenantId: string, onChange: (logs: AppointmentStatusLog[]) => void, onError?: (error: Error) => void) {
  const logsQuery = query(collection(db, "appointmentStatusLogs"), where("tenantId", "==", tenantId));

  return onSnapshot(
    logsQuery,
    (snapshot) => {
      const logs = snapshot.docs.map((docSnap) => normalizeStatusLog(docSnap.id, docSnap.data()));
      logs.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""), "tr"));
      onChange(logs);
    },
    (error) => {
      console.error("Randevu durum geçmişi okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function createAppointment(input: NewAppointmentInput) {
  const resource = getCustomerResource(input.sector, input.customer.sectorData);

  await addDoc(collection(db, "appointments"), {
    tenantId: input.tenantId,
    sector: input.sector,
    customerId: input.customer.id,
    customerName: input.customer.name.trim(),
    customerPhone: input.customer.phone.trim(),
    avatar: input.customer.avatar,
    date: input.date,
    time: input.time,
    service: input.service.trim(),
    subService: input.subService.trim() || input.notes.trim() || "Ön not yok",
    resourceName: resource.resourceName,
    resourceDetail: resource.resourceDetail,
    status: input.status,
    notes: input.notes.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateAppointmentStatus(appointment: Appointment, status: Appointment["status"], tenantName?: string, updatedBy?: string) {
  if (!appointment.id) throw new Error("Randevu kimliği bulunamadı.");

  const message = buildAppointmentStatusMessage(appointment, status, tenantName);

  await updateDoc(doc(db, "appointments", appointment.id), {
    status,
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "appointmentStatusLogs"), {
    tenantId: appointment.tenantId,
    appointmentId: appointment.id,
    customerId: appointment.customerId || "",
    customerName: appointment.customerName,
    customerPhone: appointment.customerPhone,
    service: appointment.service,
    previousStatus: appointment.status,
    newStatus: status,
    message,
    updatedBy: updatedBy || "",
    createdAt: serverTimestamp(),
  });

  return message;
}


export async function updateAppointment(input: UpdateAppointmentInput) {
  if (!input.appointmentId) throw new Error("Randevu kimliği bulunamadı.");

  await updateDoc(doc(db, "appointments", input.appointmentId), {
    date: input.date,
    time: input.time,
    service: input.service.trim(),
    subService: input.subService.trim() || input.notes.trim() || "Ön not yok",
    status: input.status,
    notes: input.notes.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAppointment(appointmentId: string) {
  if (!appointmentId) throw new Error("Randevu kimliği bulunamadı.");
  await deleteDoc(doc(db, "appointments", appointmentId));
}

export async function rescheduleAppointment(appointment: Appointment, newDate: string, newTime: string, tenantName?: string, updatedBy?: string) {
  if (!appointment.id) throw new Error("Randevu kimliği bulunamadı.");

  const previousTime = [appointment.date, appointment.time].filter(Boolean).join(" ");
  const newTimeText = [newDate, newTime].filter(Boolean).join(" ");
  const businessName = tenantName || "Not Asistan";
  const message = `Merhaba ${appointment.customerName}, ${businessName} için ${appointment.service} randevunuz ${previousTime} zamanından ${newTimeText} zamanına ertelenmiştir. Sizi bekliyoruz.`;

  await updateDoc(doc(db, "appointments", appointment.id), {
    date: newDate,
    time: newTime,
    status: "Onaylandı",
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "appointmentStatusLogs"), {
    tenantId: appointment.tenantId,
    appointmentId: appointment.id,
    customerId: appointment.customerId || "",
    customerName: appointment.customerName,
    customerPhone: appointment.customerPhone,
    service: appointment.service,
    previousStatus: appointment.status,
    newStatus: "Onaylandı",
    message,
    updatedBy: updatedBy || "",
    createdAt: serverTimestamp(),
  });

  return message;
}
