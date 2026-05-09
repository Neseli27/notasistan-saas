import { followUps } from "@/lib/mock-data";
import { Target } from "lucide-react";

export function FollowUpsCard() {
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
