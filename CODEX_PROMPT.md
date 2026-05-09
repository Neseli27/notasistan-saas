# Not Asistan v1.8 - Codex Görev Notu

Bu proje Next.js + Firebase tabanlı çok kiracılı SaaS uygulamasıdır.

## Mevcut durum

- Firebase Auth ile owner/customer/super_admin rolleri vardır.
- İşletme paneli, müşteri paneli ve süper admin paneli vardır.
- Public randevu talep sayfası vardır.
- Müşteri panelinden erteleme/iptal talebi oluşturulabilir.
- Süper admin tarafında paket yönetimi vardır.

## v1.8’de yapılan iş

Erteleme talepleri gerçek randevu güncellemesine bağlandı.

### Değişen ana dosyalar

- `components/CustomerActionRequestsCard.tsx`
- `components/Dashboard.tsx`
- `lib/services/customer-portal-service.ts`
- `types/domain.ts`
- `app/globals.css`
- `package.json`

### Yeni davranış

İşletme panelindeki Erteleme / İptal Talepleri kartında:

- Erteleme talebi açıksa yeni tarih ve saat alanları görünür.
- `Ertele ve Onayla` butonu randevu kaydını Firestore’da günceller.
- İlgili `customerActionRequests` kaydı `Tamamlandı` olur.
- `appointmentStatusLogs` kaydı oluşur.
- Müşteri için mesaj metni üretilir.

### Sonraki önerilen görev

v1.9: İptal talebini gerçek randevu durumuna bağla.

Beklenen iş:

- İptal talebi onaylanınca ilgili appointment `status: "İptal"` olmalı.
- `appointmentStatusLogs` kaydı oluşmalı.
- Müşteriye gönderilecek iptal onay metni hazırlanmalı.
- Müşteri panelinde iptal sonucu görünmeli.
