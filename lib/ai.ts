export type AiMessageType = "appointment_reminder" | "follow_up" | "thank_you" | "win_back" | "process_summary";

export async function generateMockAiMessage(type: AiMessageType, customerName: string) {
  const templates: Record<AiMessageType, string> = {
    appointment_reminder: `Merhaba ${customerName}, randevunuzu size nazikçe hatırlatmak istedik. Uygun olmadığınız durumda bize dönüş yapabilirsiniz.`,
    follow_up: `Merhaba ${customerName}, son işleminizden sonra memnuniyetinizi öğrenmek ve gerekirse yeni bir kontrol planlamak isteriz.`,
    thank_you: `Merhaba ${customerName}, bugün bizi tercih ettiğiniz için teşekkür ederiz. Sizi yeniden ağırlamaktan mutluluk duyarız.`,
    win_back: `Merhaba ${customerName}, sizi uzun süredir göremedik. Size uygun özel bir bakım/randevu planlamak isteriz.`,
    process_summary: `${customerName} için yapılan işlem notu düzenlendi. Sonraki adım olarak takip tarihi oluşturulması önerilir.`
  };

  return Promise.resolve(templates[type]);
}
