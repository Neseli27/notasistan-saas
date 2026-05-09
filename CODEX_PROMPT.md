# Codex Görevi - Not Asistan v0.9

Bu proje Next.js, TypeScript, Firebase Authentication, Firestore ve Vercel üzerinde çalışan çok sektörlü bir SaaS uygulamasıdır.

## Ürün amacı

Not Asistan; randevulu çalışan işletmeler için müşteri notu, randevu, işlem özeti, takip, hatırlatma ve müşteri tarafı randevu talep yönetimi sağlar.

## Mevcut özellikler

- Firebase Authentication ile giriş/kayıt
- Tenant/işletme kurulumu
- Sektöre göre dashboard ve demo veri dili
- Gerçek müşteri ekleme
- Gerçek randevu ekleme
- İşlem notu, takip ve hatırlatma kayıtları
- PWA manifest ve telefona ekleme bannerı
- Public randevu talep sayfası: `/randevu/[slug]`
- Public randevu taleplerinin admin panelde listelenmesi
- Gelen talebi tek tıkla gerçek randevuya dönüştürme
- Teyit mesajı kopyalama

## Dikkat edilecek mimari ilkeler

- Her iş verisinde `tenantId` bulunmalıdır.
- Public sayfada yalnızca güvenli işletme profili (`publicTenants`) okunmalıdır.
- Public kullanıcı sadece `bookingRequests` içine yeni talep oluşturabilmelidir.
- Yönetim panelindeki okuma/yazma işlemleri giriş yapan kullanıcıyla sınırlandırılmalıdır.
- Sektöre göre alanlar `lib/sector-presets.ts` ve ilgili form bileşenleriyle yönetilmelidir.
- Firestore erişimleri `lib/services/*` dosyaları üzerinden yapılmalıdır.

## Sonraki geliştirilecek özellikler

- İşletme ayarlarından renk/tema seçimi
- İşletme logosu ve kapak görseli
- Public randevu sayfasında hizmet listesi/fiyat/süre gösterimi
- Randevu talebi onaylandıktan sonra WhatsApp/SMS gönderim entegrasyonu
- Randevu durumlarının ayrı panelden yönetilmesi
- Yetki/rol sisteminin tenantId bazlı sıkılaştırılması


## v1.0 Notları

- Randevu tablosunda sütun genişlikleri ve aksiyon alanı düzeltildi.
- Durum rozeti ve Not butonu aynı hizaya alındı.
- Uzun araç, plaka, servis ve açıklama metinleri tablo düzenini bozmayacak şekilde sınırlandırıldı.
- Randevu talebi kartları daha düzenli ve okunabilir hâle getirildi.
- Dar ekranlarda randevu listesi taşma yapmadan kullanılacak şekilde iyileştirildi.
