import type { CustomerActionRequest } from "@/types/domain";
import { CheckCircle2, Copy, RefreshCw, XCircle } from "lucide-react";

interface CustomerActionRequestsCardProps {
  requests: CustomerActionRequest[];
  onApprove?: (request: CustomerActionRequest) => void;
  onReject?: (request: CustomerActionRequest) => void;
  onCopyMessage?: (request: CustomerActionRequest, approved: boolean) => void;
  processingRequestId?: string | null;
}

function statusTone(status: CustomerActionRequest["status"]) {
  if (status === "Tamamlandı") return "green";
  if (status === "Reddedildi") return "red";
  if (status === "Görüldü") return "blue";
  return "orange";
}

export function CustomerActionRequestsCard({
  requests,
  onApprove,
  onReject,
  onCopyMessage,
  processingRequestId,
}: CustomerActionRequestsCardProps) {
  const visibleRequests = requests.slice(0, 5);

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
          {visibleRequests.map((request) => {
            const isClosed = request.status === "Tamamlandı" || request.status === "Reddedildi";
            const isProcessing = processingRequestId === request.id;

            return (
              <article key={request.id} className="customerActionRequestItem">
                <div className="customerActionRequestMain">
                  <strong>{request.customerName}</strong>
                  <span>{request.type} talebi • {request.appointmentService || "Randevu"}</span>
                  <p>{request.message}</p>
                  {request.appointmentDate && (
                    <small>{request.appointmentDate} {request.appointmentTime ? `• ${request.appointmentTime}` : ""}</small>
                  )}
                </div>

                <div className="customerActionDecisionColumn">
                  <em className={`statusBadge ${statusTone(request.status)}`}>{request.status}</em>
                  <div className="customerActionDecisionButtons">
                    <button
                      type="button"
                      onClick={() => onCopyMessage?.(request, true)}
                      title="Müşteriye olumlu dönüş metnini kopyala"
                    >
                      <Copy size={14} /> Olumlu Metin
                    </button>
                    {!isClosed && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onApprove?.(request)}
                          className="approveActionButton"
                          title="Talebi tamamlandı olarak işaretle"
                        >
                          <CheckCircle2 size={14} /> Onayla
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onReject?.(request)}
                          className="rejectActionButton"
                          title="Talebi reddedildi olarak işaretle"
                        >
                          <XCircle size={14} /> Reddet
                        </button>
                      </>
                    )}
                    {request.status === "Reddedildi" && (
                      <button
                        type="button"
                        onClick={() => onCopyMessage?.(request, false)}
                        title="Müşteriye red/uygunluk metnini kopyala"
                      >
                        <Copy size={14} /> Red Metni
                      </button>
                    )}
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
