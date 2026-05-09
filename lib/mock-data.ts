import type { AiSuggestion, Appointment, Customer, FollowUp, Reminder } from "@/types/domain";

export const demoTenant = {
  id: "tenant_gulizar_beauty",
  name: "Gülizar Güzellik Merkezi",
  sector: "beauty",
  slug: "gulizar-guzellik"
} as const;

export const appointments: Appointment[] = [
  {
    id: "apt_1",
    tenantId: demoTenant.id,
    time: "09:30",
    customerName: "Selin Kaya",
    customerPhone: "0555 123 45 67",
    avatar: "SK",
    service: "Cilt Bakımı",
    subService: "HydraFacial",
    status: "Onaylandı"
  },
  {
    id: "apt_2",
    tenantId: demoTenant.id,
    time: "11:00",
    customerName: "Buse Demir",
    customerPhone: "0531 987 65 43",
    avatar: "BD",
    service: "Saç Boyama",
    subService: "Balyaj",
    status: "Bekliyor"
  },
  {
    id: "apt_3",
    tenantId: demoTenant.id,
    time: "13:30",
    customerName: "Merve Arslan",
    customerPhone: "0544 234 56 78",
    avatar: "MA",
    service: "Kaş Laminasyonu",
    subService: "Bakım + Şekillendirme",
    status: "Onaylandı"
  },
  {
    id: "apt_4",
    tenantId: demoTenant.id,
    time: "15:00",
    customerName: "İpek Yıldız",
    customerPhone: "0530 111 22 33",
    avatar: "İY",
    service: "Protez Tırnak",
    subService: "French",
    status: "Onaylandı"
  },
  {
    id: "apt_5",
    tenantId: demoTenant.id,
    time: "16:30",
    customerName: "Derya Şahin",
    customerPhone: "0507 876 54 32",
    avatar: "DŞ",
    service: "Lazer Epilasyon",
    subService: "Bacak",
    status: "Tamamlandı"
  }
];

export const featuredCustomer: Customer = {
  id: "cus_merve",
  tenantId: demoTenant.id,
  name: "Merve Arslan",
  phone: "0555 234 56 78",
  email: "merve.arslan@email.com",
  avatar: "MA",
  lastVisit: "18 Mayıs 2024",
  historyCount: 12,
  notes: "Hassas cilt, parfümsüz ürün tercih eder. Güneş hassasiyeti var.",
  nextAction: "Cilt bakım paketi yenileme teklifi gönder.",
  segment: "VIP"
};

export const aiSuggestions: AiSuggestion[] = [
  {
    id: "ai_1",
    title: "Selin Kaya 45 gündür gelmedi.",
    description: "Dönüş zamanı gelmiş olabilir.",
    tone: "purple"
  },
  {
    id: "ai_2",
    title: "Buse Demir’in güzellik paketi süresi doluyor.",
    description: "7 gün sonra yenileme hatırlatması önerilir.",
    tone: "rose"
  },
  {
    id: "ai_3",
    title: "Merve Arslan için kontrol zamanı.",
    description: "Cilt bakım rutini sonrası takip mesajı gönderilebilir.",
    tone: "green"
  },
  {
    id: "ai_4",
    title: "İpek Yıldız’ın saç rengi tazeleme süresi yaklaştı.",
    description: "Randevu daveti için sıcak bir mesaj oluştur.",
    tone: "orange"
  }
];

export const reminders: Reminder[] = [
  { id: "rem_1", time: "10:00", dateLabel: "Bugün", title: "Selin Kaya", description: "Cilt bakımı dönüş hatırlatması", channel: "WhatsApp" },
  { id: "rem_2", time: "13:00", dateLabel: "Bugün", title: "Buse Demir", description: "Paket süresi bitiyor hatırlatması", channel: "SMS" },
  { id: "rem_3", time: "09:00", dateLabel: "Yarın", title: "Merve Arslan", description: "Cilt bakım kontrol hatırlatması", channel: "WhatsApp" },
  { id: "rem_4", time: "11:00", dateLabel: "18 Mayıs", title: "İpek Yıldız", description: "Saç rengi tazeleme hatırlatması", channel: "SMS" }
];

export const followUps: FollowUp[] = [
  { id: "fu_1", customerName: "Selin Kaya", description: "Cilt bakımı sonrası dönüş", dueLabel: "2 gün gecikti", tone: "red" },
  { id: "fu_2", customerName: "Buse Demir", description: "Güzellik paketi yenileme", dueLabel: "Bugün", tone: "orange" },
  { id: "fu_3", customerName: "Merve Arslan", description: "Cilt bakım kontrolü", dueLabel: "Yarın", tone: "green" }
];
