import type { AiSuggestion, Appointment, Customer, FollowUp, Reminder, Sector } from "@/types/domain";
import { BriefcaseBusiness, Car, GraduationCap, HeartPulse, Sparkles } from "lucide-react";

export interface SectorPreset {
  sector: Sector;
  label: string;
  greetingEmoji: string;
  userRoleLabel: string;
  searchPlaceholder: string;
  customerLabel: string;
  customerPluralLabel: string;
  appointmentTitle: string;
  serviceColumnLabel: string;
  ctaText: string;
  stats: Array<{
    title: string;
    value: string;
    detail: string;
    tone: "blue" | "orange" | "green" | "purple";
  }>;
  appointments: Appointment[];
  featuredCustomer: Customer;
  aiSuggestions: AiSuggestion[];
  reminders: Reminder[];
  followUps: FollowUp[];
  sidebarExtra?: {
    label: string;
    type: "vehicle" | "student" | "case";
  };
}

const beauty: SectorPreset = {
  sector: "beauty",
  label: "Güzellik / Kuaför",
  greetingEmoji: "🌸",
  userRoleLabel: "Yönetici",
  searchPlaceholder: "Ara... (müşteri, randevu, işlem notu)",
  customerLabel: "Müşteri",
  customerPluralLabel: "Müşteriler",
  appointmentTitle: "Bugünkü Randevular",
  serviceColumnLabel: "Hizmet",
  ctaText: "Not Asistan ile kliniğinizi güzelleştirin, müşteri deneyimini mükemmelleştirin.",
  stats: [
    { title: "Bugünkü Randevular", value: "14", detail: "3 onay bekliyor", tone: "blue" },
    { title: "Bekleyen Hatırlatmalar", value: "9", detail: "2’si bugün", tone: "orange" },
    { title: "Takip Zamanı Gelenler", value: "6", detail: "3 müşteri", tone: "green" },
    { title: "Sadık Müşteriler", value: "128", detail: "%18 artış (bu ay)", tone: "purple" },
  ],
  appointments: [
    { id: "apt_b1", tenantId: "demo", time: "09:30", customerName: "Selin Kaya", customerPhone: "0555 123 45 67", avatar: "SK", service: "Cilt Bakımı", subService: "HydraFacial", status: "Onaylandı" },
    { id: "apt_b2", tenantId: "demo", time: "11:00", customerName: "Buse Demir", customerPhone: "0531 987 65 43", avatar: "BD", service: "Saç Boyama", subService: "Balyaj", status: "Bekliyor" },
    { id: "apt_b3", tenantId: "demo", time: "13:30", customerName: "Merve Arslan", customerPhone: "0544 234 56 78", avatar: "MA", service: "Kaş Laminasyonu", subService: "Bakım + Şekillendirme", status: "Onaylandı" },
    { id: "apt_b4", tenantId: "demo", time: "15:00", customerName: "İpek Yıldız", customerPhone: "0530 111 22 33", avatar: "İY", service: "Protez Tırnak", subService: "French", status: "Onaylandı" },
    { id: "apt_b5", tenantId: "demo", time: "16:30", customerName: "Derya Şahin", customerPhone: "0507 876 54 32", avatar: "DŞ", service: "Lazer Epilasyon", subService: "Bacak", status: "Tamamlandı" },
  ],
  featuredCustomer: {
    id: "cus_b1", tenantId: "demo", name: "Merve Arslan", phone: "0555 234 56 78", email: "merve.arslan@email.com", avatar: "MA", lastVisit: "18 Mayıs 2024", historyCount: 12,
    notes: "Hassas cilt, parfümsüz ürün tercih eder. Güneş hassasiyeti var.", nextAction: "Cilt bakım paketi yenileme teklifi gönder.", segment: "VIP",
  },
  aiSuggestions: [
    { id: "ai_b1", title: "Selin Kaya 45 gündür gelmedi.", description: "Dönüş zamanı gelmiş olabilir.", tone: "purple" },
    { id: "ai_b2", title: "Buse Demir’in güzellik paketi süresi doluyor.", description: "7 gün sonra yenileme hatırlatması önerilir.", tone: "rose" },
    { id: "ai_b3", title: "Merve Arslan için kontrol zamanı.", description: "Cilt bakım rutini sonrası takip mesajı gönderilebilir.", tone: "green" },
    { id: "ai_b4", title: "İpek Yıldız’ın saç rengi tazeleme süresi yaklaştı.", description: "Randevu daveti için sıcak bir mesaj oluştur.", tone: "orange" },
  ],
  reminders: [
    { id: "rem_b1", time: "10:00", dateLabel: "Bugün", title: "Selin Kaya", description: "Cilt bakımı dönüş hatırlatması", channel: "WhatsApp" },
    { id: "rem_b2", time: "13:00", dateLabel: "Bugün", title: "Buse Demir", description: "Paket süresi bitiyor hatırlatması", channel: "SMS" },
    { id: "rem_b3", time: "09:00", dateLabel: "Yarın", title: "Merve Arslan", description: "Cilt bakım kontrol hatırlatması", channel: "WhatsApp" },
    { id: "rem_b4", time: "11:00", dateLabel: "18 Mayıs", title: "İpek Yıldız", description: "Saç rengi tazeleme hatırlatması", channel: "SMS" },
  ],
  followUps: [
    { id: "fu_b1", customerName: "Selin Kaya", description: "Cilt bakımı sonrası dönüş", dueLabel: "2 gün gecikti", tone: "red" },
    { id: "fu_b2", customerName: "Buse Demir", description: "Güzellik paketi yenileme", dueLabel: "Bugün", tone: "orange" },
    { id: "fu_b3", customerName: "Merve Arslan", description: "Cilt bakım kontrolü", dueLabel: "Yarın", tone: "green" },
  ],
};

const auto: SectorPreset = {
  sector: "auto",
  label: "Otomotiv / Oto Servis",
  greetingEmoji: "🔧",
  userRoleLabel: "Servis Yöneticisi",
  searchPlaceholder: "Ara... (müşteri, araç, plaka, işlem notu)",
  customerLabel: "Müşteri",
  customerPluralLabel: "Müşteriler",
  appointmentTitle: "Bugünkü Servis Randevuları",
  serviceColumnLabel: "İşlem",
  ctaText: "Not Asistan ile servis işlerinizi kolaylaştırın, müşterilerinizi memnun edin.",
  sidebarExtra: { label: "Araçlar", type: "vehicle" },
  stats: [
    { title: "Bugünkü Servis Randevuları", value: "14", detail: "3 onay bekliyor", tone: "blue" },
    { title: "Bekleyen Hatırlatmalar", value: "9", detail: "2’si bugün", tone: "orange" },
    { title: "Bakım Zamanı Gelenler", value: "7", detail: "3 araç", tone: "green" },
    { title: "Düzenli Müşteriler", value: "158", detail: "%18 artış (bu ay)", tone: "purple" },
  ],
  appointments: [
    { id: "apt_a1", tenantId: "demo", time: "09:00", customerName: "Mehmet Kaya", customerPhone: "0532 987 65 43", avatar: "MK", resourceName: "VW Passat", resourceDetail: "34 ABC 123", service: "Periyodik Bakım", subService: "10.000 km", status: "Onaylandı" },
    { id: "apt_a2", tenantId: "demo", time: "10:30", customerName: "Ayşe Yılmaz", customerPhone: "0555 123 45 67", avatar: "AY", resourceName: "Renault Clio", resourceDetail: "34 DEF 456", service: "Yağ Değişimi", subService: "5W-30", status: "Bekliyor" },
    { id: "apt_a3", tenantId: "demo", time: "12:00", customerName: "Ali Demir", customerPhone: "0537 246 80 12", avatar: "AD", resourceName: "Ford Focus", resourceDetail: "34 GHI 789", service: "Fren Balata Kontrolü", subService: "Ön + Arka", status: "Onaylandı" },
    { id: "apt_a4", tenantId: "demo", time: "13:30", customerName: "Zeynep Öztürk", customerPhone: "0541 357 24 68", avatar: "ZÖ", resourceName: "Hyundai i20", resourceDetail: "34 JKL 012", service: "Klima Bakımı", subService: "Kontrol + Gaz", status: "Tamamlandı" },
    { id: "apt_a5", tenantId: "demo", time: "15:00", customerName: "Berkay Arslan", customerPhone: "0530 111 22 33", avatar: "BA", resourceName: "Fiat Egea", resourceDetail: "34 MNO 345", service: "Lastik Rot-Balans", subService: "", status: "Onaylandı" },
  ],
  featuredCustomer: {
    id: "cus_a1", tenantId: "demo", name: "Mehmet Kaya", phone: "0532 987 65 43", email: "mehmet.kaya@gmail.com", avatar: "MK", lastVisit: "12 Nisan 2024", historyCount: 6,
    notes: "VW Passat • 34 ABC 123 • 2016 • 158.000 km • Dizel. Aracı sabah bırakıyor, hızlı teslim tercih ediyor.", nextAction: "Periyodik bakım teklifi gönder.", segment: "Düzenli",
  },
  aiSuggestions: [
    { id: "ai_a1", title: "10.000 km bakımı geldi", description: "3 araç için periyodik bakım öneriliyor.", tone: "purple" },
    { id: "ai_a2", title: "Yağ değişimi hatırlatması gönder", description: "5 araç için yağ değişim zamanı yaklaştı.", tone: "orange" },
    { id: "ai_a3", title: "Müşteri 5 aydır gelmedi", description: "8 müşteriyi tekrar servise çağırabilirsiniz.", tone: "blue" },
    { id: "ai_a4", title: "Balata kontrolü öner", description: "4 araç için balata kontrolü tavsiye ediliyor.", tone: "green" },
  ],
  reminders: [
    { id: "rem_a1", time: "10:00", dateLabel: "Bugün", title: "VW Passat – 34 ABC 123", description: "10.000 km periyodik bakım", channel: "WhatsApp" },
    { id: "rem_a2", time: "14:00", dateLabel: "Bugün", title: "Renault Clio – 34 DEF 456", description: "Yağ değişimi hatırlatması", channel: "SMS" },
    { id: "rem_a3", time: "09:00", dateLabel: "Yarın", title: "Ford Focus – 34 GHI 789", description: "Fren balata kontrolü önerisi", channel: "WhatsApp" },
    { id: "rem_a4", time: "11:00", dateLabel: "18 Mayıs", title: "Hyundai i20 – 34 JKL 012", description: "Klima bakım hatırlatması", channel: "SMS" },
  ],
  followUps: [
    { id: "fu_a1", customerName: "Ali Demir", description: "Fren balata değişimi teklifi", dueLabel: "2 gün geçti", tone: "red" },
    { id: "fu_a2", customerName: "Zeynep Öztürk", description: "Klima gazı değişimi hatırlatması", dueLabel: "Bugün", tone: "orange" },
    { id: "fu_a3", customerName: "Berkay Arslan", description: "Rot-Balans kontrolü sonrası arama", dueLabel: "Yarın", tone: "green" },
  ],
};

const clinic: SectorPreset = {
  sector: "clinic",
  label: "Klinik / Sağlık",
  greetingEmoji: "👋",
  userRoleLabel: "Klinik Yöneticisi",
  searchPlaceholder: "Ara... (hasta, telefon, randevu, işlem notu)",
  customerLabel: "Hasta",
  customerPluralLabel: "Hastalar",
  appointmentTitle: "Bugünkü Randevular",
  serviceColumnLabel: "İşlem",
  ctaText: "Not Asistan ile zamanınızın daha fazlasını hastalarınıza ayırın.",
  stats: [
    { title: "Bugünkü Randevular", value: "18", detail: "2 iptal, 1 bekliyor", tone: "blue" },
    { title: "Bekleyen Hatırlatmalar", value: "12", detail: "Bugün", tone: "orange" },
    { title: "Kontrol Zamanı Gelenler", value: "7", detail: "Bu hafta", tone: "green" },
    { title: "Düzenli Hastalar", value: "356", detail: "%12 artış (bu ay)", tone: "purple" },
  ],
  appointments: [
    { id: "apt_c1", tenantId: "demo", time: "09:00", customerName: "Ayşe Demir", customerPhone: "0555 123 45 67", avatar: "AD", service: "Diş Kontrolü", subService: "Dr. Murat Yılmaz", status: "Onaylandı" },
    { id: "apt_c2", tenantId: "demo", time: "10:30", customerName: "Mehmet Kaya", customerPhone: "0532 987 65 43", avatar: "MK", service: "İmplant Kontrolü", subService: "Dr. Murat Yılmaz", status: "Bekliyor" },
    { id: "apt_c3", tenantId: "demo", time: "12:00", customerName: "Zeynep Yıldız", customerPhone: "0544 321 09 87", avatar: "ZY", service: "Cilt Muayenesi", subService: "Uzm. Dr. Selin Arslan", status: "Onaylandı" },
    { id: "apt_c4", tenantId: "demo", time: "14:00", customerName: "Ahmet Çelik", customerPhone: "0507 654 32 10", avatar: "AÇ", service: "Fizik Tedavi Seansı", subService: "Fzt. Emre Toprak", status: "Onaylandı" },
    { id: "apt_c5", tenantId: "demo", time: "15:30", customerName: "Elif Özkan", customerPhone: "0538 765 43 21", avatar: "EÖ", service: "Diyetisyen Görüşmesi", subService: "Dyt. Melis Aksoy", status: "Tamamlandı" },
  ],
  featuredCustomer: {
    id: "cus_c1", tenantId: "demo", name: "Ayşe Demir", phone: "0555 123 45 67", email: "ayse.demir@gmail.com", avatar: "AD", lastVisit: "10 Mayıs 2024", historyCount: 7,
    notes: "Anestezi hassasiyeti var. Sabah saatlerini tercih ediyor.", nextAction: "Kontrol randevusu planla.", segment: "Düzenli",
  },
  aiSuggestions: [
    { id: "ai_c1", title: "6 aylık kontrol zamanı geldi", description: "12 hasta için kontrol hatırlatması öneriliyor.", tone: "purple" },
    { id: "ai_c2", title: "Tetkik sonucu sonrası takip öner", description: "5 hastanın sonuçları için bilgilendirme planlayın.", tone: "blue" },
    { id: "ai_c3", title: "Yarınki randevu için teyit mesajı gönder", description: "6 hastaya hatırlatma mesajı gönderin.", tone: "green" },
    { id: "ai_c4", title: "Düzenli hasta check-up planı", description: "8 hastanın check-up planı oluşturulabilir.", tone: "green" },
  ],
  reminders: [
    { id: "rem_c1", time: "10:00", dateLabel: "Bugün", title: "Ayşe Demir", description: "Kontrol randevusu hatırlatması", channel: "WhatsApp" },
    { id: "rem_c2", time: "12:30", dateLabel: "Bugün", title: "Mehmet Kaya", description: "İmplant kontrolü hatırlatması", channel: "SMS" },
    { id: "rem_c3", time: "15:00", dateLabel: "Bugün", title: "Zeynep Yıldız", description: "Cilt muayenesi hatırlatması", channel: "WhatsApp" },
    { id: "rem_c4", time: "17:00", dateLabel: "Bugün", title: "Ahmet Çelik", description: "Fizik tedavi seansı hatırlatması", channel: "SMS" },
  ],
  followUps: [
    { id: "fu_c1", customerName: "Mehmet Kaya", description: "Memnuniyet araması yapılacak", dueLabel: "Bugün", tone: "orange" },
    { id: "fu_c2", customerName: "Ayşe Demir", description: "Kontrol hatırlatması", dueLabel: "Yarın", tone: "green" },
    { id: "fu_c3", customerName: "Zeynep Yıldız", description: "Sonuç bilgilendirmesi yapılacak", dueLabel: "18 Mayıs", tone: "blue" },
  ],
};

const education: SectorPreset = {
  ...beauty,
  sector: "education",
  label: "Eğitim / Kurs",
  greetingEmoji: "📚",
  customerLabel: "Öğrenci",
  customerPluralLabel: "Öğrenciler",
  searchPlaceholder: "Ara... (öğrenci, veli, görüşme, işlem notu)",
  appointmentTitle: "Bugünkü Görüşmeler",
  serviceColumnLabel: "Görüşme",
  ctaText: "Not Asistan ile öğrenci takibini düzenleyin, veli iletişimini güçlendirin.",
  sidebarExtra: { label: "Öğrenciler", type: "student" },
  stats: [
    { title: "Bugünkü Görüşmeler", value: "11", detail: "2 veli bekliyor", tone: "blue" },
    { title: "Bekleyen Hatırlatmalar", value: "8", detail: "3’ü bugün", tone: "orange" },
    { title: "Takip Zamanı Gelenler", value: "9", detail: "5 öğrenci", tone: "green" },
    { title: "Düzenli Öğrenciler", value: "84", detail: "%11 artış (bu ay)", tone: "purple" },
  ],
  appointments: [
    { id: "apt_e1", tenantId: "demo", time: "09:30", customerName: "Cihan Aydın", customerPhone: "0555 123 45 67", avatar: "CA", service: "Öğrenci Görüşmesi", subService: "TYT Türkçe", status: "Onaylandı" },
    { id: "apt_e2", tenantId: "demo", time: "11:00", customerName: "Servet Aydın", customerPhone: "0531 987 65 43", avatar: "SA", service: "Deneme Analizi", subService: "Eksik konu tespiti", status: "Bekliyor" },
    { id: "apt_e3", tenantId: "demo", time: "13:30", customerName: "Zeynep Demir", customerPhone: "0544 234 56 78", avatar: "ZD", service: "Veli Bilgilendirme", subService: "Aylık gelişim", status: "Onaylandı" },
  ],
  featuredCustomer: { ...beauty.featuredCustomer, name: "Cihan Aydın", avatar: "CA", notes: "Paragraf sorularında hız çalışması gerekiyor. Veli haftalık özet istiyor.", nextAction: "Veliye gelişim özeti gönder." },
  aiSuggestions: [
    { id: "ai_e1", title: "Cihan için konu takip zamanı", description: "Paragraf netleri son iki denemede düşmüş.", tone: "purple" },
    { id: "ai_e2", title: "Veli bilgilendirme mesajı öner", description: "3 öğrenci için haftalık gelişim özeti hazırlanabilir.", tone: "blue" },
    { id: "ai_e3", title: "Ödev kontrolü gecikti", description: "5 öğrenci için takip listesi oluşturuldu.", tone: "orange" },
  ],
  reminders: [
    { id: "rem_e1", time: "10:00", dateLabel: "Bugün", title: "Cihan Aydın", description: "Paragraf ödevi hatırlatması", channel: "WhatsApp" },
    { id: "rem_e2", time: "14:00", dateLabel: "Bugün", title: "Servet Aydın", description: "Deneme analizi görüşmesi", channel: "SMS" },
  ],
  followUps: [
    { id: "fu_e1", customerName: "Cihan Aydın", description: "Veli bilgilendirme yapılacak", dueLabel: "Bugün", tone: "orange" },
    { id: "fu_e2", customerName: "Servet Aydın", description: "Deneme sonrası çalışma planı", dueLabel: "Yarın", tone: "green" },
  ],
};

const consulting: SectorPreset = {
  ...beauty,
  sector: "consulting",
  label: "Danışmanlık",
  greetingEmoji: "💼",
  customerLabel: "Danışan",
  customerPluralLabel: "Danışanlar",
  searchPlaceholder: "Ara... (danışan, görüşme, teklif, not)",
  appointmentTitle: "Bugünkü Görüşmeler",
  serviceColumnLabel: "Konu",
  ctaText: "Not Asistan ile görüşme notlarını ve sonraki adımları düzenli takip edin.",
  sidebarExtra: { label: "Dosyalar", type: "case" },
  stats: [
    { title: "Bugünkü Görüşmeler", value: "9", detail: "2 onay bekliyor", tone: "blue" },
    { title: "Bekleyen Hatırlatmalar", value: "6", detail: "2’si bugün", tone: "orange" },
    { title: "Takip Zamanı Gelenler", value: "5", detail: "3 danışan", tone: "green" },
    { title: "Düzenli Danışanlar", value: "64", detail: "%9 artış (bu ay)", tone: "purple" },
  ],
  appointments: [
    { id: "apt_d1", tenantId: "demo", time: "09:30", customerName: "Aylin Koç", customerPhone: "0555 123 45 67", avatar: "AK", service: "Strateji Görüşmesi", subService: "Aylık plan", status: "Onaylandı" },
    { id: "apt_d2", tenantId: "demo", time: "11:00", customerName: "Mehmet Kaya", customerPhone: "0531 987 65 43", avatar: "MK", service: "Teklif Değerlendirme", subService: "Yeni paket", status: "Bekliyor" },
  ],
  featuredCustomer: { ...beauty.featuredCustomer, name: "Aylin Koç", avatar: "AK", notes: "Aylık raporları kısa ve net tercih ediyor. Toplantı sonrası özet isteniyor.", nextAction: "Görüşme özeti ve teklif taslağı gönder." },
  aiSuggestions: [
    { id: "ai_d1", title: "Teklif takibi zamanı geldi", description: "2 danışana hatırlatma mesajı önerilir.", tone: "purple" },
    { id: "ai_d2", title: "Görüşme özeti hazırlanabilir", description: "Bugünkü 3 görüşme için kısa özet üretilebilir.", tone: "blue" },
    { id: "ai_d3", title: "Aylık kontrol planı öner", description: "Düzenli danışanlara kontrol randevusu açılabilir.", tone: "green" },
  ],
};

export const sectorPresets: Record<Sector, SectorPreset> = {
  beauty,
  clinic,
  auto,
  education,
  consulting,
};

export function getSectorPreset(sector?: Sector | null): SectorPreset {
  return sectorPresets[sector ?? "beauty"] ?? beauty;
}
