"use client";

import type { Appointment, AppointmentStatus } from "@/types/domain";
import { CalendarDays, Edit3, FileText, MoreVertical, Trash2 } from "lucide-react";

interface AppointmentTableProps {
  title: string;
  customerLabel: string;
  serviceColumnLabel: string;
  appointments: Appointment[];
  showResourceColumn?: boolean;
  onAddNote?: (appointment: Appointment) => void;
  onStatusChange?: (appointment: Appointment, status: AppointmentStatus) => Promise<void> | void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => Promise<void> | void;
  updatingAppointmentId?: string | null;
  deletingAppointmentId?: string | null;
}

const statusOptions: AppointmentStatus[] = ["Bekliyor", "Onaylandı", "Tamamlandı", "Gelmedi", "İptal"];

function statusClass(status: string) {
  if (status === "Bekliyor") return "waiting";
  if (status === "Tamamlandı") return "done";
  if (status === "İptal" || status === "Gelmedi") return "danger";
  return "approved";
}

export function AppointmentTable({
  title,
  customerLabel,
  serviceColumnLabel,
  appointments,
  showResourceColumn,
  onAddNote,
  onStatusChange,
  onEdit,
  onDelete,
  updatingAppointmentId,
  deletingAppointmentId,
}: AppointmentTableProps) {
  const gridClass = showResourceColumn ? "appointmentGrid appointmentGridWithResource" : "appointmentGrid";

  return (
    <section className="panel appointmentPanel">
      <div className="panelHeader">
        <h2><CalendarDays size={20} /> {title}</h2>
        <a href="#">Tümünü Gör →</a>
      </div>

      <div className={`tableHeader ${gridClass}`}>
        <span>Saat</span>
        <span>{customerLabel}</span>
        {showResourceColumn && <span>Araç</span>}
        <span>{serviceColumnLabel}</span>
        <span className="alignRight">Durum</span>
      </div>

      {appointments.map((item) => {
        const isUpdating = updatingAppointmentId === item.id;
        const isDeleting = deletingAppointmentId === item.id;
        const isDemoAppointment = item.tenantId === "demo";

        return (
          <div className={`${gridClass} tableRow`} key={item.id}>
            <strong>{item.time}</strong>
            <div className="personCell">
              <div className="avatar smallAvatar">{item.avatar}</div>
              <div>
                <b>{item.customerName}</b>
                <p>{item.customerPhone}</p>
              </div>
            </div>
            {showResourceColumn && (
              <div className="tableTextCell resourceCell">
                <b title={item.resourceName}>{item.resourceName}</b>
                <p title={item.resourceDetail}>{item.resourceDetail}</p>
              </div>
            )}
            <div className="tableTextCell serviceCell">
              <b title={item.service}>{item.service}</b>
              <p title={item.subService}>{item.subService}</p>
            </div>
            <div className="statusCell">
              <div className="statusActionGroup">
                {onStatusChange && !isDemoAppointment ? (
                  <select
                    className={`statusSelect ${statusClass(item.status)}`}
                    value={item.status}
                    disabled={isUpdating}
                    title="Randevu durumunu değiştir"
                    onChange={(event) => onStatusChange(item, event.target.value as AppointmentStatus)}
                  >
                    {statusOptions.map((status) => (
                      <option value={status} key={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`status ${statusClass(item.status)}`} title={item.status}>{item.status}</span>
                )}

                <div className="appointmentActionButtons">
                  {onAddNote && item.customerId && !isDemoAppointment ? (
                    <button className="noteActionButton" onClick={() => onAddNote(item)} title="İşlem notu ekle" type="button">
                      <FileText size={15} /> Not
                    </button>
                  ) : (
                    <button className="rowIconButton" type="button" title="Diğer işlemler">
                      <MoreVertical size={18} />
                    </button>
                  )}

                  {onEdit && !isDemoAppointment && (
                    <button className="rowIconButton editRowButton" type="button" title="Randevuyu düzenle" onClick={() => onEdit(item)}>
                      <Edit3 size={15} />
                    </button>
                  )}

                  {onDelete && (
                    <button
                      className="rowIconButton dangerRowButton"
                      type="button"
                      title={isDemoAppointment ? "Demo randevuyu ekrandan kaldır" : "Randevuyu sil"}
                      disabled={isDeleting}
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <button className="moreLink">+ {showResourceColumn ? "2" : "3"} randevu daha⌄</button>
    </section>
  );
}
