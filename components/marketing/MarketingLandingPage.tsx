import {
  ArrowRight,
  BellRing,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Crown,
  Gauge,
  HeartHandshake,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Store,
  UserRoundCheck,
} from "lucide-react";

type MarketingLandingPageProps = {
  focus?: "landing" | "pricing";
};

const sectors = [
  { title: "Klinikler", detail: "Hasta randevusu, kontrol zamanı, işlem özeti ve takip notları." },
  { title: "Güzellik merkezleri", detail: "Bakım geçmişi, paket yenileme, tercih ve hassasiyet notları." },
  { title: "Oto servisler", detail: "Araç, plaka, bakım zamanı, servis notu ve tekrar çağırma." },
  { title: "Kurs ve danışmanlık", detail: "Görüşme notu, veli bilgilendirme, takip ve hatırlatma." },
];

const features = [
  { icon: CalendarCheck2, title: "Randevu yönetimi", detail: "Randevu, durum, erteleme, iptal ve talep akışını tek panelde yönetin." },
  { icon: ClipboardList, title: "İşlem hafızası", detail: "Her müşterinin geçmiş işlemini, iç notunu ve sonraki adımını kaydedin." },
  { icon: BellRing, title: "Hatırlatma merkezi", detail: "WhatsApp, SMS ve e-posta için hazır hatırlatma metinleri oluşturun." },
  { icon: Bot, title: "AI Asistan", detail: "İşlem notlarını düzenleyin, müşteri mesajlarını sektör diline göre hazırlayın." },
  { icon: UserRoundCheck, title: "Müşteri paneli", detail: "Müşteri kendi randevularını, taleplerini ve açık işlem özetlerini takip eder." },
  { icon: ShieldCheck, title: "SaaS güvenliği", detail: "Tenant ve rol bazlı yapı ile her işletme yalnızca kendi verisini görür." },
];

const plans = [
  {
    name: "Başlangıç",
    price: "₺499",
    label: "Küçük ekipler",
    description: "Randevu, müşteri ve temel takip yönetimi için.",
    items: ["1 işletme", "3 kullanıcı", "250 müşteri", "Temel randevu yönetimi", "Public randevu sayfası"],
  },
  {
    name: "Profesyonel",
    price: "₺999",
    label: "En uygun paket",
    description: "Düzenli müşteri takibi ve AI destekli işletmeler için.",
    highlighted: true,
    items: ["10 kullanıcı", "2.000 müşteri", "Müşteri paneli", "Mesaj merkezi", "AI mesaj taslakları", "Tema ve marka ayarları"],
  },
  {
    name: "Klinik / Kurumsal",
    price: "Özel",
    label: "Çok şube",
    description: "Gelişmiş güvenlik, yüksek kapasite ve özel ihtiyaçlar için.",
    items: ["Çok şube", "Gelişmiş yetki", "Süper admin raporları", "Özel kurulum desteği", "KVKK süreçlerine hazırlık"],
  },
];

export function MarketingLandingPage({ focus = "landing" }: MarketingLandingPageProps) {
  const isPricing = focus === "pricing";

  return (
    <main className="marketingPage">
      <header className="marketingNav">
        <a href="/tanitim" className="marketingBrand" aria-label="Not Asistan tanıtım sayfası">
          <span className="marketingBrandMark"><img src="/icons/icon-192.png" alt="Not Asistan" /></span>
          <strong>Not Asistan</strong>
        </a>
        <nav>
          <a href="/tanitim#ozellikler">Özellikler</a>
          <a href="/tanitim#sektorler">Sektörler</a>
          <a href="/fiyatlandirma">Fiyatlandırma</a>
          <a href="/">Giriş</a>
        </nav>
      </header>

      <section className="marketingHero">
        <div className="marketingHeroText">
          <span className="marketingEyebrow"><Sparkles size={18} /> Randevu, not ve takip platformu</span>
          <h1>İşletmenizin müşteri hafızasını yapay zekâ ile güçlendirin.</h1>
          <p>
            Not Asistan; randevulu çalışan işletmeler için müşteri kaydı, randevu, işlem notu, hatırlatma,
            müşteri paneli ve AI destekli mesaj yönetimini tek panelde birleştirir.
          </p>
          <div className="marketingActions">
            <a className="marketingPrimary" href="/">Panele giriş yap <ArrowRight size={18} /></a>
            <a className="marketingSecondary" href="#fiyatlar">Paketleri incele</a>
          </div>
          <div className="marketingTrustRow">
            <span><CheckCircle2 size={17} /> PWA destekli müşteri paneli</span>
            <span><CheckCircle2 size={17} /> Çok sektörlü SaaS mimarisi</span>
            <span><CheckCircle2 size={17} /> Firebase + Vercel altyapısı</span>
          </div>
        </div>

        <div className="marketingHeroCard" aria-label="Not Asistan ürün özeti">
          <div className="heroCardHeader">
            <span><Store size={18} /> İşletme Paneli</span>
            <b>Bugün</b>
          </div>
          <div className="heroStatsMini">
            <div><strong>18</strong><span>Randevu</span></div>
            <div><strong>7</strong><span>Takip</span></div>
            <div><strong>42</strong><span>Mesaj</span></div>
          </div>
          <div className="heroTimeline">
            <div><b>09:30</b><span>Müşteri Randevusu</span><em>Onaylandı</em></div>
            <div><b>11:00</b><span>Kontrol / Takip Görüşmesi</span><em>Bekliyor</em></div>
            <div><b>14:00</b><span>İşlem Sonrası Özet</span><em>Tamamlandı</em></div>
          </div>
          <div className="heroAiBox">
            <MessageSquareText size={22} />
            <p><b>AI önerisi:</b> uzun süredir gelmeyen müşteriye nazik bir geri çağırma mesajı hazırlayın.</p>
          </div>
        </div>
      </section>

      <section className="marketingSection" id="ozellikler">
        <div className="sectionHeading">
          <span><Layers3 size={18} /> Modüler yapı</span>
          <h2>Randevudan sonra başlayan asıl değeri yönetin.</h2>
          <p>Not Asistan yalnızca randevu sistemi değildir; müşteriyi, yapılan işlemi ve sonraki adımı hatırlayan işletme hafızasıdır.</p>
        </div>
        <div className="featureGrid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="featureCard" key={feature.title}>
                <Icon size={28} />
                <h3>{feature.title}</h3>
                <p>{feature.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="marketingSection split" id="sektorler">
        <div className="sectionHeading alignLeft">
          <span><Gauge size={18} /> Sektöre uyumlu</span>
          <h2>Tek altyapı, farklı sektör dili.</h2>
          <p>İşletme otomotiv seçerse araç ve plaka; klinik seçerse hasta ve kontrol; güzellik seçerse tercih ve bakım dili öne çıkar.</p>
        </div>
        <div className="sectorList">
          {sectors.map((sector) => (
            <div className="sectorItem" key={sector.title}>
              <HeartHandshake size={20} />
              <div>
                <b>{sector.title}</b>
                <p>{sector.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`marketingSection ${isPricing ? "pricingFocus" : ""}`} id="fiyatlar">
        <div className="sectionHeading">
          <span><Crown size={18} /> Paketler</span>
          <h2>Başlangıç için sade, büyüme için esnek paketler.</h2>
          <p>Fiyatlar örnek taslaktır; gerçek fiyatlandırma, beta testleri ve mesaj/AI maliyetleri netleşince kesinleştirilebilir.</p>
        </div>
        <div className="pricingGrid">
          {plans.map((plan) => (
            <article className={`priceCard ${plan.highlighted ? "highlighted" : ""}`} key={plan.name}>
              <span>{plan.label}</span>
              <h3>{plan.name}</h3>
              <strong>{plan.price}<small>{plan.price === "Özel" ? "" : "/ay"}</small></strong>
              <p>{plan.description}</p>
              <ul>
                {plan.items.map((item) => <li key={item}><CheckCircle2 size={17} /> {item}</li>)}
              </ul>
              <a href="/" className={plan.highlighted ? "marketingPrimary full" : "marketingSecondary full"}>
                {plan.highlighted ? "Denemeye başla" : "Bilgi al"}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="marketingCta">
        <div>
          <span><Sparkles size={18} /> Not Asistan</span>
          <h2>Randevu biter, takip başlar.</h2>
          <p>İşletmenizin müşteri hafızasını, müşteri panelini ve akıllı mesaj yönetimini tek SaaS çatısında toplayın.</p>
        </div>
        <a href="/" className="marketingPrimary">Panele geç <ArrowRight size={18} /></a>
      </section>
    </main>
  );
}
