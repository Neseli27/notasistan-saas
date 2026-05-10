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
      {followUps.length === 0 ? (
        <div className="emptyStateBox compactEmptyState">
          <Target size={30} />
          <b>Henüz takip yok.</b>
          <p>Sonraki adım veya takip tarihi eklediğinizde kayıtlar burada görünecek.</p>
        </div>
      ) : followUps.map((item) => (
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
