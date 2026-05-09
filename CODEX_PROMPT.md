# Not Asistan v0.5 Geliştirme Özeti

Bu proje Firebase + GitHub + Vercel üzerinde çalışan Next.js tabanlı çok sektörlü SaaS uygulamasıdır.

## Mevcut Durum

- Next.js App Router
- TypeScript
- Tailwind kullanılmadan özel CSS tasarım sistemi
- Firebase Authentication
- Cloud Firestore
- Vercel deploy uyumu
- Tenant mantığı
- Sektöre göre dashboard presetleri
- Gerçek müşteri ekleme
- Gerçek randevu ekleme

## v0.5 ile Eklenenler

- `components/AppointmentFormModal.tsx`
- `lib/services/appointment-service.ts`
- `appointments` koleksiyonuna Firestore kaydı
- Dashboard üzerinden “Yeni Randevu” modalı
- Randevu formunda müşteri seçimi
- Sektöre göre hizmet/işlem önerileri
- Otomotivde araç/plaka bilgisinin seçilen müşteriden otomatik randevuya taşınması
- Randevu listesinin gerçek Firestore verisinden okunması

## Sonraki Hedef

v0.6 için önerilen geliştirme: işlem notu / randevu sonrası özet ekleme ve takip tarihi oluşturma.
