import { buildFallbackAiMessage, buildFallbackSummary, type AiMessageContext, type AiSummaryContext } from "@/lib/ai";
import { NextResponse } from "next/server";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";

async function callOpenAi(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) return null;

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.55,
      max_output_tokens: 260,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("OpenAI response error", response.status, errorText);
    return null;
  }

  const data = await response.json();
  const text = data?.output_text;

  if (typeof text === "string" && text.trim()) return text.trim();

  const contentText = data?.output?.[0]?.content?.find((item: { type?: string; text?: string }) => item.type === "output_text")?.text;
  return typeof contentText === "string" ? contentText.trim() : null;
}

function buildMessagePrompt(context: AiMessageContext) {
  return `
Sen Not Asistan adlı Türkçe SaaS uygulamasında çalışan bir mesaj yazma asistanısın.
Amaç: randevulu çalışan işletmeler için müşteriye gönderilecek kısa, doğal ve profesyonel mesaj hazırlamak.

Kurallar:
- Türkçe yaz.
- 1 kısa paragraf yaz.
- Fazla resmi ve soğuk olma; güven veren, sade ve insanî bir dil kullan.
- Tıbbi tanı, tedavi veya ilaç önerisi verme.
- Müşteriye baskı yapma.
- Sadece mesaj metnini döndür; başlık, madde, açıklama yazma.

Bağlam:
İşletme: ${context.tenantName || "Not Asistan"}
Sektör: ${context.sector}
Mesaj türü: ${context.type}
Ton: ${context.tone || "samimi"}
Müşteri: ${context.customerName}
Hizmet/işlem: ${context.service || "belirtilmedi"}
Tarih: ${context.dateLabel || "belirtilmedi"}
Saat: ${context.time || "belirtilmedi"}
Kanal: ${context.channel || "WhatsApp"}
Not: ${context.note || "yok"}
`.trim();
}

function buildSummaryPrompt(context: AiSummaryContext) {
  return `
Sen Not Asistan adlı Türkçe SaaS uygulamasında çalışan işlem özeti asistanısın.
Amaç: personelin kısa ve dağınık işlem notunu müşteriye gönderilebilecek sade, profesyonel ve güven veren bir özete çevirmek.

Kurallar:
- Türkçe yaz.
- 2-3 cümle yaz.
- Sadece müşteriye gösterilebilecek özeti döndür.
- İç not, personel yorumu veya hassas ifadeleri yazma.
- Sağlık sektöründe tanı, tedavi veya ilaç önerisi verme.
- Abartı, kesin vaat ve hukuki risk oluşturacak cümle kullanma.

Bağlam:
İşletme: ${context.tenantName || "Not Asistan"}
Sektör: ${context.sector}
Müşteri: ${context.appointment.customerName}
Hizmet/işlem: ${context.appointment.service} ${context.appointment.subService || ""}
Tarih/saat: ${context.appointment.date || ""} ${context.appointment.time || ""}
Ek kaynak: ${context.appointment.resourceName || ""} ${context.appointment.resourceDetail || ""}
Personel notu: ${context.rawNote}
`.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = body?.mode;

    if (mode === "summary") {
      const context = body?.context as AiSummaryContext;
      const prompt = buildSummaryPrompt(context);
      const aiText = await callOpenAi(prompt);
      return NextResponse.json({ text: aiText || buildFallbackSummary(context), source: aiText ? "openai" : "fallback" });
    }

    const context = body?.context as AiMessageContext;
    const prompt = buildMessagePrompt(context);
    const aiText = await callOpenAi(prompt);
    return NextResponse.json({ text: aiText || buildFallbackAiMessage(context), source: aiText ? "openai" : "fallback" });
  } catch (error) {
    console.error("AI route error", error);
    return NextResponse.json({ error: "AI metni üretilemedi." }, { status: 500 });
  }
}
