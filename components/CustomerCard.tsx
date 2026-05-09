import { featuredCustomer } from "@/lib/mock-data";
import { CalendarDays, ChevronRight, Mail, MoreVertical, Phone, Sparkles, Star, StickyNote } from "lucide-react";

export function CustomerCard() {
  return (
    <section className="panel customerCard">
      <div className="panelHeader">
        <h2>Müşteri Kartı</h2>
        <div className="iconActions"><Star size={18} /><MoreVertical size={18} /></div>
      </div>
      <div className="customerTop">
        <div className="avatar bigAvatar">{featuredCustomer.avatar}</div>
        <div>
          <h3>{featuredCustomer.name}</h3>
          <p><Phone size={16} /> {featuredCustomer.phone}</p>
          <p><Mail size={16} /> {featuredCustomer.email}</p>
        </div>
      </div>
      <div className="customerFacts">
        <div><span><CalendarDays size={17} /> Son Ziyaret</span><b>{featuredCustomer.lastVisit}</b></div>
        <div><span><Star size={17} /> Hizmet Geçmişi</span><b>{featuredCustomer.historyCount} işlem</b></div>
        <div><span><StickyNote size={17} /> Tercihler / Notlar</span><b>{featuredCustomer.notes}</b></div>
      </div>
      <button className="nextAction">
        <Sparkles size={18} />
        <span><b>Önerilen Sonraki Adım</b>{featuredCustomer.nextAction}</span>
        <ChevronRight size={18} />
      </button>
    </section>
  );
}
