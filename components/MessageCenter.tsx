"use client";

import { getSectorPreset } from "@/lib/sector-presets";
import type { FollowUp, Reminder, Sector } from "@/types/domain";
import { CheckCircle2, Clipboard, Mail, MessageCircle, MessageSquareText, Send, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

interface MessageCenterProps {
  tenantName?: string;
  sector: Sector;
  reminders: Reminder[];
  followUps: FollowUp[];
  onReminderStatusChange?: (reminder: Reminder, status: Reminder["status"]) => void;
  onFollowUpStatusChange?: (followUp: FollowUp, status: FollowUp["status"]) => void;
}

type MessageItem = {
  id: string;
  sourceType: "reminder" | "followUp";
  title: string;
  description: string;
  customerName: string;
  channel: Reminder["channel"];
  dateLabel: string;
  status: string;
  message: string;
  reminder?: Reminder;
  followUp?: FollowUp;
};

function getChannelIcon(channel: Reminder["channel"]) {
  if (channel === "WhatsApp") return MessageCircle;
  if (channel === "SMS") return MessageSquareText;
  return Mail;
}

function buildReminderMessage(reminder: Reminder, tenantName?: string, sector?: Sector) {
  const businessName = tenantName || "Not Asistan";
  const serviceHint = sector === "auto" ? "servis / bakım" : sector === "clinic" ? "kontrol / randevu" : sector === "education" ? "görüşme / takip" : "randevu / takip";
  const datePart = [reminder.dateLabel, reminder.time].filter(Boolean).join(" saat ");

  return `Merhaba ${reminder.title}, ${businessName} tarafından ${serviceHint} hatırlatmasıdır. ${datePart} için notumuz: ${reminder.description}. Uygunluğunuzu teyit ederseniz memnun oluruz.`;
}

function buildFollowUpMessage(followUp: FollowUp, tenantName?: string, sector?: Sector) {
  const businessName = tenantName || "Not Asistan";
  const intro: Record<Sector, string> = {
    beauty: "bakım sürecinizle ilgili kısa bir takip yapmak istiyoruz",
    clinic: "kontrol sürecinizle ilgili kısa bir bilgilendirme yapmak istiyoruz",
    auto: "aracınızla ilgili planlanan takip konusunda sizi bilgilendirmek istiyoruz",
    education: "öğrenci gelişimiyle ilgili kısa bir takip yapmak istiyoruz",
    consulting: "görüşme sonrası belirlenen aksiyonla ilgili sizi bilgilendirmek istiyoruz",
  };

  return `Merhaba ${followUp.customerName}, ${businessName} olarak ${intro[sector || "consulting"]}. Takip notumuz: ${followUp.description}. Uygun olduğunuzda dönüş yapabilirsiniz.`;
}

export function MessageCenter({ tenantName, sector, reminders, followUps, onReminderStatusChange, onFollowUpStatusChange }: MessageCenterProps) {
  const preset = getSectorPreset(sector);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "sent" | "followups">("pending");
  const [aiMessages, setAiMessages] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string>("");

  const items = useMemo<MessageItem[]>(() => {
    const reminderItems: MessageItem[] = reminders.slice(0, 8).map((reminder) => ({
      id: `reminder-${reminder.id}`,
      sourceType: "reminder",
      title: reminder.title,
      description: reminder.description,
      customerName: reminder.title,
      channel: reminder.channel,
      dateLabel: `${reminder.dateLabel} ${reminder.time}`.trim(),
      status: reminder.status || "Bekliyor",
      message: buildReminderMessage(reminder, tenantName, sector),
      reminder,
    }));

    const followUpItems: MessageItem[] = followUps.slice(0, 8).map((followUp) => ({
      id: `followup-${followUp.id}`,
      sourceType: "followUp",
      title: followUp.customerName,
      description: followUp.description,
      customerName: followUp.customerName,
      channel: "WhatsApp",
      dateLabel: followUp.dueLabel,
      status: followUp.status || "Açık",
      message: buildFollowUpMessage(followUp, tenantName, sector),
      followUp,
    }));

    return [...reminderItems, ...followUpItems];
  }, [followUps, reminders, sector, tenantName]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "sent") return items.filter((item) => item.status === "Gönderildi" || item.status === "Tamamlandı");
    if (filter === "followups") return items.filter((item) => item.sourceType === "followUp");
    return items.filter((item) => item.status === "Bekliyor" || item.status === "Açık");
  }, [filter, items]);

  async function copyMessage(item: MessageItem) {
    try {
      await navigator.clipboard.writeText(aiMessages[item.id] || item.message);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 2200);
    } catch {
      setCopiedId(item.id);
    }
  }

  async function regenerateMessage(item: MessageItem) {
    setGeneratingId(item.id);
    setAiNotice("");
    try {
      const response = await fetch("/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "message",
          context: {
            type: item.sourceType === "reminder" ? "appointment_reminder" : "follow_up",
            sector,
            tenantName,
            customerName: item.customerName,
            service: item.description,
            dateLabel: item.dateLabel,
            channel: item.channel,
            note: item.description,
            tone: "samimi",
          },
        }),
      });

      if (!response.ok) throw new Error("AI mesaj üretimi başarısız");
      const data = await response.json();
      setAiMessages((current) => ({ ...current, [item.id]: data.text || item.message }));
      setAiNotice(data.source === "openai" ? "AI mesajı canlı modelle yenilendi." : "AI anahtarı yoksa akıllı yerel şablon kullanıldı.");
      window.setTimeout(() => setAiNotice(""), 2600);
    } catch (error) {
      console.error(error);
      setAiMessages((current) => ({ ...current, [item.id]: item.message }));
      setAiNotice("AI mesajı üretilemedi, mevcut şablon korundu.");
      window.setTimeout(() => setAiNotice(""), 2600);
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <section className="panel messageCenterPanel">
      <div className="panelHeader messageCenterHeader">
        <div>
          <h2><Send size={20} /> Mesaj Merkezi</h2>
          <p>{preset.label} için WhatsApp, SMS ve e-posta metinlerini AI destekli olarak tek merkezden yönetin.</p>
        </div>
        <div className="messageCenterFilters" role="tablist" aria-label="Mesaj merkezi filtreleri">
          <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")} type="button">Bekleyen</button>
          <button className={filter === "followups" ? "active" : ""} onClick={() => setFilter("followups")} type="button">Takipler</button>
          <button className={filter === "sent" ? "active" : ""} onClick={() => setFilter("sent")} type="button">Tamamlanan</button>
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")} type="button">Tümü</button>
        </div>
      </div>
      {aiNotice && <div className="aiNotice">{aiNotice}</div>}

      <div className="messageStatsGrid">
        <div><span>Bekleyen mesaj</span><strong>{items.filter((item) => item.status === "Bekliyor" || item.status === "Açık").length}</strong></div>
        <div><span>Tamamlanan</span><strong>{items.filter((item) => item.status === "Gönderildi" || item.status === "Tamamlandı").length}</strong></div>
        <div><span>WhatsApp hazır</span><strong>{items.filter((item) => item.channel === "WhatsApp").length}</strong></div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="messageEmptyState">
          <MessageSquareText size={30} />
          <b>Şimdilik mesaj yok.</b>
          <span>İşlem notu veya takip oluşturduğunuzda hatırlatma mesajları burada görünecek.</span>
        </div>
      ) : (
        <div className="messageList">
          {filteredItems.map((item) => {
            const ChannelIcon = getChannelIcon(item.channel);
            const isCompleted = item.status === "Gönderildi" || item.status === "Tamamlandı" || item.status === "İptal";
            const isDemo = item.sourceType === "reminder" ? !item.reminder?.tenantId || item.reminder.tenantId === "demo" : !item.followUp?.tenantId || item.followUp.tenantId === "demo";

            return (
              <article className="messageItem" key={item.id}>
                <div className="messageIcon"><ChannelIcon size={19} /></div>
                <div className="messageBody">
                  <div className="messageItemTop">
                    <div>
                      <b>{item.title}</b>
                      <span>{item.sourceType === "reminder" ? "Hatırlatma" : "Takip"} • {item.dateLabel}</span>
                    </div>
                    <span className={`messageStatus ${isCompleted ? "done" : "open"}`}>{item.status}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="messagePreview">{aiMessages[item.id] || item.message}</div>
                  <div className="messageActions">
                    <button type="button" className="messageActionButton ai" onClick={() => regenerateMessage(item)} disabled={generatingId === item.id}>
                      <Send size={15} /> {generatingId === item.id ? "AI yazıyor..." : "AI ile Yenile"}
                    </button>
                    <button type="button" className="messageActionButton" onClick={() => copyMessage(item)}>
                      <Clipboard size={15} /> {copiedId === item.id ? "Kopyalandı" : "Metni Kopyala"}
                    </button>
                    {item.sourceType === "reminder" && item.reminder && (
                      <>
                        <button type="button" className="messageActionButton positive" disabled={isCompleted || isDemo} onClick={() => onReminderStatusChange?.(item.reminder as Reminder, "Gönderildi")}>
                          <CheckCircle2 size={15} /> Gönderildi
                        </button>
                        <button type="button" className="messageActionButton danger" disabled={isCompleted || isDemo} onClick={() => onReminderStatusChange?.(item.reminder as Reminder, "İptal")}>
                          <XCircle size={15} /> İptal
                        </button>
                      </>
                    )}
                    {item.sourceType === "followUp" && item.followUp && (
                      <>
                        <button type="button" className="messageActionButton positive" disabled={isCompleted || isDemo} onClick={() => onFollowUpStatusChange?.(item.followUp as FollowUp, "Tamamlandı")}>
                          <CheckCircle2 size={15} /> Tamamla
                        </button>
                        <button type="button" className="messageActionButton danger" disabled={isCompleted || isDemo} onClick={() => onFollowUpStatusChange?.(item.followUp as FollowUp, "İptal")}>
                          <XCircle size={15} /> İptal
                        </button>
                      </>
                    )}
                    {isDemo && <span className="messageDemoHint">Demo kayıt</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
