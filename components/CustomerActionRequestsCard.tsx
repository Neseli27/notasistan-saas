import type { CustomerActionRequest } from "@/types/domain";
import { RefreshCw } from "lucide-react";

interface CustomerActionRequestsCardProps {
  requests: CustomerActionRequest[];
}

function statusTone(status: CustomerActionRequest["status"]) {
  if (status === "Tamamlandı") return "green";
  if (status === "Reddedildi") return "red";
  if (status === "Görüldü") return "blue";
  return "orange";
}

export function CustomerActionRequestsCard({ requests }: CustomerActionRequestsCardProps) {
  const visibleRequests = requests.slice(0, 4);

  return (
    <section className="panel customerActionRequestsCard">
      <div className="panelHeader">
        <h2><RefreshCw size={19} /> Erteleme / İptal Talepleri</h2>
        <a>Tümünü Gör →</a>
      </div>

      {visibleRequests.length === 0 ? (
        <div className="emptyState compactEmptyState">
          <strong>Henüz müşteri işlem talebi yok.</strong>
          <p>Müşteri panelinden erteleme veya iptal talebi gönderildiğinde burada görünecek.</p>
        </div>
      ) : (
        <div className="customerActionRequestList">
          {visibleRequests.map((request) => (
            <article key={request.id} className="customerActionRequestItem">
              <div>
                <strong>{request.customerName}</strong>
                <span>{request.type} talebi • {request.appointmentService || "Randevu"}</span>
                <p>{request.message}</p>
              </div>
              <em className={`statusBadge ${statusTone(request.status)}`}>{request.status}</em>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
