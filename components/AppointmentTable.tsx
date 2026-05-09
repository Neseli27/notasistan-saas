import { CalendarDays, MoreVertical } from "lucide-react";
import { appointments } from "@/lib/mock-data";

function statusClass(status: string) {
  if (status === "Bekliyor") return "status waiting";
  if (status === "Tamamlandı") return "status done";
  if (status === "İptal" || status === "Gelmedi") return "status danger";
  return "status approved";
}

export function AppointmentTable() {
  return (
    <section className="panel appointmentPanel">
      <div className="panelHeader">
        <h2><CalendarDays size={20} /> Bugünkü Randevular</h2>
        <a href="#">Tümünü Gör →</a>
      </div>

      <div className="tableHeader appointmentGrid">
        <span>Saat</span>
        <span>Müşteri</span>
        <span>Hizmet</span>
        <span>Durum</span>
      </div>

      {appointments.map((item) => (
        <div className="appointmentGrid tableRow" key={item.id}>
          <strong>{item.time}</strong>
          <div className="personCell">
            <div className="avatar smallAvatar">{item.avatar}</div>
            <div>
              <b>{item.customerName}</b>
              <p>{item.customerPhone}</p>
            </div>
          </div>
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
      <button className="moreLink">+ 3 randevu daha⌄</button>
    </section>
  );
}
