"use client";

import type { AppointmentStatusLog } from "@/types/domain";
import { History, MessageSquareText } from "lucide-react";
import { useState } from "react";

interface StatusHistoryCardProps {
  logs: AppointmentStatusLog[];
}

function statusTone(status: string) {
  if (status === "Tamamlandı") return "done";
  if (status === "Onaylandı") return "approved";
  if (status === "Gelmedi" || status === "İptal") return "danger";
  return "waiting";
}

function shortDate(value: unknown) {
  if (!value) return "Yeni";

  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return "Yeni";
}

export function StatusHistoryCard({ logs }: StatusHistoryCardProps) {
  const [copiedId, setCopiedId] = useState("");
  const visibleLogs = logs.slice(0, 4);

  async function copyMessage(log: AppointmentStatusLog) {
    try {
      await navigator.clipboard.writeText(log.message);
      setCopiedId(log.id);
      window.setTimeout(() => setCopiedId(""), 2200);
    } catch (error) {
      console.error("Geçmiş mesajı kopyalanamadı:", error);
      window.alert(log.message);
    }
  }

  return (
    <section className="panel statusHistoryCard">
      <div className="panelHeader">
        <h2><History size={20} /> Durum Geçmişi</h2>
        <a href="#">Son İşlemler</a>
      </div>

      {visibleLogs.length === 0 ? (
        <div className="emptyRequestState compactEmptyState">
          <History size={22} />
          <strong>Henüz durum geçmişi yok.</strong>
          <span>Randevu durumu değiştirildiğinde kayıtlar burada görünecek.</span>
        </div>
      ) : (
        <div className="statusHistoryList">
          {visibleLogs.map((log) => (
            <article className="statusHistoryItem" key={log.id}>
              <div>
                <strong>{log.customerName}</strong>
                <span>{log.service} • {shortDate(log.createdAt)}</span>
                <small>{log.previousStatus} → <b className={statusTone(log.newStatus)}>{log.newStatus}</b></small>
              </div>
              <button type="button" onClick={() => copyMessage(log)}>
                <MessageSquareText size={15} /> {copiedId === log.id ? "Kopyalandı" : "Mesaj"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
