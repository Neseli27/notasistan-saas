# Not Asistan SaaS

Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası, randevu ve takip yönetim platformu.

## v1.1 - Randevu talebi karar merkezi

Bu sürümde müşteri tarafından gelen public randevu talepleri daha profesyonel şekilde yönetilir:

- Randevu Talepleri kartına filtreler eklendi: Açık, Randevu, Red, Tümü.
- Her talep için teyit metni kopyalama özelliği korundu.
- Randevuya çevirme akışı güçlendirildi.
- Talep reddetme özelliği eklendi.
- Reddedilen talepler için müşteri bilgilendirme metni kopyalanabilir.
- Talep durum rozetleri iyileştirildi: Yeni Talep, Görüldü, Randevuya Çevrildi, Reddedildi.
- Dashboard üst aksiyonlarındaki tekrar eden AI butonu temizlendi.
- `package.json` sürümü `1.1.0` yapıldı.

## Mevcut ana özellikler

- Firebase Authentication ile giriş/kayıt
- Firestore veritabanı bağlantısı
- İşletme oluşturma ve sektör seçimi
- Sektöre göre dashboard: güzellik, klinik, otomotiv, eğitim, danışmanlık
- Gerçek müşteri ekleme
- Gerçek randevu ekleme
- Randevu sonrası işlem notu, takip ve hatırlatma kaydı
- Public PWA müşteri randevu talep sayfası
- Public talepleri randevuya çevirme
- PWA manifest, service worker ve mobil ekleme bannerı

## Kurulum

```bash
npm install
npm run dev
```

Yerel adres:

```text
http://localhost:3000
```

## Ortam değişkenleri

`.env.local` dosyası GitHub'a gönderilmemelidir. `.env.example` şablon olarak tutulur.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Firebase servisleri

- Authentication > Email/Password aktif olmalı.
- Firestore Database oluşturulmuş olmalı.
- Firestore Rules güncel dosyadaki kurallarla yayınlanmalı.

## GitHub/Vercel

```bash
git status
git add .
git commit -m "Randevu talebi karar merkezi eklendi"
git push
```

Vercel, GitHub push işleminden sonra yeni sürümü otomatik deploy eder.
