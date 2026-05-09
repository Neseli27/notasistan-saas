# Not Asistan SaaS

Randevu, müşteri notu, işlem hafızası, takip, müşteri paneli ve SaaS yönetimi için Firebase + Vercel + GitHub tabanlı başlangıç uygulaması.

## v1.9 Yenilikleri

Bu sürümde yol haritasındaki ikinci kritik iş tamamlandı:

- Müşteri panelinden gelen **iptal talebi** artık gerçek randevu durumuna bağlandı.
- İşletme panelinde iptal talebi için **İptali Onayla** butonu eklendi.
- İptal onaylanınca ilgili `appointments` kaydının `status` alanı **İptal** olur.
- `customerActionRequests` kaydı **Tamamlandı** durumuna alınır.
- `decisionMessage` alanına müşteriye gönderilecek iptal onay metni yazılır.
- `appointmentStatusLogs` koleksiyonuna **İptal Talebi Onayı** geçmiş kaydı eklenir.
- Hazırlanan mesaj panelde görüntülenip kopyalanabilir.
- `package.json` sürümü `1.9.0` oldu.

## Önceki ana özellikler

- Sektöre göre dashboard
- Firebase Authentication
- Firestore müşteri ve randevu kayıtları
- Public randevu talep sayfası
- Müşteri paneli
- Erteleme talebini gerçek randevu güncellemesine bağlama
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
git commit -m "Iptal talebi randevu durumuna baglandi"
git push
```

## Not

Firestore güvenlik kuralları geliştirme sürecinde geniş tutulmuştur. Beta/gerçek kullanım öncesinde tenant, kullanıcı rolü ve müşteri bazlı güvenlik kuralları sıkılaştırılmalıdır.
