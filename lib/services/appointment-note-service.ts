import { db } from "@/lib/firebase";
import type { AppointmentNote, FollowUp, NewAppointmentNoteInput, Reminder, ReminderChannel } from "@/types/domain";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

function normalizeText(value: unknown, fallback = "") {
  return String(value ?? fallback).trim();
}

function formatDateLabel(dateValue: string) {
  if (!dateValue) return "Tarih yok";

  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return dateValue;

  const today = new Date();
  const target = new Date(year, month - 1, day);
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((target.getTime() - todayOnly.getTime()) / 86400000);

  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  if (diff === -1) return "Dün";

  return target.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function getFollowUpTone(dateValue: string): FollowUp["tone"] {
  if (!dateValue) return "blue";
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return "blue";

  const today = new Date();
  const target = new Date(year, month - 1, day);
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((target.getTime() - todayOnly.getTime()) / 86400000);

  if (diff < 0) return "red";
  if (diff === 0) return "orange";
  if (diff === 1) return "green";
  return "blue";
}

function normalizeAppointmentNote(id: string, data: Record<string, unknown>): AppointmentNote {
  return {
    id,
    tenantId: normalizeText(data.tenantId),
    appointmentId: normalizeText(data.appointmentId),
    customerId: normalizeText(data.customerId),
    customerName: normalizeText(data.customerName, "İsimsiz Kayıt"),
    service: normalizeText(data.service, "İşlem"),
    rawNote: normalizeText(data.rawNote),
    customerSummary: normalizeText(data.customerSummary),
    internalNote: normalizeText(data.internalNote),
    nextAction: normalizeText(data.nextAction),
    followUpDate: normalizeText(data.followUpDate),
    reminderChannel: (data.reminderChannel as ReminderChannel) ?? "WhatsApp",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function normalizeFollowUp(id: string, data: Record<string, unknown>): FollowUp {
  const dueDate = normalizeText(data.dueDate);
  return {
    id,
    tenantId: normalizeText(data.tenantId),
    appointmentId: normalizeText(data.appointmentId),
    customerId: normalizeText(data.customerId),
    customerName: normalizeText(data.customerName, "İsimsiz Kayıt"),
    description: normalizeText(data.description, "Takip yapılacak"),
    dueLabel: normalizeText(data.dueLabel, formatDateLabel(dueDate)),
    dueDate,
    tone: (data.tone as FollowUp["tone"]) ?? getFollowUpTone(dueDate),
    status: (data.status as FollowUp["status"]) ?? "Açık",
    createdAt: data.createdAt,
  };
}

function normalizeReminder(id: string, data: Record<string, unknown>): Reminder {
  const dueDate = normalizeText(data.dueDate);
  return {
    id,
    tenantId: normalizeText(data.tenantId),
    appointmentId: normalizeText(data.appointmentId),
    customerId: normalizeText(data.customerId),
    time: normalizeText(data.time, "09:00"),
    dateLabel: normalizeText(data.dateLabel, formatDateLabel(dueDate)),
    dueDate,
    title: normalizeText(data.title, "Hatırlatma"),
    description: normalizeText(data.description, "Takip hatırlatması"),
    channel: (data.channel as ReminderChannel) ?? "WhatsApp",
    status: (data.status as Reminder["status"]) ?? "Bekliyor",
    createdAt: data.createdAt,
  };
}

export function listenAppointmentNotes(
  tenantId: string,
  onChange: (notes: AppointmentNote[]) => void,
  onError?: (error: Error) => void
) {
  const notesQuery = query(collection(db, "appointmentNotes"), where("tenantId", "==", tenantId));

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      const notes = snapshot.docs.map((docSnap) => normalizeAppointmentNote(docSnap.id, docSnap.data()));
      notes.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""), "tr"));
      onChange(notes);
    },
    (error) => {
      console.error("İşlem notları okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenFollowUps(
  tenantId: string,
  onChange: (followUps: FollowUp[]) => void,
  onError?: (error: Error) => void
) {
  const followUpsQuery = query(collection(db, "followUps"), where("tenantId", "==", tenantId));

  return onSnapshot(
    followUpsQuery,
    (snapshot) => {
      const followUps = snapshot.docs.map((docSnap) => normalizeFollowUp(docSnap.id, docSnap.data()));
      followUps.sort((a, b) => (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99", "tr"));
      onChange(followUps);
    },
    (error) => {
      console.error("Takipler okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export function listenReminders(
  tenantId: string,
  onChange: (reminders: Reminder[]) => void,
  onError?: (error: Error) => void
) {
  const remindersQuery = query(collection(db, "reminders"), where("tenantId", "==", tenantId));

  return onSnapshot(
    remindersQuery,
    (snapshot) => {
      const reminders = snapshot.docs.map((docSnap) => normalizeReminder(docSnap.id, docSnap.data()));
      reminders.sort((a, b) => `${a.dueDate ?? "9999-99-99"} ${a.time}`.localeCompare(`${b.dueDate ?? "9999-99-99"} ${b.time}`, "tr"));
      onChange(reminders);
    },
    (error) => {
      console.error("Hatırlatmalar okunamadı:", error);
      onError?.(error as Error);
    }
  );
}

export async function createAppointmentNote(input: NewAppointmentNoteInput) {
  const appointment = input.appointment;
  const customerId = appointment.customerId;

  if (!customerId) {
    throw new Error("İşlem notu oluşturmak için randevunun gerçek müşteri kaydına bağlı olması gerekir.");
  }

  const nextAction = input.nextAction.trim() || "Bir sonraki takip adımı belirlenecek.";
  const followUpDate = input.followUpDate;
  const dueLabel = formatDateLabel(followUpDate);

  await addDoc(collection(db, "appointmentNotes"), {
    tenantId: input.tenantId,
    appointmentId: appointment.id,
    customerId,
    customerName: appointment.customerName,
    service: appointment.service,
    rawNote: input.rawNote.trim(),
    customerSummary: input.customerSummary.trim(),
    internalNote: input.internalNote.trim(),
    nextAction,
    followUpDate,
    reminderChannel: input.reminderChannel,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (followUpDate) {
    await addDoc(collection(db, "followUps"), {
      tenantId: input.tenantId,
      appointmentId: appointment.id,
      customerId,
      customerName: appointment.customerName,
      description: nextAction,
      dueDate: followUpDate,
      dueLabel,
      tone: getFollowUpTone(followUpDate),
      status: "Açık",
      createdAt: serverTimestamp(),
    });

    if (input.createReminder) {
      await addDoc(collection(db, "reminders"), {
        tenantId: input.tenantId,
        appointmentId: appointment.id,
        customerId,
        title: appointment.customerName,
        description: nextAction,
        dueDate: followUpDate,
        dateLabel: dueLabel,
        time: appointment.time || "09:00",
        channel: input.reminderChannel,
        status: "Bekliyor",
        createdAt: serverTimestamp(),
      });
    }
  }

  await updateDoc(doc(db, "appointments", appointment.id), {
    status: "Tamamlandı",
    notes: input.rawNote.trim(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "customers", customerId), {
    lastVisit: appointment.date || "Bugün",
    historyCount: increment(1),
    notes: input.customerSummary.trim() || input.rawNote.trim(),
    nextAction,
    updatedAt: serverTimestamp(),
  });
}

export async function updateReminderStatus(reminderId: string, status: Reminder["status"]) {
  if (!reminderId) throw new Error("Hatırlatma kimliği bulunamadı.");

  await updateDoc(doc(db, "reminders", reminderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateFollowUpStatus(followUpId: string, status: FollowUp["status"]) {
  if (!followUpId) throw new Error("Takip kimliği bulunamadı.");

  await updateDoc(doc(db, "followUps", followUpId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
