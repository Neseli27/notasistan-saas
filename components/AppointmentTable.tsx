import type { Appointment } from "@/types/domain";
import { CalendarDays, MoreVertical } from "lucide-react";

interface AppointmentTableProps {
  title: string;
  customerLabel: string;
  serviceColumnLabel: string;
  appointments: Appointment[];
  showResourceColumn?: boolean;
}

function statusClass(status: string) {
  if (status === "Bekliyor") return "status waiting";
  if (status === "Tamamlandı") return "status done";
  if (status === "İptal" || status === "Gelmedi") return "status danger";
  return "status approved";
}

export function AppointmentTable({ title, customerLabel, serviceColumnLabel, appointments, showResourceColumn }: AppointmentTableProps) {
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
        <span>Durum</span>
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
            <div>
              <b>{item.resourceName}</b>
              <p>{item.resourceDetail}</p>
            </div>
          )}
          <div>
            <b>{item.service}</b>
            <p>{item.subService}</p>
          </div>
          <div className="statusCell">
            <span className={statusClass(item.status)}>{item.status}</span>
            <MoreVertical size={18} />
          </div>
        </div>
      ))}
      <button className="moreLink">+ {showResourceColumn ? "2" : "3"} randevu daha⌄</button>
    </section>
  );
}
