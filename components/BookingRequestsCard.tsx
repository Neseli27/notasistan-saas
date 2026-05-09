import type { BookingRequest } from "@/types/domain";
import { CalendarClock, ExternalLink } from "lucide-react";

interface BookingRequestsCardProps {
  requests: BookingRequest[];
  publicUrl?: string;
}

function formatDate(date: string, time: string) {
  if (!date && !time) return "Zaman bekleniyor";
  return `${date || "Tarih yok"} ${time || ""}`.trim();
}

export function BookingRequestsCard({ requests, publicUrl }: BookingRequestsCardProps) {
  const visibleRequests = requests.slice(0, 4);

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
          {visibleRequests.map((request) => (
            <article className="bookingRequestItem" key={request.id}>
              <div className="avatarBadge">{request.customerName.slice(0, 2).toLocaleUpperCase("tr-TR")}</div>
              <div className="requestInfo">
                <strong>{request.customerName}</strong>
                <span>{request.service} • {formatDate(request.preferredDate, request.preferredTime)}</span>
                <small>{request.customerPhone}{request.notes ? ` • ${request.notes}` : ""}</small>
              </div>
              <span className="statusPill pendingPill">{request.status}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
