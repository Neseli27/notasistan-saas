import type { Customer } from "@/types/domain";
import { CalendarDays, ChevronRight, Mail, MoreVertical, Phone, Sparkles, Star, StickyNote, UserRound } from "lucide-react";

interface CustomerCardProps {
  customer?: Customer | null;
  customerLabel: string;
  historyLabel?: string;
}

export function CustomerCard({ customer, customerLabel, historyLabel = "Hizmet Geçmişi" }: CustomerCardProps) {
  if (!customer) {
    return (
      <section className="panel customerCard emptyCustomerCard">
        <div className="panelHeader">
          <h2>{customerLabel} Kartı</h2>
          <div className="iconActions"><Star size={18} /><MoreVertical size={18} /></div>
        </div>
        <div className="emptyStateBox compactEmptyState">
          <UserRound size={34} />
          <b>Henüz {customerLabel.toLocaleLowerCase("tr-TR")} seçilmedi.</b>
          <p>İlk gerçek kaydı oluşturduğunuzda müşteri kartı burada görünecek.</p>
        </div>
      </section>
    );
  }

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
          <p><Phone size={16} /> {customer.phone || "Telefon bilgisi yok"}</p>
          <p><Mail size={16} /> {customer.email || "E-posta bilgisi yok"}</p>
        </div>
      </div>
      <div className="customerFacts">
        <div><span><CalendarDays size={17} /> Son Ziyaret</span><b>{customer.lastVisit || "Henüz ziyaret yok"}</b></div>
        <div><span><Star size={17} /> {historyLabel}</span><b>{customer.historyCount || 0} işlem</b></div>
        <div><span><StickyNote size={17} /> Tercihler / Notlar</span><b>{customer.notes || "Not girilmedi"}</b></div>
      </div>
      <button className="nextAction">
        <Sparkles size={18} />
        <span><b>Önerilen Sonraki Adım</b>{customer.nextAction || "Sonraki adım henüz belirlenmedi."}</span>
        <ChevronRight size={18} />
      </button>
    </section>
  );
}
