# Not Asistan v2.0 Codex Notu

Bu sürümde müşteri panelinin mobil/PWA deneyimi güçlendirildi.

## Beklenen davranış

1. Müşteri paneli mobil ekranda uygulama hissi vermelidir.
2. Üstte işletme adı, güvenli giriş bilgisi ve müşteri uygulaması vurgusu görünmelidir.
3. Sıradaki randevu ayrı bir büyük kartta gösterilmelidir.
4. Yeni randevu talebi, randevularım, işlem özetlerim ve taleplerim için hızlı işlem kartları olmalıdır.
5. Mobilde altta sabit hızlı gezinme menüsü görünmelidir.
6. PWA bannerı alttaki menüyle çakışmamalıdır.
7. Mevcut randevu, erteleme, iptal ve işlem özeti akışları bozulmamalıdır.

## Kontrol edilecek dosyalar

- `components/customer/CustomerPanel.tsx`
- `app/globals.css`
- `components/PwaInstallBanner.tsx`
- `public/manifest.webmanifest`

## Sonraki önerilen adım

v2.1 kapsamında işletme tarafında müşteri listesi ve müşteri detay sayfası geliştirilmelidir. Bu sayede müşteri kartı, işlem geçmişi, randevu geçmişi ve sektör özel alanları tek yerde yönetilebilir.
