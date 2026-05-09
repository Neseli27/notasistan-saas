import { ChevronLeft, ChevronRight } from "lucide-react";

const days = ["29", "30", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "1", "2"];
const dotted = new Set(["17", "22", "24"]);

export function CalendarCard() {
  return (
    <section className="panel calendarCard">
      <div className="calendarTop">
        <ChevronLeft size={18} />
        <h2>Mayıs 2024</h2>
        <ChevronRight size={18} />
      </div>
      <div className="weekdays"><span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span></div>
      <div className="dateGrid">
        {days.map((day, index) => {
          const muted = index < 2 || index > 32;
          const active = day === "16" && index === 17;
          return <span className={`${muted ? "mutedDate" : ""} ${active ? "activeDate" : ""} ${dotted.has(day) ? "dottedDate" : ""}`} key={`${day}-${index}`}>{day}</span>;
        })}
      </div>
    </section>
  );
}
