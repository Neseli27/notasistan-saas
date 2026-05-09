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


## v1.3 Geliştirme Notu

Randevu durumu değiştiğinde aşağıdaki akış korunmalıdır:

1. `appointments/{id}` dokümanındaki `status` alanı güncellenir.
2. `appointmentStatusLogs` koleksiyonuna durum geçmişi kaydı eklenir.
3. Sektöre ve duruma uygun müşteri bilgilendirme metni oluşturulur.
4. Bu metin dashboard üzerinde kopyalanabilir şekilde gösterilir.

Bu sürümde eklenen önemli dosyalar:

- `components/StatusMessageBanner.tsx`
- `components/StatusHistoryCard.tsx`
- `lib/services/appointment-service.ts`
- `types/domain.ts`

## v1.4 geliştirme notu

Müşteri paneli eklendi. `/musteri/[slug]` rotası işletmeye bağlı müşteri giriş/kayıt ekranı ve müşteri paneli sunar. Müşteri hesabı Firebase Authentication ile açılır, `users` koleksiyonunda `role: "customer"` profili oluşturulur ve `customers` kaydıyla `customerId` üzerinden eşleşir.

Sonraki geliştirme hedefi: müşteri erteleme/iptal taleplerini işletme panelinde kabul/ret yönetimine bağlamak ve tenant bazlı Firestore rules kurallarını sıkılaştırmak.


## v1.5 - Erteleme / İptal Talebi Karar Merkezi

- Müşteri panelinden gelen erteleme ve iptal talepleri işletme panelinde yönetilebilir.
- İşletme talebi Tamamlandı veya Reddedildi olarak işaretleyebilir.
- Her talep için müşteriye gönderilecek olumlu/red dönüş metni hazırlanır ve panoya kopyalanabilir.
- Talep kartları mobilde ve dar ekranda daha düzenli görünür.
- Firestore `customerActionRequests` kayıtlarında `status`, `handledBy`, `updatedAt` alanları güncellenir.


## v1.6 Süper Admin Paneli Görevi

Süper admin paneli eklendi. `role === "super_admin"` olan kullanıcılar normal işletme paneli yerine `SuperAdminPanel` bileşenine yönlendirilir. Panel tüm tenant, user, customer, appointment ve request koleksiyonlarını okur; SaaS sahibine merkezi izleme sunar. Sonraki adımda tenant bazlı Firestore Rules sıkılaştırılmalı ve işletme paket/abonelik yönetimi eklenmelidir.


## v1.7 Notu

Süper Admin paneline paket ve abonelik yönetimi eklendi. `components/super-admin/SuperAdminPanel.tsx` içinde Paketler sekmesi, plan özet kartları ve işletme bazlı plan/durum seçicileri bulunur. `lib/services/super-admin-service.ts` içindeki `updateTenantPlan` fonksiyonu tenants belgesini günceller.
