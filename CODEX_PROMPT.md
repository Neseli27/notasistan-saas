# Codex Görev Özeti — Not Asistan v0.7

Bu proje Next.js + Firebase + Vercel üzerinde çalışan çok sektörlü SaaS başlangıcıdır.

## Mevcut Modüller

- Firebase Authentication
- Firestore kullanıcı/işletme kayıtları
- Sektöre göre dashboard
- Gerçek müşteri ekleme
- Gerçek randevu ekleme
- İşlem notu, takip ve hatırlatma kaydı
- Firestore listener yapısı
- Sektör bazlı tema altyapısı
- PWA manifest, ikonlar ve service worker
- Mobil telefona ekleme bannerı

## v0.7 ile Eklenenler

1. `public/manifest.webmanifest` eklendi.
2. `public/sw.js` eklendi.
3. `public/icons/` altında PWA ikonları eklendi.
4. `components/PwaInstallBanner.tsx` eklendi.
5. `app/layout.tsx` içine manifest, ikon, viewport ve banner entegrasyonu eklendi.
6. `app/globals.css` içine PWA banner stilleri eklendi.

## Sonraki Mantıklı Geliştirme

Müşteri tarafı ayrı bir PWA deneyimi olarak tasarlanmalı:

- `/randevu/[tenantSlug]` müşteri randevu alma sayfası
- İşletmeye özel tema ve logo
- Müşterinin randevu alması / erteleme talebi
- Telefona ekleme bannerı sadece müşteri portalında daha belirgin gösterilmeli
- Müşteri tarafında login zorunlu olmadan doğrulama kodu veya geçici randevu akışı düşünülmeli

## Dikkat

- `.env.local` GitHub’a yüklenmemeli.
- PWA install prompt Android/Chrome’da native çalışır.
- iOS Safari `beforeinstallprompt` desteklemediği için banner kullanıcıya “Paylaş > Ana Ekrana Ekle” yönergesi gösterir.
- Service worker geliştirme sırasında eski cache tutabilir; gerekirse tarayıcı Application > Service Workers bölümünden unregister yapılabilir.
