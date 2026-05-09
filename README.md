# Not Asistan SaaS

Randevu, müşteri notu, işlem hafızası, takip, müşteri paneli ve SaaS yönetimi için Firebase + Vercel + GitHub tabanlı başlangıç uygulaması.

## v2.0 Yenilikleri

Bu sürümde müşteri tarafı mobil/PWA deneyimi güçlendirildi:

- Müşteri paneline mobil odaklı üst özet alanı eklendi.
- Sıradaki randevu için büyük ve okunabilir kart oluşturuldu.
- Yeni randevu talebi, randevularım, işlem özetlerim ve taleplerim için hızlı işlem kartları eklendi.
- Mobil altta sabit hızlı gezinme menüsü eklendi.
- Müşteri paneli küçük ekranlarda daha uygulama hissi verecek şekilde düzenlendi.
- Müşteri tarafındaki PWA bannerı alttaki gezinme menüsüyle çakışmayacak şekilde ayarlandı.
- Son paylaşılan işlem özeti ayrı bir kart olarak gösterildi.
- Açık erteleme/iptal talepleri üst istatistikte ayrıca gösterilmeye başladı.
- `package.json` sürümü `2.0.0` oldu.

## Önceki ana özellikler

- Sektöre göre dashboard
- Firebase Authentication
- Firestore müşteri ve randevu kayıtları
- Public randevu talep sayfası
- Müşteri paneli
- Erteleme ve iptal taleplerini gerçek randevu yönetimine bağlama
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

## Test önerisi

1. Müşteri paneli linkini mobil tarayıcıda veya Chrome geliştirici araçlarında mobil görünümde açın.
2. Sıradaki randevu kartını kontrol edin.
3. Alttaki hızlı gezinme menüsünün göründüğünü kontrol edin.
4. PWA bannerının menünün üstünde kaldığını test edin.
5. Yeni randevu talebi, erteleme ve iptal akışlarının bozulmadığını kontrol edin.

## Yayına gönderme

```bash
git status
git add .
git commit -m "Musteri PWA mobil deneyimi guclendirildi"
git push
```

## Not

Firestore güvenlik kuralları geliştirme sürecinde geniş tutulmuştur. Beta/gerçek kullanım öncesinde tenant, kullanıcı rolü ve müşteri bazlı güvenlik kuralları sıkılaştırılmalıdır.
