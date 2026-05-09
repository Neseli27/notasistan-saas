import type { Reminder } from "@/types/domain";
import { Bell } from "lucide-react";

interface RemindersCardProps {
  reminders: Reminder[];
}

export function RemindersCard({ reminders }: RemindersCardProps) {
  return (
    <section className="panel remindersCard">
      <div className="panelHeader">
        <h2><Bell size={20} /> Hatırlatmalar</h2>
        <a href="#">Tümünü Gör →</a>
      </div>
      {reminders.map((item) => (
        <div className="reminderRow" key={item.id}>
          <div className="timeBlock"><b>{item.time}</b><span>{item.dateLabel}</span></div>
          <div><b>{item.title}</b><p>{item.description}</p></div>
          <span className={`channel ${item.channel === "WhatsApp" ? "whatsapp" : "sms"}`}>{item.channel}</span>
        </div>
      ))}
    </section>
  );
}
