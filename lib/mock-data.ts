import type { AiSuggestion, Appointment, Customer, FollowUp, Reminder } from "@/types/domain";

export const sampleTenant = {
  id: "",
  name: "",
  sector: "beauty",
  slug: "",
} as const;

export const appointments: Appointment[] = [];
export const featuredCustomer: Customer | null = null;
export const aiSuggestions: AiSuggestion[] = [];
export const reminders: Reminder[] = [];
export const followUps: FollowUp[] = [];
