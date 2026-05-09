import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "blue" | "orange" | "green" | "purple";
}

export function StatCard({ title, value, detail, icon: Icon, tone }: StatCardProps) {
  return (
    <article className="statCard">
      <div className={`statIcon ${tone}`}>
        <Icon size={26} />
      </div>
      <div className="statContent">
        <span>{title}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
      <button className="circleButton" aria-label="detay">
        <ChevronRight size={18} />
      </button>
    </article>
  );
}
