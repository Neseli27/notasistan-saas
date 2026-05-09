# Not Asistan SaaS

Randevu, müşteri notu, işlem hafızası, takip, müşteri paneli ve SaaS yönetimi için Firebase + Vercel + GitHub tabanlı başlangıç uygulaması.

## v1.8 Yenilikleri

Bu sürümde öncelik sırasındaki ilk büyük iş tamamlandı:

- Müşteri panelinden gelen **erteleme talebi** artık gerçek randevu güncellemesine bağlandı.
- İşletme panelindeki **Erteleme / İptal Talepleri** kartında erteleme talepleri için yeni tarih ve saat seçilebilir.
- **Ertele ve Onayla** butonu randevunun `date`, `time` ve `status` alanlarını Firestore’da günceller.
- Erteleme talebi `Tamamlandı` durumuna alınır.
- `customerActionRequests` kaydına `requestedDate`, `requestedTime`, `decisionMessage`, `handledBy` alanları yazılır.
- `appointmentStatusLogs` koleksiyonuna erteleme geçmişi kaydı eklenir.
- Müşteriye gönderilecek yeni randevu bilgilendirme metni hazırlanır ve panelde kopyalanabilir.
- `package.json` sürümü `1.8.0` oldu.

## Önceki ana özellikler

- Sektöre göre dashboard
- Firebase Authentication
- Firestore müşteri ve randevu kayıtları
- Public randevu talep sayfası
- Müşteri paneli
- Erteleme / iptal talebi oluşturma
- Süper Admin paneli
- SaaS paket yönetimi

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcı:

```text
http://localhost:3000
```

## Yayına gönderme

```bash
git status
git add .
git commit -m "Erteleme talebi randevu guncellemesine baglandi"
git push
```

## Not

Firestore güvenlik kuralları geliştirme sürecinde geniş tutulmuştur. Beta/gerçek kullanım öncesinde tenant, kullanıcı rolü ve müşteri bazlı güvenlik kuralları sıkılaştırılmalıdır.
