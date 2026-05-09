"use client";

import { auth } from "@/lib/firebase";
import {
  listenSuperAdminAppointments,
  listenSuperAdminBookingRequests,
  listenSuperAdminCustomerActionRequests,
  listenSuperAdminCustomers,
  listenSuperAdminTenants,
  listenSuperAdminUsers,
  updateTenantPlan,
  updateTenantStatus,
  type SuperAdminAppointment,
  type SuperAdminCustomer,
  type SuperAdminTenant,
  type SuperAdminUser,
} from "@/lib/services/super-admin-service";
import type { BookingRequest, CustomerActionRequest, Sector, TenantPlan, TenantPlanStatus, UserProfile } from "@/types/domain";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { Activity, Building2, CalendarClock, CheckCircle2, Copy, CreditCard, Crown, Database, LogOut, Search, ShieldCheck, Sparkles, UsersRound, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface SuperAdminPanelProps {
  user?: User;
  profile?: UserProfile;
}

type AdminTab = "overview" | "tenants" | "users" | "requests" | "plans" | "system";

const sectorLabels: Record<Sector, string> = {
  beauty: "Güzellik",
  clinic: "Klinik",
  auto: "Otomotiv",
  education: "Eğitim",
  consulting: "Danışmanlık",
};

const planOptions: TenantPlan[] = ["Starter", "Pro", "Klinik", "Enterprise"];
const planStatusOptions: TenantPlanStatus[] = ["Deneme", "Aktif", "Askıda", "İptal"];

const planConfig: Record<TenantPlan, { label: string; price: string; description: string; limits: string[] }> = {
  Starter: {
    label: "Başlangıç",
    price: "₺0 / deneme",
    description: "Tek kişi veya küçük işletme demosu için temel kullanım.",
    limits: ["1 işletme kullanıcısı", "50 müşteri", "100 randevu", "Demo AI metinleri"],
  },
  Pro: {
    label: "Profesyonel",
    price: "₺799 / ay",
    description: "Randevulu çalışan küçük işletmeler için tam operasyon paketi.",
    limits: ["5 kullanıcı", "1.000 müşteri", "Sınırsız randevu", "PWA müşteri paneli"],
  },
  Klinik: {
    label: "Klinik",
    price: "₺1.499 / ay",
    description: "Klinik, diyetisyen, danışmanlık ve hassas takip isteyen işletmeler.",
    limits: ["10 kullanıcı", "Gelişmiş kayıt takibi", "KVKK hazırlık alanları", "Özel işlem notları"],
  },
  Enterprise: {
    label: "Kurumsal",
    price: "Özel teklif",
    description: "Çok şubeli veya özel entegrasyon isteyen yapılar için.",
    limits: ["Çok şube", "Özel rol/yetki", "API hazırlığı", "Özel destek"],
  },
};

function getOpenRequestCount(requests: BookingRequest[]) {
  return requests.filter((request) => request.status === "Yeni Talep" || request.status === "Görüldü").length;
}

function getOpenActionCount(requests: CustomerActionRequest[]) {
  return requests.filter((request) => request.status === "Yeni Talep" || request.status === "Görüldü").length;
}

function getTenantName(tenantId: string, tenants: SuperAdminTenant[]) {
  return tenants.find((tenant) => tenant.id === tenantId)?.name || "Bilinmeyen İşletme";
}

function copyToClipboard(value: string) {
  if (!value) return;
  navigator.clipboard?.writeText(value).catch(() => undefined);
}

export function SuperAdminPanel({ user, profile }: SuperAdminPanelProps) {
  const [tenants, setTenants] = useState<SuperAdminTenant[]>([]);
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [customers, setCustomers] = useState<SuperAdminCustomer[]>([]);
  const [appointments, setAppointments] = useState<SuperAdminAppointment[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [customerActionRequests, setCustomerActionRequests] = useState<CustomerActionRequest[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyTenantId, setBusyTenantId] = useState("");
  const [busyPlanTenantId, setBusyPlanTenantId] = useState("");
  const [appOrigin, setAppOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const unsubscribers = [
      listenSuperAdminTenants(setTenants, () => setError("İşletme kayıtları okunamadı.")),
      listenSuperAdminUsers(setUsers, () => setError("Kullanıcı kayıtları okunamadı.")),
      listenSuperAdminCustomers(setCustomers, () => setError("Müşteri kayıtları okunamadı.")),
      listenSuperAdminAppointments(setAppointments, () => setError("Randevu kayıtları okunamadı.")),
      listenSuperAdminBookingRequests(setBookingRequests, () => setError("Randevu talepleri okunamadı.")),
      listenSuperAdminCustomerActionRequests(setCustomerActionRequests, () => setError("Müşteri erteleme/iptal talepleri okunamadı.")),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const tenantStats = useMemo(() => {
    return tenants.map((tenant) => {
      const tenantUsers = users.filter((item) => item.tenantId === tenant.id);
      const tenantCustomers = customers.filter((item) => item.tenantId === tenant.id);
      const tenantAppointments = appointments.filter((item) => item.tenantId === tenant.id);
      const tenantBookingRequests = bookingRequests.filter((item) => item.tenantId === tenant.id);
      const tenantActionRequests = customerActionRequests.filter((item) => item.tenantId === tenant.id);
      const openRequests = getOpenRequestCount(tenantBookingRequests) + getOpenActionCount(tenantActionRequests);

      return {
        ...tenant,
        userCount: tenantUsers.length,
        customerCount: tenantCustomers.length,
        appointmentCount: tenantAppointments.length,
        openRequestCount: openRequests,
      };
    });
  }, [appointments, bookingRequests, customerActionRequests, customers, tenants, users]);

  const filteredTenants = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase("tr-TR");
    if (!term) return tenantStats;

    return tenantStats.filter((tenant) => {
      const joined = `${tenant.name} ${tenant.slug} ${sectorLabels[tenant.sector]} ${tenant.id}`.toLocaleLowerCase("tr-TR");
      return joined.includes(term);
    });
  }, [searchTerm, tenantStats]);

  const recentAppointments = appointments.slice(0, 6);
  const recentRequests = [...bookingRequests.slice(0, 4), ...customerActionRequests.slice(0, 4)].slice(0, 6);
  const totalOpenRequests = getOpenRequestCount(bookingRequests) + getOpenActionCount(customerActionRequests);
  const activeTenants = tenants.filter((tenant) => tenant.isActive !== false).length;
  const planCounts = planOptions.reduce((acc, plan) => ({ ...acc, [plan]: tenants.filter((tenant) => (tenant.plan || "Starter") === plan).length }), {} as Record<TenantPlan, number>);
  const trialTenants = tenants.filter((tenant) => (tenant.planStatus || "Deneme") === "Deneme").length;
  const paidTenants = tenants.filter((tenant) => (tenant.planStatus || "Deneme") === "Aktif").length;
  const customerUsers = users.filter((item) => item.role === "customer").length;
  const ownerUsers = users.filter((item) => item.role === "owner" || item.role === "manager" || item.role === "staff").length;

  async function handleTenantStatus(tenant: SuperAdminTenant, isActive: boolean) {
    setBusyTenantId(tenant.id);
    setError("");
    setNotice("");

    try {
      await updateTenantStatus(tenant.id, isActive);
      setNotice(`${tenant.name} ${isActive ? "aktif" : "pasif"} olarak işaretlendi.`);
    } catch (err) {
      console.error("İşletme durumu güncellenemedi:", err);
      setError("İşletme durumu güncellenemedi. Firestore kurallarını kontrol edin.");
    } finally {
      setBusyTenantId("");
    }
  }

  async function handleTenantPlan(tenant: SuperAdminTenant, plan: TenantPlan, planStatus: TenantPlanStatus) {
    setBusyPlanTenantId(tenant.id);
    setError("");
    setNotice("");

    try {
      await updateTenantPlan(tenant.id, plan, planStatus);
      setNotice(`${tenant.name} paketi ${planConfig[plan].label} / ${planStatus} olarak güncellendi.`);
    } catch (err) {
      console.error("İşletme paketi güncellenemedi:", err);
      setError("İşletme paketi güncellenemedi. Firestore kurallarını kontrol edin.");
    } finally {
      setBusyPlanTenantId("");
    }
  }

  return (
    <main className="superAdminShell">
      <aside className="superAdminSidebar">
        <div className="superAdminBrand">
          <span><ShieldCheck size={24} /></span>
          <div>
            <b>Not Asistan</b>
            <small>Süper Admin</small>
          </div>
        </div>

        <nav className="superAdminNav" aria-label="Süper admin menüsü">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}><Activity size={18} /> Genel Bakış</button>
          <button className={activeTab === "tenants" ? "active" : ""} onClick={() => setActiveTab("tenants")}><Building2 size={18} /> İşletmeler</button>
          <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}><UsersRound size={18} /> Kullanıcılar</button>
          <button className={activeTab === "requests" ? "active" : ""} onClick={() => setActiveTab("requests")}><CalendarClock size={18} /> Talepler</button>
          <button className={activeTab === "plans" ? "active" : ""} onClick={() => setActiveTab("plans")}><CreditCard size={18} /> Paketler</button>
          <button className={activeTab === "system" ? "active" : ""} onClick={() => setActiveTab("system")}><Database size={18} /> Sistem</button>
        </nav>

        <div className="superAdminIdentity">
          <small>Oturum</small>
          <strong>{profile?.displayName || user?.email || "Süper Admin"}</strong>
          <span>{user?.email}</span>
          <button onClick={() => signOut(auth)} type="button"><LogOut size={16} /> Çıkış Yap</button>
        </div>
      </aside>

      <section className="superAdminMain">
        <header className="superAdminHeader">
          <div>
            <span className="superAdminEyebrow"><Sparkles size={16} /> SaaS Yönetim Merkezi</span>
            <h1>Not Asistan Süper Admin Paneli</h1>
            <p>Tüm işletmeleri, kullanıcıları, müşteri taleplerini ve sistem hareketini tek merkezden izleyin.</p>
          </div>
          <div className="superAdminSearch">
            <Search size={18} />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="İşletme, sektör, slug veya ID ara..." />
          </div>
        </header>

        {error && <div className="superAdminAlert error"><XCircle size={18} /> {error}</div>}
        {notice && <div className="superAdminAlert success"><CheckCircle2 size={18} /> {notice}</div>}

        <div className="superAdminStats">
          <article><span>Toplam İşletme</span><strong>{tenants.length}</strong><small>{activeTenants} aktif işletme</small></article>
          <article><span>Kullanıcı</span><strong>{users.length}</strong><small>{ownerUsers} işletme kullanıcısı · {customerUsers} müşteri</small></article>
          <article><span>Müşteri Kaydı</span><strong>{customers.length}</strong><small>Tüm tenant kayıtları</small></article>
          <article><span>Randevu</span><strong>{appointments.length}</strong><small>{appointments.filter((item) => item.status === "Bekliyor").length} bekleyen</small></article>
          <article><span>Açık Talep</span><strong>{totalOpenRequests}</strong><small>Randevu + erteleme/iptal</small></article>
          <article><span>Aktif Paket</span><strong>{paidTenants}</strong><small>{trialTenants} deneme · {planCounts.Pro + planCounts.Klinik + planCounts.Enterprise} ücretli aday</small></article>
        </div>

        {activeTab === "overview" && (
          <div className="superAdminGrid">
            <section className="superAdminPanel wide">
              <div className="superAdminPanelHeader">
                <h2>İşletme Özeti</h2>
                <button onClick={() => setActiveTab("tenants")}>Tümünü Gör</button>
              </div>
              <TenantTable
                tenants={filteredTenants.slice(0, 6)}
                appOrigin={appOrigin}
                busyTenantId={busyTenantId}
                onStatusChange={handleTenantStatus}
                busyPlanTenantId={busyPlanTenantId}
                onPlanChange={handleTenantPlan}
              />
            </section>

            <section className="superAdminPanel">
              <div className="superAdminPanelHeader"><h2>Son Randevular</h2></div>
              <div className="superAdminList">
                {recentAppointments.length === 0 ? <p className="superAdminEmpty">Henüz randevu yok.</p> : recentAppointments.map((appointment) => (
                  <article key={appointment.id}>
                    <b>{appointment.customerName}</b>
                    <span>{getTenantName(appointment.tenantId, tenants)} · {appointment.service}</span>
                    <small>{appointment.date || "Tarih yok"} {appointment.time || ""} · {appointment.status}</small>
                  </article>
                ))}
              </div>
            </section>

            <section className="superAdminPanel">
              <div className="superAdminPanelHeader"><h2>Son Talepler</h2></div>
              <div className="superAdminList">
                {recentRequests.length === 0 ? <p className="superAdminEmpty">Henüz talep yok.</p> : recentRequests.map((request) => (
                  <article key={request.id}>
                    <b>{"service" in request ? request.customerName : request.customerName}</b>
                    <span>{getTenantName(request.tenantId, tenants)}</span>
                    <small>{"service" in request ? `${request.service} · ${request.status}` : `${request.type} · ${request.status}`}</small>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "tenants" && (
          <section className="superAdminPanel wideOnly">
            <div className="superAdminPanelHeader"><h2>İşletmeler</h2><span>{filteredTenants.length} kayıt</span></div>
            <TenantTable tenants={filteredTenants} appOrigin={appOrigin} busyTenantId={busyTenantId} onStatusChange={handleTenantStatus} busyPlanTenantId={busyPlanTenantId} onPlanChange={handleTenantPlan} />
          </section>
        )}

        {activeTab === "users" && (
          <section className="superAdminPanel wideOnly">
            <div className="superAdminPanelHeader"><h2>Kullanıcılar</h2><span>{users.length} kayıt</span></div>
            <div className="superAdminTable userTable">
              <div className="superAdminTableHeader"><span>Kullanıcı</span><span>Rol</span><span>İşletme</span><span>Sektör</span></div>
              {users.map((item) => (
                <div className="superAdminTableRow" key={item.uid}>
                  <span><b>{item.displayName}</b><small>{item.email}</small></span>
                  <span><i>{item.role}</i></span>
                  <span>{item.tenantName || getTenantName(item.tenantId || "", tenants)}</span>
                  <span>{item.sector ? sectorLabels[item.sector] : "-"}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "requests" && (
          <section className="superAdminPanel wideOnly">
            <div className="superAdminPanelHeader"><h2>Randevu ve Müşteri Talepleri</h2><span>{bookingRequests.length + customerActionRequests.length} kayıt</span></div>
            <div className="superAdminRequestGrid">
              {bookingRequests.map((request) => (
                <article className="superAdminRequest" key={request.id}>
                  <span>Randevu Talebi</span>
                  <b>{request.customerName}</b>
                  <small>{getTenantName(request.tenantId, tenants)} · {request.service}</small>
                  <i>{request.preferredDate} {request.preferredTime} · {request.status}</i>
                </article>
              ))}
              {customerActionRequests.map((request) => (
                <article className="superAdminRequest" key={request.id}>
                  <span>{request.type} Talebi</span>
                  <b>{request.customerName}</b>
                  <small>{getTenantName(request.tenantId, tenants)} · {request.appointmentService || "Randevu"}</small>
                  <i>{request.appointmentDate || "Tarih yok"} {request.appointmentTime || ""} · {request.status}</i>
                </article>
              ))}
              {bookingRequests.length + customerActionRequests.length === 0 && <p className="superAdminEmpty">Henüz talep yok.</p>}
            </div>
          </section>
        )}

        {activeTab === "plans" && (
          <section className="superAdminPanel wideOnly">
            <div className="superAdminPanelHeader"><h2>Paket ve Abonelik Yönetimi</h2><span>{tenants.length} işletme</span></div>
            <div className="planSummaryGrid">
              {planOptions.map((plan) => (
                <article key={plan} className="planSummaryCard">
                  <div className="planSummaryIcon"><Crown size={18} /></div>
                  <span>{planConfig[plan].label}</span>
                  <strong>{planCounts[plan]}</strong>
                  <small>{planConfig[plan].price}</small>
                  <p>{planConfig[plan].description}</p>
                  <ul>{planConfig[plan].limits.map((limit) => <li key={limit}>{limit}</li>)}</ul>
                </article>
              ))}
            </div>
            <div className="superAdminPanelHeader planTableHeader"><h2>İşletme Paketleri</h2><span>Plan ve durum güncelle</span></div>
            <TenantTable
              tenants={filteredTenants}
              appOrigin={appOrigin}
              busyTenantId={busyTenantId}
              onStatusChange={handleTenantStatus}
              busyPlanTenantId={busyPlanTenantId}
              onPlanChange={handleTenantPlan}
            />
          </section>
        )}

        {activeTab === "system" && (
          <section className="superAdminPanel wideOnly">
            <div className="superAdminPanelHeader"><h2>Sistem Kontrol Listesi</h2></div>
            <div className="superAdminChecklist">
              <article><CheckCircle2 size={18} /><div><b>Firebase Authentication</b><span>Email/Password aktif; müşteri ve işletme hesapları ayrıldı.</span></div></article>
              <article><CheckCircle2 size={18} /><div><b>Firestore Koleksiyonları</b><span>tenants, users, customers, appointments, bookingRequests ve customerActionRequests okunuyor.</span></div></article>
              <article><CheckCircle2 size={18} /><div><b>PWA Müşteri Tarafı</b><span>İşletmeye özel randevu ve müşteri paneli linkleri oluşturuluyor.</span></div></article>
              <article><ShieldCheck size={18} /><div><b>Sonraki güvenlik adımı</b><span>Canlı kullanıma yaklaşırken tenant bazlı Firestore kuralları sıkılaştırılmalı.</span></div></article>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

interface TenantTableProps {
  tenants: Array<SuperAdminTenant & { userCount: number; customerCount: number; appointmentCount: number; openRequestCount: number }>;
  appOrigin: string;
  busyTenantId: string;
  busyPlanTenantId: string;
  onStatusChange: (tenant: SuperAdminTenant, isActive: boolean) => Promise<void> | void;
  onPlanChange: (tenant: SuperAdminTenant, plan: TenantPlan, planStatus: TenantPlanStatus) => Promise<void> | void;
}

function TenantTable({ tenants, appOrigin, busyTenantId, busyPlanTenantId, onStatusChange, onPlanChange }: TenantTableProps) {
  if (tenants.length === 0) return <p className="superAdminEmpty">Gösterilecek işletme yok.</p>;

  return (
    <div className="superAdminTable tenantTable">
      <div className="superAdminTableHeader">
        <span>İşletme</span><span>Sektör</span><span>Kayıtlar</span><span>Paket</span><span>Linkler</span><span>Durum</span>
      </div>
      {tenants.map((tenant) => {
        const bookingUrl = tenant.slug && appOrigin ? `${appOrigin}/randevu/${tenant.slug}` : "";
        const customerUrl = tenant.slug && appOrigin ? `${appOrigin}/musteri/${tenant.slug}` : "";
        const isActive = tenant.isActive !== false;
        const isBusy = busyTenantId === tenant.id;

        return (
          <div className="superAdminTableRow" key={tenant.id}>
            <span><b>{tenant.name}</b><small>{tenant.slug || tenant.id}</small></span>
            <span><i>{sectorLabels[tenant.sector]}</i></span>
            <span>
              <b>{tenant.customerCount} müşteri · {tenant.appointmentCount} randevu</b>
              <small>{tenant.userCount} kullanıcı · {tenant.openRequestCount} açık talep</small>
            </span>
            <span className="tenantPlanControls">
              <select
                value={tenant.plan || "Starter"}
                disabled={busyPlanTenantId === tenant.id}
                onChange={(event) => onPlanChange(tenant, event.target.value as TenantPlan, tenant.planStatus || "Deneme")}
              >
                {planOptions.map((plan) => <option key={plan} value={plan}>{planConfig[plan].label}</option>)}
              </select>
              <select
                value={tenant.planStatus || "Deneme"}
                disabled={busyPlanTenantId === tenant.id}
                onChange={(event) => onPlanChange(tenant, tenant.plan || "Starter", event.target.value as TenantPlanStatus)}
              >
                {planStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <small>{planConfig[tenant.plan || "Starter"].price}</small>
            </span>
            <span className="superAdminLinks">
              {bookingUrl ? <button onClick={() => copyToClipboard(bookingUrl)}><Copy size={14} /> Randevu</button> : <small>Link yok</small>}
              {customerUrl ? <button onClick={() => copyToClipboard(customerUrl)}><Copy size={14} /> Müşteri</button> : null}
            </span>
            <span className="tenantStatusControls">
              <b className={isActive ? "activeTenant" : "passiveTenant"}>{isActive ? "Aktif" : "Pasif"}</b>
              <button disabled={isBusy} onClick={() => onStatusChange(tenant, !isActive)}>
                {isBusy ? "İşleniyor" : isActive ? "Pasifleştir" : "Aktifleştir"}
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
