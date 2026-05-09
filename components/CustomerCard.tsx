import type { Customer } from "@/types/domain";
import { CalendarDays, ChevronRight, Mail, MoreVertical, Phone, Sparkles, Star, StickyNote } from "lucide-react";

interface CustomerCardProps {
  customer: Customer;
  customerLabel: string;
  historyLabel?: string;
}

export function CustomerCard({ customer, customerLabel, historyLabel = "Hizmet Geçmişi" }: CustomerCardProps) {
  return (
    <section className="panel customerCard">
      <div className="panelHeader">
        <h2>{customerLabel} Kartı</h2>
        <div className="iconActions"><Star size={18} /><MoreVertical size={18} /></div>
      </div>
      <div className="customerTop">
        <div className="avatar bigAvatar">{customer.avatar}</div>
        <div>
          <h3>{customer.name}</h3>
          <p><Phone size={16} /> {customer.phone}</p>
          <p><Mail size={16} /> {customer.email}</p>
        </div>
      </div>
      <div className="customerFacts">
        <div><span><CalendarDays size={17} /> Son Ziyaret</span><b>{customer.lastVisit}</b></div>
        <div><span><Star size={17} /> {historyLabel}</span><b>{customer.historyCount} işlem</b></div>
        <div><span><StickyNote size={17} /> Tercihler / Notlar</span><b>{customer.notes}</b></div>
      </div>
      <button className="nextAction">
        <Sparkles size={18} />
        <span><b>Önerilen Sonraki Adım</b>{customer.nextAction}</span>
        <ChevronRight size={18} />
      </button>
    </section>
  );
}
