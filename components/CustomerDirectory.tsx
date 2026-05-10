"use client";

import type { Appointment, AppointmentNote, Customer, Sector } from "@/types/domain";
import { CalendarDays, ChevronRight, Clock3, Mail, Phone, Search, Sparkles, StickyNote, UserRound, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";

interface CustomerDirectoryProps {
  customers: Customer[];
  appointments: Appointment[];
  appointmentNotes: AppointmentNote[];
  customerLabel: string;
  sector: Sector;
  historyLabel?: string;
  onAddCustomer?: () => void;
}

const segmentOptions = ["Tümü", "Yeni", "Düzenli", "VIP", "Riskli", "Geri Çağır"] as const;

type SegmentFilter = (typeof segmentOptions)[number];

function sectorResourceLabel(sector: Sector) {
  if (sector === "auto") return "Araç / Plaka";
  if (sector === "education") return "Öğrenci / Seviye";
  if (sector === "clinic") return "Kontrol / Tercih";
  if (sector === "consulting") return "Kurum / Konu";
  return "Tercih / Hassasiyet";
}

function getSectorSummary(customer: Customer, sector: Sector) {
  const data = customer.sectorData ?? {};

  if (sector === "auto") {
    return [data["Araç"], data["Plaka"], data["Kilometre / yakıt"]].filter(Boolean).join(" • ") || "Araç bilgisi tamamlanacak";
  }

  if (sector === "education") {
    return [data["Veli"], data["Sınıf / seviye"], data["Eksik konu"]].filter(Boolean).join(" • ") || "Öğrenci bilgisi tamamlanacak";
  }

  if (sector === "clinic") {
    return [data["Kontrol zamanı"], data["Tercih"], data["Özel not"]].filter(Boolean).join(" • ") || "Kontrol bilgisi tamamlanacak";
  }

  if (sector === "consulting") {
    return [data["Kurum / şirket"], data["Görüşme konusu"], data["Beklenen çıktı"]].filter(Boolean).join(" • ") || "Görüşme bilgisi tamamlanacak";
  }

  return [data["Cilt / saç tipi"], data["Tercih"], data["Hassasiyet"]].filter(Boolean).join(" • ") || "Tercih bilgisi tamamlanacak";
}

function findCustomerAppointments(customer: Customer, appointments: Appointment[]) {
  return appointments.filter((appointment) => {
    if (appointment.customerId && appointment.customerId === customer.id) return true;
    if (appointment.customerPhone && appointment.customerPhone === customer.phone) return true;
    return appointment.customerName === customer.name;
  });
}

function findCustomerNotes(customer: Customer, notes: AppointmentNote[]) {
  return notes.filter((note) => {
    if (note.customerId && note.customerId === customer.id) return true;
    return note.customerName === customer.name;
  });
}

export function CustomerDirectory({
  customers,
  appointments,
  appointmentNotes,
  customerLabel,
  sector,
  historyLabel = "İşlem Geçmişi",
  onAddCustomer,
}: CustomerDirectoryProps) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<SegmentFilter>("Tümü");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

    return customers.filter((customer) => {
      const resourceSummary = getSectorSummary(customer, sector).toLocaleLowerCase("tr-TR");
      const matchesQuery = !normalizedQuery
        || customer.name.toLocaleLowerCase("tr-TR").includes(normalizedQuery)
        || customer.phone.toLocaleLowerCase("tr-TR").includes(normalizedQuery)
        || customer.email.toLocaleLowerCase("tr-TR").includes(normalizedQuery)
        || resourceSummary.includes(normalizedQuery);

      const matchesSegment = segment === "Tümü" || customer.segment === segment;
      return matchesQuery && matchesSegment;
    });
  }, [customers, query, segment, sector]);

  const customerStats = useMemo(() => {
    const vipCount = customers.filter((customer) => customer.segment === "VIP").length;
    const recallCount = customers.filter((customer) => customer.segment === "Geri Çağır" || customer.segment === "Riskli").length;
    const withAppointmentCount = customers.filter((customer) => findCustomerAppointments(customer, appointments).length > 0).length;

    return { vipCount, recallCount, withAppointmentCount };
  }, [customers, appointments]);

  const selectedAppointments = selectedCustomer ? findCustomerAppointments(selectedCustomer, appointments) : [];
  const selectedNotes = selectedCustomer ? findCustomerNotes(selectedCustomer, appointmentNotes) : [];

  return (
    <section className="panel customerDirectoryPanel">
      <div className="panelHeader customerDirectoryHeader">
        <h2><UsersRound size={20} /> {customerLabel} Listesi</h2>
        <button type="button" className="miniPrimaryButton" onClick={onAddCustomer}>{customerLabel} Ekle</button>
      </div>

      <div className="customerDirectoryToolbar">
        <div className="customerSearchBox">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${customerLabel}, telefon, e-posta veya ${sectorResourceLabel(sector).toLocaleLowerCase("tr-TR")} ara...`}
          />
        </div>
        <select value={segment} onChange={(event) => setSegment(event.target.value as SegmentFilter)}>
          {segmentOptions.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
      </div>

      <div className="customerDirectoryStats">
        <div><span>Toplam</span><strong>{customers.length}</strong></div>
        <div><span>Randevulu</span><strong>{customerStats.withAppointmentCount}</strong></div>
        <div><span>VIP</span><strong>{customerStats.vipCount}</strong></div>
        <div><span>Takip Gereken</span><strong>{customerStats.recallCount}</strong></div>
      </div>

      {customers.length === 0 ? (
        <div className="customerEmptyDirectory">
          <UserRound size={34} />
          <b>Henüz {customerLabel.toLocaleLowerCase("tr-TR")} kaydı yok.</b>
          <span>İlk kaydı oluşturduğunuzda burada listelenecek ve detay kartı oluşacak.</span>
        </div>
      ) : (
        <div className="customerDirectoryTable">
          <div className="customerDirectoryTableHeader">
            <span>{customerLabel}</span>
            <span>{sectorResourceLabel(sector)}</span>
            <span>Durum</span>
            <span>Sonraki Adım</span>
            <span></span>
          </div>

          {filteredCustomers.slice(0, 8).map((customer) => {
            const customerAppointments = findCustomerAppointments(customer, appointments);
            const customerNotes = findCustomerNotes(customer, appointmentNotes);

            return (
              <button type="button" className="customerDirectoryRow" key={customer.id} onClick={() => setSelectedCustomer(customer)}>
                <div className="customerDirectoryPerson">
                  <div className="avatar smallAvatar">{customer.avatar}</div>
                  <div>
                    <b>{customer.name}</b>
                    <span><Phone size={13} /> {customer.phone}</span>
                    {customer.email && <span><Mail size={13} /> {customer.email}</span>}
                  </div>
                </div>
                <div className="customerDirectoryResource">
                  <b>{getSectorSummary(customer, sector)}</b>
                  <span>{customerAppointments.length} randevu • {customerNotes.length} işlem notu</span>
                </div>
                <div><span className={`customerSegment segment-${customer.segment.replace(" ", "-").toLocaleLowerCase("tr-TR")}`}>{customer.segment}</span></div>
                <div className="customerDirectoryNextAction">{customer.nextAction}</div>
                <ChevronRight size={18} />
              </button>
            );
          })}

          {filteredCustomers.length === 0 && (
            <p className="customerDirectoryNoResult">Arama/filtreye uygun kayıt bulunamadı.</p>
          )}
        </div>
      )}

      {selectedCustomer && (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <section className="modalCard customerDetailModal">
            <div className="modalHeader">
              <div>
                <span className="eyebrow">{customerLabel} Detayı</span>
                <h2>{selectedCustomer.name}</h2>
                <p>{selectedCustomer.phone} {selectedCustomer.email ? `• ${selectedCustomer.email}` : ""}</p>
              </div>
              <button className="modalClose" onClick={() => setSelectedCustomer(null)} aria-label="Kapat"><X size={20} /></button>
            </div>

            <div className="customerDetailGrid">
              <div className="customerDetailHero">
                <div className="avatar bigAvatar">{selectedCustomer.avatar}</div>
                <div>
                  <b>{selectedCustomer.segment}</b>
                  <span>{getSectorSummary(selectedCustomer, sector)}</span>
                </div>
              </div>
              <div className="customerDetailKpis">
                <div><CalendarDays size={18} /><span>Randevu</span><strong>{selectedAppointments.length}</strong></div>
                <div><StickyNote size={18} /><span>{historyLabel}</span><strong>{selectedNotes.length || selectedCustomer.historyCount}</strong></div>
                <div><Clock3 size={18} /><span>Son ziyaret</span><strong>{selectedCustomer.lastVisit}</strong></div>
              </div>
            </div>

            <div className="customerDetailSections">
              <section>
                <h3>Notlar ve sonraki adım</h3>
                <p>{selectedCustomer.notes}</p>
                <div className="customerDetailNextAction"><Sparkles size={17} /> {selectedCustomer.nextAction}</div>
              </section>

              <section>
                <h3>Sektör bilgileri</h3>
                <div className="customerSectorDataList">
                  {Object.keys(selectedCustomer.sectorData ?? {}).length === 0 ? (
                    <span>Ek sektör bilgisi yok.</span>
                  ) : Object.entries(selectedCustomer.sectorData ?? {}).map(([key, value]) => (
                    <div key={key}><span>{key}</span><b>{value || "-"}</b></div>
                  ))}
                </div>
              </section>

              <section>
                <h3>Randevu geçmişi</h3>
                <div className="customerDetailMiniList">
                  {selectedAppointments.length === 0 ? <span>Bu müşteriye bağlı randevu yok.</span> : selectedAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id}>
                      <b>{appointment.service}</b>
                      <span>{appointment.date || "Tarih yok"} • {appointment.time} • {appointment.status}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3>İşlem özetleri</h3>
                <div className="customerDetailMiniList">
                  {selectedNotes.length === 0 ? <span>Bu müşteriye açık işlem özeti yok.</span> : selectedNotes.slice(0, 5).map((note) => (
                    <div key={note.id}>
                      <b>{note.service}</b>
                      <span>{note.customerSummary || note.nextAction}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
