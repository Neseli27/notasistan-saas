import type { Appointment } from "@/types/domain";
import { CalendarDays, FileText, MoreVertical } from "lucide-react";

interface AppointmentTableProps {
  title: string;
  customerLabel: string;
  serviceColumnLabel: string;
  appointments: Appointment[];
  showResourceColumn?: boolean;
  onAddNote?: (appointment: Appointment) => void;
}

function statusClass(status: string) {
  if (status === "Bekliyor") return "status waiting";
  if (status === "Tamamlandı") return "status done";
  if (status === "İptal" || status === "Gelmedi") return "status danger";
  return "status approved";
}

export function AppointmentTable({ title, customerLabel, serviceColumnLabel, appointments, showResourceColumn, onAddNote }: AppointmentTableProps) {
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

      {appointments.map((item) => (
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
              <span className={statusClass(item.status)} title={item.status}>{item.status}</span>
              {onAddNote && item.customerId ? (
                <button className="noteActionButton" onClick={() => onAddNote(item)} title="İşlem notu ekle">
                  <FileText size={16} /> Not
                </button>
              ) : (
                <button className="rowIconButton" type="button" title="Diğer işlemler">
                  <MoreVertical size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <button className="moreLink">+ {showResourceColumn ? "2" : "3"} randevu daha⌄</button>
    </section>
  );
}
