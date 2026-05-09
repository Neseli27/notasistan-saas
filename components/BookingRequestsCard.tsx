"use client";

import type { BookingRequest } from "@/types/domain";
import { CalendarClock, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

interface BookingRequestsCardProps {
  requests: BookingRequest[];
  publicUrl?: string;
  tenantName?: string;
  onConvert?: (request: BookingRequest) => Promise<void> | void;
  convertingRequestId?: string | null;
}

function formatDate(date: string, time: string) {
  if (!date && !time) return "Zaman bekleniyor";
  return `${date || "Tarih yok"} ${time || ""}`.trim();
}

function buildConfirmationMessage(request: BookingRequest, tenantName?: string) {
  const businessName = tenantName || "Not Asistan";
  const dateText = formatDate(request.preferredDate, request.preferredTime);

  return `Merhaba ${request.customerName}, ${businessName} için ${request.service} randevu talebiniz alınmıştır. Tercih ettiğiniz zaman: ${dateText}. Randevunuz onay sürecindedir. Uygunluk durumuna göre sizinle kısa süre içinde iletişime geçeceğiz.`;
}

export function BookingRequestsCard({ requests, publicUrl, tenantName, onConvert, convertingRequestId }: BookingRequestsCardProps) {
  const visibleRequests = requests.slice(0, 4);
  const [copiedId, setCopiedId] = useState("");

  async function copyMessage(request: BookingRequest) {
    const message = buildConfirmationMessage(request, tenantName);

    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(request.id);
      window.setTimeout(() => setCopiedId(""), 2200);
    } catch (error) {
      console.error("Teyit mesajı kopyalanamadı:", error);
      window.alert(message);
    }
  }

  return (
    <section className="panel bookingRequestsCard">
      <div className="panelHeader">
        <div>
          <h2>Randevu Talepleri</h2>
          <p>Müşteri tarafındaki PWA randevu sayfasından gelen talepler.</p>
        </div>
        {publicUrl && (
          <a className="publicLinkButton" href={publicUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Linki Aç
          </a>
        )}
      </div>

      {visibleRequests.length === 0 ? (
        <div className="emptyRequestState">
          <CalendarClock size={24} />
          <strong>Henüz randevu talebi yok.</strong>
          <span>Müşteri randevu linkinizi paylaşınca talepler burada görünecek.</span>
        </div>
      ) : (
        <div className="bookingRequestList">
          {visibleRequests.map((request) => {
            const isConverted = request.status === "Randevuya Çevrildi";
            const isConverting = convertingRequestId === request.id;
            const copied = copiedId === request.id;

            return (
              <article className="bookingRequestItem" key={request.id}>
                <div className="avatarBadge">{request.customerName.slice(0, 2).toLocaleUpperCase("tr-TR")}</div>
                <div className="requestInfo">
                  <strong>{request.customerName}</strong>
                  <span>{request.service} • {formatDate(request.preferredDate, request.preferredTime)}</span>
                  <small>{request.customerPhone}{request.notes ? ` • ${request.notes}` : ""}</small>
                  <div className="bookingRequestActions">
                    <button
                      className="requestActionButton"
                      type="button"
                      onClick={() => copyMessage(request)}
                    >
                      <Copy size={14} /> {copied ? "Mesaj Kopyalandı" : "Teyit Mesajı"}
                    </button>
                    <button
                      className="requestActionButton primaryRequestAction"
                      type="button"
                      disabled={isConverted || isConverting || !onConvert}
                      onClick={() => onConvert?.(request)}
                    >
                      <CheckCircle2 size={14} /> {isConverted ? "Randevuya Çevrildi" : isConverting ? "Çevriliyor..." : "Randevuya Çevir"}
                    </button>
                  </div>
                </div>
                <span className={isConverted ? "statusPill convertedPill" : "statusPill pendingPill"}>{request.status}</span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
