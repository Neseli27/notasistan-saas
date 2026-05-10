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


## v2.1 - Müşteri Listesi ve Müşteri Detay Sayfası

Bu sürümde işletme paneline CRM mantığında çalışan müşteri listesi eklendi.

### Eklenenler

- Dashboard içinde geniş **Müşteri Listesi** kartı.
- Arama: ad, telefon, e-posta, araç/plaka veya sektör bilgisiyle arama.
- Segment filtresi: Tümü, Yeni, Düzenli, VIP, Riskli, Geri Çağır.
- Müşteri özet istatistikleri: toplam, randevulu, VIP, takip gereken.
- Her müşteri satırında sektör bilgisi, randevu sayısı ve işlem notu sayısı.
- Müşteri detay modalı:
  - iletişim bilgileri,
  - sektör bilgileri,
  - randevu geçmişi,
  - işlem özetleri,
  - sonraki adım önerisi.
- Otomotiv, klinik, güzellik, eğitim ve danışmanlık sektörlerinde aynı liste yapısı sektör diline göre uyum sağlar.

### Test

1. En az bir müşteri ekleyin.
2. Dashboard'daki **Müşteri Listesi** kartında kaydı görün.
3. Arama ve segment filtresini deneyin.
4. Bir müşteri satırına tıklayın.
5. Detay modalında randevu geçmişi ve işlem notlarının geldiğini kontrol edin.

## v2.2 - Randevu Düzenleme / Silme / Erteleme

Bu sürümde işletme panelindeki randevu yönetimi güçlendirildi.

### Eklenenler

- Randevu tablosuna **Düzenle** ve **Sil** aksiyonları eklendi.
- Randevu düzenleme modalı eklendi.
- Randevunun tarih, saat, işlem/hizmet, alt açıklama, durum ve ön not alanları düzenlenebilir oldu.
- Randevu silme işlemi Firestore'daki `appointments` kaydını kaldırır.
- Aksiyon butonları için tablo sağ sütunu yeniden düzenlendi.
- Otomotiv gibi 5 sütunlu tabloda durum, not, düzenle ve sil butonlarının taşmaması için yeni grid genişlikleri eklendi.
- `appointment-service.ts` içine `updateAppointment`, `deleteAppointment` ve `rescheduleAppointment` yardımcıları eklendi.
- `package.json` sürümü `2.2.0` oldu.

### Test önerisi

1. İşletme paneline giriş yapın.
2. Bir randevu oluşturun.
3. Randevu satırındaki kalem ikonuna basarak düzenleme modalını açın.
4. Tarih, saat veya hizmet bilgisini değiştirip kaydedin.
5. Firestore'daki `appointments` kaydının güncellendiğini kontrol edin.
6. Çöp kutusu ikonuyla bir test randevusunu silin.
7. Randevu tablosunda aksiyon butonlarının kaymadığını kontrol edin.

### Yayına gönderme

```bash
git status
git add .
git commit -m "Randevu duzenleme silme erteleme eklendi"
git push
```
