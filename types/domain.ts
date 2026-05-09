export type Role = "super_admin" | "owner" | "manager" | "staff";
export type Sector = "beauty" | "clinic" | "auto" | "education" | "consulting";
export type AppointmentStatus = "Onaylandı" | "Bekliyor" | "Tamamlandı" | "İptal" | "Gelmedi";
export type ReminderChannel = "WhatsApp" | "SMS" | "E-posta";

export interface Tenant {
  id: string;
  name: string;
  sector: Sector;
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
  sector?: Sector;
  sectorData?: Record<string, string>;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NewCustomerInput {
  tenantId: string;
  sector: Sector;
  name: string;
  phone: string;
  email: string;
  notes: string;
  sectorData: Record<string, string>;
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerId?: string;
  date?: string;
  time: string;
  customerName: string;
  customerPhone: string;
  avatar: string;
  service: string;
  subService: string;
  /** Otomotiv gibi sektörlerde araç adı; eğitimde sınıf/konu gibi ek kaynak bilgisi. */
  resourceName?: string;
  /** Otomotiv gibi sektörlerde plaka; diğer sektörlerde ek açıklama. */
  resourceDetail?: string;
  status: AppointmentStatus;
  notes?: string;
  sector?: Sector;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NewAppointmentInput {
  tenantId: string;
  sector: Sector;
  customer: Customer;
  date: string;
  time: string;
  service: string;
  subService: string;
  status: AppointmentStatus;
  notes: string;
}

export interface AppointmentNote {
  id: string;
  tenantId: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  service: string;
  rawNote: string;
  customerSummary: string;
  internalNote: string;
  nextAction: string;
  followUpDate: string;
  reminderChannel: ReminderChannel;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NewAppointmentNoteInput {
  tenantId: string;
  appointment: Appointment;
  rawNote: string;
  customerSummary: string;
  internalNote: string;
  nextAction: string;
  followUpDate: string;
  reminderChannel: ReminderChannel;
  createReminder: boolean;
}


export interface PublicTenant {
  tenantId: string;
  name: string;
  sector: Sector;
  slug: string;
  isActive?: boolean;
}

export interface BookingRequest {
  id: string;
  tenantId: string;
  tenantSlug: string;
  sector: Sector;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: "Yeni Talep" | "Görüldü" | "Randevuya Çevrildi" | "İptal";
  source?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NewBookingRequestInput {
  tenantId: string;
  tenantSlug: string;
  sector: Sector;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  tone: "purple" | "blue" | "green" | "orange" | "rose";
}

export interface Reminder {
  id: string;
  tenantId?: string;
  appointmentId?: string;
  customerId?: string;
  time: string;
  dateLabel: string;
  dueDate?: string;
  title: string;
  description: string;
  channel: ReminderChannel;
  status?: "Bekliyor" | "Gönderildi" | "İptal";
  createdAt?: unknown;
}

export interface FollowUp {
  id: string;
  tenantId?: string;
  appointmentId?: string;
  customerId?: string;
  customerName: string;
  description: string;
  dueLabel: string;
  dueDate?: string;
  tone: "red" | "orange" | "green" | "blue";
  status?: "Açık" | "Tamamlandı" | "İptal";
  createdAt?: unknown;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  tenantId: string;
  tenantName: string;
  sector: Sector;
}
