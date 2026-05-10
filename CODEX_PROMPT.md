# Not Asistan v2.2 Codex Notu

Bu sürümde randevu yönetimi güçlendirildi.

## Beklenen davranış

1. `AppointmentTable` içinde her randevu satırında durum seçimi, Not, Düzenle ve Sil aksiyonları görünmelidir.
2. Düzenle aksiyonu `AppointmentEditModal` bileşenini açmalıdır.
3. Düzenleme modalında tarih, saat, hizmet/işlem, alt açıklama, durum ve ön not alanları düzenlenebilmelidir.
4. Kaydetme işlemi `updateAppointment` servisini çağırarak Firestore `appointments` belgesini güncellemelidir.
5. Silme aksiyonu onay penceresi göstermeli ve onaydan sonra `deleteAppointment` servisiyle ilgili randevuyu silmelidir.
6. Otomotiv panelinde tablo sağ aksiyon alanı taşmamalıdır.
7. Mevcut müşteri, müşteri paneli, randevu talebi, erteleme/iptal talebi ve işlem notu akışları bozulmamalıdır.

## Kontrol edilecek dosyalar

- `components/AppointmentTable.tsx`
- `components/AppointmentEditModal.tsx`
- `components/Dashboard.tsx`
- `lib/services/appointment-service.ts`
- `types/domain.ts`
- `app/globals.css`

## Sonraki önerilen adım

v2.3 kapsamında personel ve hizmet/işlem tanımlama sistemi eklenmelidir. Randevu oluşturma ve düzenleme formları daha sonra bu gerçek hizmet/personel kayıtlarından beslenmelidir.
