"use client";

import type { BookingRequest } from "@/types/domain";
import { CalendarClock, CheckCircle2, Copy, ExternalLink, Filter, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

interface BookingRequestsCardProps {
  requests: BookingRequest[];
  publicUrl?: string;
  tenantName?: string;
  onConvert?: (request: BookingRequest) => Promise<void> | void;
  onReject?: (request: BookingRequest) => Promise<void> | void;
  convertingRequestId?: string | null;
  rejectingRequestId?: string | null;
}

type RequestFilter = "open" | "converted" | "rejected" | "all";

function formatDate(date: string, time: string) {
  if (!date && !time) return "Zaman bekleniyor";
  return `${date || "Tarih yok"} ${time || ""}`.trim();
}

function buildConfirmationMessage(request: BookingRequest, tenantName?: string) {
  const businessName = tenantName || "Not Asistan";
  const dateText = formatDate(request.preferredDate, request.preferredTime);

  return `Merhaba ${request.customerName}, ${businessName} için ${request.service} randevu talebiniz alınmıştır. Tercih ettiğiniz zaman: ${dateText}. Randevunuz onay sürecindedir. Uygunluk durumuna göre sizinle kısa süre içinde iletişime geçeceğiz.`;
}

function buildRejectMessage(request: BookingRequest, tenantName?: string) {
  const businessName = tenantName || "Not Asistan";
  const dateText = formatDate(request.preferredDate, request.preferredTime);

  return `Merhaba ${request.customerName}, ${businessName} için ${request.service} talebinizi aldık. Ancak ${dateText} zamanı için şu anda uygun randevu oluşturamıyoruz. Size farklı bir zaman önermek için kısa süre içinde iletişime geçeceğiz.`;
}

function getStatusClass(status: BookingRequest["status"]) {
  if (status === "Randevuya Çevrildi") return "statusPill convertedPill";
  if (status === "Reddedildi" || status === "İptal") return "statusPill rejectedPill";
  if (status === "Görüldü") return "statusPill seenPill";
  return "statusPill pendingPill";
}

function isOpenRequest(request: BookingRequest) {
  return request.status === "Yeni Talep" || request.status === "Görüldü";
}

export function BookingRequestsCard({
  requests,
  publicUrl,
  tenantName,
  onConvert,
  onReject,
  convertingRequestId,
  rejectingRequestId,
}: BookingRequestsCardProps) {
  const [copiedId, setCopiedId] = useState("");
  const [activeFilter, setActiveFilter] = useState<RequestFilter>("open");

  const counts = useMemo(() => {
    return {
      open: requests.filter(isOpenRequest).length,
      converted: requests.filter((request) => request.status === "Randevuya Çevrildi").length,
      rejected: requests.filter((request) => request.status === "Reddedildi" || request.status === "İptal").length,
      all: requests.length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === "converted") return requests.filter((request) => request.status === "Randevuya Çevrildi");
    if (activeFilter === "rejected") return requests.filter((request) => request.status === "Reddedildi" || request.status === "İptal");
    if (activeFilter === "all") return requests;
    return requests.filter(isOpenRequest);
  }, [activeFilter, requests]);

  const visibleRequests = filteredRequests.slice(0, 5);

  async function copyMessage(request: BookingRequest, variant: "confirm" | "reject" = "confirm") {
    const message = variant === "confirm" ? buildConfirmationMessage(request, tenantName) : buildRejectMessage(request, tenantName);

    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(`${request.id}-${variant}`);
      window.setTimeout(() => setCopiedId(""), 2200);
    } catch (error) {
      console.error("Mesaj kopyalanamadı:", error);
      window.alert(message);
    }
  }

  return (
    <section className="panel bookingRequestsCard">
      <div className="panelHeader bookingHeaderWithMeta">
        <div>
          <h2>Randevu Talepleri</h2>
          <p>Müşteri tarafındaki PWA randevu sayfasından gelen talepleri yönetin.</p>
        </div>
        {publicUrl && (
          <a className="publicLinkButton" href={publicUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Linki Aç
          </a>
        )}
      </div>

      <div className="requestFilterBar" aria-label="Randevu talebi filtreleri">
        <span><Filter size={14} /> Filtre</span>
        <button className={activeFilter === "open" ? "active" : ""} type="button" onClick={() => setActiveFilter("open")}>Açık <b>{counts.open}</b></button>
        <button className={activeFilter === "converted" ? "active" : ""} type="button" onClick={() => setActiveFilter("converted")}>Randevu <b>{counts.converted}</b></button>
        <button className={activeFilter === "rejected" ? "active" : ""} type="button" onClick={() => setActiveFilter("rejected")}>Red <b>{counts.rejected}</b></button>
        <button className={activeFilter === "all" ? "active" : ""} type="button" onClick={() => setActiveFilter("all")}>Tümü <b>{counts.all}</b></button>
      </div>

      {visibleRequests.length === 0 ? (
        <div className="emptyRequestState">
          <CalendarClock size={24} />
          <strong>{requests.length === 0 ? "Henüz randevu talebi yok." : "Bu filtrede talep yok."}</strong>
          <span>{requests.length === 0 ? "Müşteri randevu linkinizi paylaşınca talepler burada görünecek." : "Diğer filtreleri seçerek talepleri görüntüleyebilirsiniz."}</span>
        </div>
      ) : (
        <div className="bookingRequestList">
          {visibleRequests.map((request) => {
            const isConverted = request.status === "Randevuya Çevrildi";
            const isRejected = request.status === "Reddedildi" || request.status === "İptal";
            const isConverting = convertingRequestId === request.id;
            const isRejecting = rejectingRequestId === request.id;
            const copiedConfirm = copiedId === `${request.id}-confirm`;
            const copiedReject = copiedId === `${request.id}-reject`;
            const canAct = !isConverted && !isRejected;

            return (
              <article className="bookingRequestItem managedRequestItem" key={request.id}>
                <div className="avatarBadge">{request.customerName.slice(0, 2).toLocaleUpperCase("tr-TR")}</div>
                <div className="requestInfo">
                  <strong>{request.customerName}</strong>
                  <span>{request.service} • {formatDate(request.preferredDate, request.preferredTime)}</span>
                  <small>{request.customerPhone}{request.notes ? ` • ${request.notes}` : ""}</small>
                  <div className="bookingRequestActions">
                    <button
                      className="requestActionButton"
                      type="button"
                      onClick={() => copyMessage(request, "confirm")}
                    >
                      <Copy size={14} /> {copiedConfirm ? "Kopyalandı" : "Teyit Metni"}
                    </button>
                    <button
                      className="requestActionButton primaryRequestAction"
                      type="button"
                      disabled={!canAct || isConverting || isRejecting || !onConvert}
                      onClick={() => onConvert?.(request)}
                    >
                      <CheckCircle2 size={14} /> {isConverted ? "Randevuya Çevrildi" : isConverting ? "Çevriliyor..." : "Randevuya Çevir"}
                    </button>
                    <button
                      className="requestActionButton dangerRequestAction"
                      type="button"
                      disabled={!canAct || isConverting || isRejecting || !onReject}
                      onClick={() => onReject?.(request)}
                    >
                      <XCircle size={14} /> {isRejected ? "Reddedildi" : isRejecting ? "İşleniyor..." : "Reddet"}
                    </button>
                    {isRejected && (
                      <button
                        className="requestActionButton"
                        type="button"
                        onClick={() => copyMessage(request, "reject")}
                      >
                        <Copy size={14} /> {copiedReject ? "Kopyalandı" : "Red Metni"}
                      </button>
                    )}
                  </div>
                </div>
                <span className={getStatusClass(request.status)}>{request.status}</span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
