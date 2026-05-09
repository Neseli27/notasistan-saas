# Not Asistan SaaS

Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası, randevu ve takip platformu.

## v0.7 İçerik

- Firebase Authentication ile giriş/kayıt
- İlk işletme oluşturma
- Sektöre göre dashboard
- Sektöre göre tema altyapısı
- Gerçek müşteri ekleme ve Firestore kaydı
- Gerçek randevu ekleme ve Firestore kaydı
- Dashboard randevu listesinin gerçek Firestore verisinden beslenmesi
- Randevu üzerinden işlem notu ekleme
- İşlem notunu müşteriye gönderilecek özete dönüştürme
- Sonraki yapılacak iş ve takip tarihi oluşturma
- Takip ve hatırlatma kayıtlarını Firestore’a yazma
- Dashboard’daki Takipler / Hatırlatmalar / AI Önerileri kartlarını gerçek işlem notlarıyla güncelleme
- PWA manifest dosyası
- Service worker kaydı
- Android/Chrome için telefona yükleme tetikleyicisi
- iPhone/iPad için Ana Ekrana Ekle yönlendirmesi
- Uygulama ikonları ve tema rengi
- Mobilde görünen “Not Asistan’ı telefona ekleyin” bannerı

## PWA Notları

Bu sürümde PWA desteği uygulama geneline eklendi. Müşteri tarafı ayrı portal hâline getirildiğinde aynı PWA altyapısı `/randevu/[isletme]` veya benzeri müşteri linkleri için de kullanılabilir.

PWA dosyaları:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-512.png`
- `public/icons/apple-touch-icon.png`
- `components/PwaInstallBanner.tsx`

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcı:

```text
http://localhost:3000
```

## Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın ve Firebase Web App config bilgilerini girin.

```bash
copy .env.example .env.local
```

## Firestore koleksiyonları

Uygulama çalıştıkça şu koleksiyonlar oluşur:

- `tenants`
- `users`
- `customers`
- `appointments`
- `appointmentNotes`
- `followUps`
- `reminders`
- `services`

## Test Akışı

1. Kayıt olun veya giriş yapın.
2. İşletme oluşturun.
3. Müşteri ekleyin.
4. Yeni randevu oluşturun.
5. Randevu satırındaki **Not** butonuna basın.
6. İşlem notunu yazın.
7. **Notu Düzenle ve Müşteri Özeti Hazırla** butonunu deneyin.
8. Takip tarihi seçip kaydedin.
9. Firestore’da `appointmentNotes`, `followUps`, `reminders` koleksiyonlarının oluştuğunu kontrol edin.
10. Mobil Chrome veya Safari ile canlı Vercel adresini açıp PWA bannerını test edin.

## GitHub / Vercel

Değişiklikleri göndermek için:

```bash
git status
git add .
git commit -m "PWA destegi ve telefona ekleme banneri eklendi"
git push
```

Vercel GitHub push sonrası otomatik deploy alır.
