import type { FollowUp } from "@/types/domain";
import { Target } from "lucide-react";

interface FollowUpsCardProps {
  followUps: FollowUp[];
}

export function FollowUpsCard({ followUps }: FollowUpsCardProps) {
  return (
    <section className="panel followUpsCard">
      <div className="panelHeader">
        <h2><Target size={20} /> Takipler</h2>
        <a href="#">Tümünü Gör →</a>
      </div>
      {followUps.map((item) => (
        <div className="followRow" key={item.id}>
          <div>
            <b>{item.customerName}</b>
            <p>{item.description}</p>
          </div>
          <span className={`due ${item.tone}`}>{item.dueLabel}</span>
        </div>
      ))}
      <button className="addFollow">+ Yeni Takip Ekle</button>
    </section>
  );
}
