export type Role = "super_admin" | "owner" | "manager" | "staff";
export type AppointmentStatus = "Onaylandı" | "Bekliyor" | "Tamamlandı" | "İptal" | "Gelmedi";
export type ReminderChannel = "WhatsApp" | "SMS" | "E-posta";

export interface Tenant {
  id: string;
  name: string;
  sector: "beauty" | "clinic" | "auto" | "education" | "consulting";
  slug: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  lastVisit: string;
  historyCount: number;
  notes: string;
  nextAction: string;
  segment: "Yeni" | "Düzenli" | "VIP" | "Riskli" | "Geri Çağır";
}

export interface Appointment {
  id: string;
  tenantId: string;
  time: string;
  customerName: string;
  customerPhone: string;
  avatar: string;
  service: string;
  subService: string;
  status: AppointmentStatus;
}

export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  tone: "purple" | "blue" | "green" | "orange" | "rose";
}

export interface Reminder {
  id: string;
  time: string;
  dateLabel: string;
  title: string;
  description: string;
  channel: ReminderChannel;
}

export interface FollowUp {
  id: string;
  customerName: string;
  description: string;
  dueLabel: string;
  tone: "red" | "orange" | "green" | "blue";
}
