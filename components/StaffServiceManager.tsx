"use client";

import { createServiceItem, createStaffMember, listenServiceItems, listenStaffMembers, updateServiceItemStatus, updateServiceItemVisibility, updateStaffMemberStatus } from "@/lib/services/catalog-service";
import { getSectorPreset } from "@/lib/sector-presets";
import type { Sector, ServiceItem, StaffMember } from "@/types/domain";
import { BriefcaseBusiness, CheckCircle2, Clock3, Eye, EyeOff, Plus, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

interface StaffServiceManagerProps {
  tenantId: string;
  sector: Sector;
}

const titleSuggestions: Record<Sector, string[]> = {
  beauty: ["Uzman Estetisyen", "Kuaför", "Güzellik Uzmanı", "Resepsiyon"],
  clinic: ["Doktor", "Uzman", "Diyetisyen", "Fizyoterapist", "Asistan"],
  auto: ["Servis Danışmanı", "Usta", "Elektrik Ustası", "Mekanik Usta"],
  education: ["Öğretmen", "Rehber Öğretmen", "Kurs Koordinatörü", "Danışman"],
  consulting: ["Danışman", "Proje Yöneticisi", "Uzman", "Asistan"],
};

const categorySuggestions: Record<Sector, string[]> = {
  beauty: ["Bakım", "Saç", "Cilt", "Paket"],
  clinic: ["Kontrol", "Muayene", "Tedavi", "Danışmanlık"],
  auto: ["Bakım", "Mekanik", "Elektrik", "Lastik"],
  education: ["Görüşme", "Ders", "Rehberlik", "Analiz"],
  consulting: ["Görüşme", "Rapor", "Strateji", "Teklif"],
};

function currencyText(value: number) {
  if (!value) return "Fiyat yok";
  return `${new Intl.NumberFormat("tr-TR").format(value)} ₺`;
}

export function StaffServiceManager({ tenantId, sector }: StaffServiceManagerProps) {
  const preset = getSectorPreset(sector);
  const [activeTab, setActiveTab] = useState<"staff" | "services">("staff");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [staffName, setStaffName] = useState("");
  const [staffTitle, setStaffTitle] = useState(titleSuggestions[sector][0]);
  const [staffPhone, setStaffPhone] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffSpecialty, setStaffSpecialty] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState(categorySuggestions[sector][0]);
  const [serviceDuration, setServiceDuration] = useState(45);
  const [servicePrice, setServicePrice] = useState(0);
  const [servicePublic, setServicePublic] = useState(true);

  useEffect(() => {
    setStaffTitle(titleSuggestions[sector][0]);
    setServiceCategory(categorySuggestions[sector][0]);
  }, [sector]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const unsubscribeStaff = listenStaffMembers(
      tenantId,
      (items) => {
        setStaff(items);
        setLoading(false);
      },
      () => {
        setError("Personel kayıtları okunamadı.");
        setLoading(false);
      }
    );

    const unsubscribeServices = listenServiceItems(
      tenantId,
      (items) => {
        setServices(items);
        setLoading(false);
      },
      () => {
        setError("Hizmet kayıtları okunamadı.");
        setLoading(false);
      }
    );

    return () => {
      unsubscribeStaff();
      unsubscribeServices();
    };
  }, [tenantId]);

  const activeStaffCount = useMemo(() => staff.filter((item) => item.isActive).length, [staff]);
  const activeServiceCount = useMemo(() => services.filter((item) => item.isActive).length, [services]);
  const publicServiceCount = useMemo(() => services.filter((item) => item.isActive && item.isPublic).length, [services]);

  async function handleCreateStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!staffName.trim()) {
      setError("Personel adı zorunludur.");
      return;
    }

    try {
      await createStaffMember({
        tenantId,
        sector,
        name: staffName,
        title: staffTitle,
        phone: staffPhone,
        email: staffEmail,
        specialty: staffSpecialty,
      });
      setStaffName("");
      setStaffPhone("");
      setStaffEmail("");
      setStaffSpecialty("");
      setMessage("Personel kaydı eklendi.");
      window.setTimeout(() => setMessage(""), 2400);
    } catch (err) {
      console.error(err);
      setError("Personel eklenemedi. Firestore bağlantısını kontrol edin.");
    }
  }

  async function handleCreateService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!serviceName.trim()) {
      setError("Hizmet / işlem adı zorunludur.");
      return;
    }

    try {
      await createServiceItem({
        tenantId,
        sector,
        name: serviceName,
        category: serviceCategory,
        durationMinutes: serviceDuration,
        price: servicePrice,
        isPublic: servicePublic,
      });
      setServiceName("");
      setServiceDuration(45);
      setServicePrice(0);
      setServicePublic(true);
      setMessage("Hizmet kaydı eklendi.");
      window.setTimeout(() => setMessage(""), 2400);
    } catch (err) {
      console.error(err);
      setError("Hizmet eklenemedi. Firestore bağlantısını kontrol edin.");
    }
  }

  return (
    <section className="panel catalogManagerPanel">
      <div className="panelHeader catalogHeader">
        <div>
          <h2><BriefcaseBusiness size={20} /> Personel ve Hizmetler</h2>
          <p>{preset.label} için personel, işlem ve public randevu hizmetlerini yönetin.</p>
        </div>
        <div className="catalogTabs" role="tablist" aria-label="Personel ve hizmet sekmeleri">
          <button className={activeTab === "staff" ? "active" : ""} onClick={() => setActiveTab("staff")} type="button">Personel</button>
          <button className={activeTab === "services" ? "active" : ""} onClick={() => setActiveTab("services")} type="button">Hizmetler</button>
        </div>
      </div>

      <div className="catalogStats">
        <div><span>Aktif personel</span><strong>{activeStaffCount}</strong></div>
        <div><span>Aktif hizmet</span><strong>{activeServiceCount}</strong></div>
        <div><span>Public hizmet</span><strong>{publicServiceCount}</strong></div>
      </div>

      {loading && <p className="formMessage successMessage">Personel ve hizmet kayıtları okunuyor...</p>}
      {message && <p className="formMessage successMessage">{message}</p>}
      {error && <p className="formMessage errorMessage">{error}</p>}

      {activeTab === "staff" ? (
        <div className="catalogContentGrid">
          <form className="catalogMiniForm" onSubmit={handleCreateStaff}>
            <h3><Plus size={17} /> Personel Ekle</h3>
            <label>Ad soyad<input value={staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="Örn. Mehmet Usta" /></label>
            <div className="formGridTwo">
              <label>Görev / unvan
                <select value={staffTitle} onChange={(event) => setStaffTitle(event.target.value)}>
                  {titleSuggestions[sector].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>Uzmanlık<input value={staffSpecialty} onChange={(event) => setStaffSpecialty(event.target.value)} placeholder="Örn. Mekanik bakım" /></label>
            </div>
            <div className="formGridTwo">
              <label>Telefon<input value={staffPhone} onChange={(event) => setStaffPhone(event.target.value)} placeholder="05xx xxx xx xx" /></label>
              <label>E-posta<input value={staffEmail} onChange={(event) => setStaffEmail(event.target.value)} placeholder="personel@mail.com" /></label>
            </div>
            <button className="primaryButton compactButton" type="submit">Personel Kaydet</button>
          </form>

          <div className="catalogList">
            {staff.length === 0 ? (
              <div className="catalogEmpty"><UsersRound size={28} /><b>Henüz personel yok.</b><span>İlk personeli ekleyince randevu formlarında seçilebilir olacak.</span></div>
            ) : staff.map((member) => (
              <div className="catalogListItem" key={member.id}>
                <div className="catalogAvatar">{member.name.split(" ").slice(0,2).map((part) => part[0]).join("").toLocaleUpperCase("tr-TR")}</div>
                <div>
                  <b>{member.name}</b>
                  <span>{member.title} {member.specialty ? `• ${member.specialty}` : ""}</span>
                  <small>{[member.phone, member.email].filter(Boolean).join(" • ") || "İletişim bilgisi yok"}</small>
                </div>
                <button className={member.isActive ? "catalogStatus active" : "catalogStatus"} onClick={() => updateStaffMemberStatus(member.id, !member.isActive)} type="button">
                  <CheckCircle2 size={15} /> {member.isActive ? "Aktif" : "Pasif"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="catalogContentGrid">
          <form className="catalogMiniForm" onSubmit={handleCreateService}>
            <h3><Plus size={17} /> Hizmet / İşlem Ekle</h3>
            <label>Hizmet adı<input value={serviceName} onChange={(event) => setServiceName(event.target.value)} placeholder="Örn. Periyodik Bakım" /></label>
            <div className="formGridTwo">
              <label>Kategori
                <select value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)}>
                  {categorySuggestions[sector].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>Süre / dakika<input type="number" min={5} value={serviceDuration} onChange={(event) => setServiceDuration(Number(event.target.value))} /></label>
            </div>
            <div className="formGridTwo">
              <label>Fiyat / TL<input type="number" min={0} value={servicePrice} onChange={(event) => setServicePrice(Number(event.target.value))} /></label>
              <label className="checkboxLabel catalogCheckbox"><input type="checkbox" checked={servicePublic} onChange={(event) => setServicePublic(event.target.checked)} /> Public randevu sayfasında göster</label>
            </div>
            <button className="primaryButton compactButton" type="submit">Hizmeti Kaydet</button>
          </form>

          <div className="catalogList">
            {services.length === 0 ? (
              <div className="catalogEmpty"><BriefcaseBusiness size={28} /><b>Henüz hizmet yok.</b><span>İşletmenin kendi hizmetlerini ekleyince randevu formları bu kayıtları kullanacak.</span></div>
            ) : services.map((item) => (
              <div className="catalogListItem serviceItem" key={item.id}>
                <div>
                  <b>{item.name}</b>
                  <span>{item.category} • <Clock3 size={13} /> {item.durationMinutes} dk • {currencyText(item.price)}</span>
                  <small>{item.isPublic ? "Müşteri randevu sayfasında görünür" : "Sadece işletme panelinde görünür"}</small>
                </div>
                <div className="catalogItemActions">
                  <button className={item.isPublic ? "catalogStatus active" : "catalogStatus"} onClick={() => updateServiceItemVisibility(item.id, !item.isPublic)} type="button">
                    {item.isPublic ? <Eye size={15} /> : <EyeOff size={15} />} {item.isPublic ? "Public" : "Gizli"}
                  </button>
                  <button className={item.isActive ? "catalogStatus active" : "catalogStatus"} onClick={() => updateServiceItemStatus(item.id, !item.isActive)} type="button">
                    <CheckCircle2 size={15} /> {item.isActive ? "Aktif" : "Pasif"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
