import type { CustomerActionRequest } from "@/types/domain";
import { CheckCircle2, Copy, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";

interface CustomerActionRequestsCardProps {
  requests: CustomerActionRequest[];
  onApprove?: (request: CustomerActionRequest) => void;
  onReject?: (request: CustomerActionRequest) => void;
  onCopyMessage?: (request: CustomerActionRequest, approved: boolean) => void;
  onApproveReschedule?: (request: CustomerActionRequest, newDate: string, newTime: string) => void;
  processingRequestId?: string | null;
}

function statusTone(status: CustomerActionRequest["status"]) {
  if (status === "Tamamlandı") return "green";
  if (status === "Reddedildi") return "red";
  if (status === "Görüldü") return "blue";
  return "orange";
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function CustomerActionRequestsCard({
  requests,
  onApprove,
  onReject,
  onCopyMessage,
  onApproveReschedule,
  processingRequestId,
}: CustomerActionRequestsCardProps) {
  const visibleRequests = requests.slice(0, 5);
  const [rescheduleDrafts, setRescheduleDrafts] = useState<Record<string, { date: string; time: string }>>({});

  function getDraft(request: CustomerActionRequest) {
    return rescheduleDrafts[request.id] ?? {
      date: request.requestedDate || request.appointmentDate || todayIso(),
      time: request.requestedTime || request.appointmentTime || "09:00",
    };
  }

  function updateDraft(requestId: string, patch: Partial<{ date: string; time: string }>) {
    setRescheduleDrafts((current) => ({
      ...current,
      [requestId]: {
        date: current[requestId]?.date || todayIso(),
        time: current[requestId]?.time || "09:00",
        ...patch,
      },
    }));
  }

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
            const isRescheduleRequest = request.type === "Erteleme";
            const draft = getDraft(request);

            return (
              <article key={request.id} className="customerActionRequestItem">
                <div className="customerActionRequestMain">
                  <strong>{request.customerName}</strong>
                  <span>{request.type} talebi • {request.appointmentService || "Randevu"}</span>
                  <p>{request.message}</p>
                  {request.appointmentDate && (
                    <small>Mevcut randevu: {request.appointmentDate} {request.appointmentTime ? `• ${request.appointmentTime}` : ""}</small>
                  )}
                  {request.requestedDate && (
                    <small>Talep edilen yeni zaman: {request.requestedDate} {request.requestedTime ? `• ${request.requestedTime}` : ""}</small>
                  )}

                  {!isClosed && isRescheduleRequest && (
                    <div className="rescheduleDecisionBox">
                      <label>
                        <span>Yeni tarih</span>
                        <input
                          type="date"
                          value={draft.date}
                          onChange={(event) => updateDraft(request.id, { date: event.target.value })}
                        />
                      </label>
                      <label>
                        <span>Yeni saat</span>
                        <input
                          type="time"
                          value={draft.time}
                          onChange={(event) => updateDraft(request.id, { time: event.target.value })}
                        />
                      </label>
                    </div>
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
                        {isRescheduleRequest ? (
                          <button
                            type="button"
                            disabled={isProcessing || !draft.date || !draft.time}
                            onClick={() => onApproveReschedule?.(request, draft.date, draft.time)}
                            className="approveActionButton"
                            title="Randevuyu yeni tarih/saat ile güncelle ve talebi tamamla"
                          >
                            <CheckCircle2 size={14} /> Ertele ve Onayla
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => onApprove?.(request)}
                            className="approveActionButton"
                            title="Talebi tamamlandı olarak işaretle"
                          >
                            <CheckCircle2 size={14} /> Onayla
                          </button>
                        )}
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
