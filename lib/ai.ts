import type { Appointment, Reminder, Sector, FollowUp } from "@/types/domain";

export type AiMessageType = "appointment_reminder" | "follow_up" | "thank_you" | "win_back" | "process_summary" | "status_update" | "booking_reply";
export type AiTone = "samimi" | "resmi" | "kisa" | "ikna_edici";

export interface AiMessageContext {
  type: AiMessageType;
  sector: Sector;
  tenantName?: string;
  customerName: string;
  service?: string;
  dateLabel?: string;
  time?: string;
  note?: string;
  channel?: "WhatsApp" | "SMS" | "E-posta";
  tone?: AiTone;
}

export interface AiSummaryContext {
  sector: Sector;
  tenantName?: string;
  appointment: Pick<Appointment, "customerName" | "service" | "subService" | "date" | "time" | "resourceName" | "resourceDetail">;
  rawNote: string;
}

const sectorLabels: Record<Sector, string> = {
  beauty: "güzellik ve bakım",
  clinic: "klinik / sağlık hizmetleri",
  auto: "otomotiv servis",
  education: "eğitim ve öğrenci takibi",
  consulting: "danışmanlık",
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getToneInstruction(tone?: AiTone) {
  const tones: Record<AiTone, string> = {
    samimi: "samimi, nazik ve güven veren",
    resmi: "kurumsal, resmi ve sade",
    kisa: "çok kısa, net ve gereksiz ayrıntısız",
    ikna_edici: "nazikçe ikna eden, müşteriyi rahatsız etmeyen",
  };

  return tones[tone || "samimi"];
}

export function buildFallbackAiMessage(context: AiMessageContext) {
  const businessName = context.tenantName || "Not Asistan";
  const customerName = context.customerName || "değerli müşterimiz";
  const service = context.service || (context.sector === "auto" ? "servis işleminiz" : "randevunuz");
  const dateTime = [context.dateLabel, context.time].filter(Boolean).join(" saat ");
  const dateSentence = dateTime ? ` ${dateTime} için` : "";

  const sectorEnding: Record<Sector, string> = {
    beauty: "Güzelliğinize ve bakım konforunuza önem veriyoruz.",
    clinic: "Sağlıklı ve düzenli takip için randevu akışınızı önemsiyoruz.",
    auto: "Aracınızın güvenli ve düzenli kullanımı için bakım takibini önemsiyoruz.",
    education: "Öğrenci gelişimini düzenli takip etmek bizim için kıymetlidir.",
    consulting: "Sürecinizin düzenli ilerlemesi için takipte kalıyoruz.",
  };

  const notePart = context.note ? ` Notumuz: ${normalizeWhitespace(context.note)}` : "";

  if (context.type === "appointment_reminder") {
    return `Merhaba ${customerName}, ${businessName} tarafından${dateSentence} ${service} randevunuzu hatırlatmak isteriz.${notePart} Uygunluğunuzu teyit ederseniz memnun oluruz.`;
  }

  if (context.type === "follow_up") {
    return `Merhaba ${customerName}, ${businessName} olarak ${service} sonrası kısa bir takip yapmak istiyoruz.${notePart} ${sectorEnding[context.sector]}`;
  }

  if (context.type === "thank_you") {
    return `Merhaba ${customerName}, bugün ${businessName} hizmetini tercih ettiğiniz için teşekkür ederiz. ${service} ile ilgili ihtiyaç duyarsanız her zaman bize ulaşabilirsiniz.`;
  }

  if (context.type === "win_back") {
    return `Merhaba ${customerName}, sizi uzun süredir göremedik. ${businessName} olarak size uygun yeni bir ${service} planlamak isteriz. ${sectorEnding[context.sector]}`;
  }

  if (context.type === "status_update") {
    return `Merhaba ${customerName}, ${businessName} bilgilendirmesi: ${service} sürecinizle ilgili durum güncellenmiştir.${notePart}`;
  }

  if (context.type === "booking_reply") {
    return `Merhaba ${customerName}, ${businessName} olarak randevu talebinizi aldık. ${service}${dateSentence ? ` - ${dateTime}` : ""} bilgileriyle en kısa sürede size dönüş yapacağız.`;
  }

  return `${customerName} için ${sectorLabels[context.sector]} alanına uygun işlem özeti hazırlandı. Sonraki adım olarak takip tarihi oluşturulması önerilir.`;
}

export function buildFallbackSummary(context: AiSummaryContext) {
  const clean = normalizeWhitespace(context.rawNote || "");
  const appointment = context.appointment;
  const service = [appointment.service, appointment.subService].filter(Boolean).join(" - ") || "işlem";

  const intro: Record<Sector, string> = {
    beauty: `Bugünkü ${service} işleminde bakım süreci değerlendirildi ve müşterinin tercihleri dikkate alındı.`,
    clinic: `Bugünkü ${service} süreci yetkili personel tarafından değerlendirildi ve takip notu oluşturuldu.`,
    auto: `Bugünkü ${service} işleminde araçla ilgili gerekli kontrol ve bakım adımları kayıt altına alındı.`,
    education: `Bugünkü ${service} görüşmesinde öğrencinin gelişimi ve sonraki çalışma adımları değerlendirildi.`,
    consulting: `Bugünkü ${service} görüşmesinde ana konu, kararlar ve sonraki aksiyonlar kayıt altına alındı.`,
  };

  const next: Record<Sector, string> = {
    beauty: "Bir sonraki bakım zamanı için müşteriye uygun tarihte hatırlatma yapılması önerilir.",
    clinic: "Kontrol veya takip ihtiyacı yetkili personel tarafından değerlendirilerek planlanmalıdır.",
    auto: "Bir sonraki bakım veya kontrol zamanı için müşteriye hatırlatma yapılması önerilir.",
    education: "Veli/öğrenci bilgilendirmesi ve sonraki görüşme için takip oluşturulması önerilir.",
    consulting: "Belirlenen aksiyonların takibi için uygun tarihte geri dönüş planlanmalıdır.",
  };

  return `${intro[context.sector]} ${clean ? `Not: ${clean}.` : ""} ${next[context.sector]}`;
}

export async function generateMockAiMessage(type: AiMessageType, customerName: string) {
  return Promise.resolve(buildFallbackAiMessage({ type, customerName, sector: "consulting", tenantName: "Not Asistan" }));
}
