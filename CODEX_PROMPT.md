# Not Asistan - Codex Görev Notu

Proje: Not Asistan SaaS
Teknoloji: Next.js App Router, TypeScript, Firebase Authentication, Cloud Firestore, Vercel.

## Güncel sürüm: v1.1

Bu sürümde müşteri public randevu talepleri için yönetim kartı güçlendirildi.

### Korunacak mimari ilkeler

- Her veride `tenantId` bulunmalı.
- Çok kiracılı SaaS mantığı bozulmamalı.
- Public müşteri randevu sayfası sadece gerekli public veriyi okumalı.
- Booking request create işlemi girişsiz yapılabilir; yönetim işlemleri giriş gerektirir.
- `.env.local` asla repoya eklenmemeli.

### Bu sürümde yapılanlar

- `BookingRequestsCard.tsx` filtreli karar merkezi hâline getirildi.
- Açık / Randevu / Red / Tümü filtreleri eklendi.
- Talep reddetme butonu ve red metni kopyalama eklendi.
- `rejectBookingRequest` servisi eklendi.
- Dashboard içinde reddetme işlem durumu yönetildi.
- BookingRequest status tipine `Reddedildi` eklendi.
- UI stilleri `globals.css` içinde v1.1 notuyla eklendi.

### Sonraki önerilen görev

v1.2 için talep kabul/red akışı müşteri mesaj geçmişine bağlanabilir:

- `messages` koleksiyonuna kopyalanan/oluşturulan mesaj taslaklarını kaydet.
- Randevuya çevrilen taleplerden otomatik reminder oluştur.
- Public randevu talebinde otomotiv için plaka/araç bilgisi opsiyonel alınsın.
- İşletme ayarlarından public form alanları özelleştirilsin.


## v1.2 geliştirme notu

Randevu tablosundaki durum alanı artık doğrudan değiştirilebilir. `updateAppointmentStatus` servisi Firestore'daki `appointments` dokümanını günceller ve `updatedAt` alanını yeniler. Bundan sonraki aşamada durum değişim geçmişi ve müşteri bilgilendirme mesajları ayrı bir log koleksiyonuna taşınabilir.
