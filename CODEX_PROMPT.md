# Not Asistan v1.9 Codex Notu

Bu sürümde müşteri panelinden gelen iptal talepleri gerçek randevu durumuna bağlandı.

## Beklenen davranış

1. Müşteri panelinden randevu için iptal talebi gönderilir.
2. İşletme panelinde Erteleme / İptal Talepleri kartında talep görünür.
3. İşletme **İptali Onayla** butonuna basar.
4. İlgili `appointments` belgesinde `status` değeri `İptal` olur.
5. `customerActionRequests` belgesi `Tamamlandı` olur.
6. `appointmentStatusLogs` koleksiyonuna iptal geçmişi yazılır.
7. Müşteriye gönderilecek bilgilendirme metni panelde gösterilir ve kopyalanabilir.

## Kontrol edilecek dosyalar

- `components/Dashboard.tsx`
- `components/CustomerActionRequestsCard.tsx`
- `lib/services/customer-portal-service.ts`
- `types/domain.ts`

## Sonraki önerilen adım

v2.0 kapsamında müşteri paneli mobil/PWA deneyimini güçlendirmek, ardından müşteri listesi ve müşteri detay sayfalarını geliştirmek.
