# Not Asistan v0.8 Codex Görev Özeti

Bu proje Next.js + Firebase + Vercel tabanlı bir SaaS MVP'dir.

## Mevcut durum

- Firebase Auth ile giriş/kayıt var.
- İşletme oluşturma ve sektör seçimi var.
- Dashboard sektöre göre tema ve içerik değiştiriyor.
- Müşteri, randevu, işlem notu, takip ve hatırlatma kayıtları Firestore'a yazılıyor.
- PWA desteği ve telefona ekleme bannerı var.
- `/randevu/[slug]` müşteri tarafı public randevu talep sayfası eklendi.
- Public form `bookingRequests` koleksiyonuna kayıt oluşturuyor.
- Admin dashboard `bookingRequests` kayıtlarını gösteriyor.

## Dikkat

- `.env.local` GitHub'a gönderilmemelidir.
- Firestore rules dosyası Firebase Console'da publish edilmelidir.
- `bookingRequests` public create iznine sahiptir; sonraki sürümde rate limit / captcha / telefon doğrulama eklenebilir.

## Sonraki görev

Gelen randevu talebini onaylama akışı geliştir:

1. BookingRequestsCard içindeki her talebe `Onayla`, `Görüldü`, `İptal` butonları ekle.
2. `Onayla` tıklanınca talebi `appointments` koleksiyonuna gerçek randevu olarak yaz.
3. Talep durumunu `Randevuya Çevrildi` yap.
4. Talep içindeki müşteri daha önce yoksa `customers` koleksiyonuna müşteri kaydı aç.
5. Müşteriye gönderilecek WhatsApp/SMS teyit metnini oluştur ve kopyalama butonu ekle.
