import { db } from "@/lib/firebase";
import type { Appointment, NewAppointmentInput, Sector } from "@/types/domain";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

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


export async function updateAppointmentStatus(appointmentId: string, status: Appointment["status"]) {
  await updateDoc(doc(db, "appointments", appointmentId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
