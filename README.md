# Not Asistan SaaS v0.8

Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası, takip ve randevu talep platformu.

## Bu sürümde neler var?

- Firebase Authentication
- Firestore bağlantısı
- Sektöre göre dashboard
- Gerçek müşteri ekleme
- Gerçek randevu ekleme
- İşlem notu, takip ve hatırlatma kayıtları
- PWA manifest, service worker ve telefona ekleme bannerı
- **Müşteri tarafı randevu talep sayfası**
- **Genel randevu linki:** `/randevu/[isletme-slug]`
- **Admin panelinde gelen randevu talepleri kartı**

## Kurulum

```bash
npm install
npm run dev
```

Yerel adres:

```text
http://localhost:3000
```

## Firebase ayarları

`.env.local` içinde şu değişkenler bulunmalıdır:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## Public randevu sayfası

İşletme sahibi panele giriş yaptığında sistem otomatik olarak `publicTenants` kaydını oluşturur. Dashboard üzerinde müşteri randevu linki görünür:

```text
/randevu/isletme-adi
```

Müşteri bu sayfadan ad soyad, telefon, hizmet, tarih, saat ve ön not bilgilerini girerek randevu talebi oluşturur. Talep `bookingRequests` koleksiyonuna kaydedilir ve admin panelindeki **Randevu Talepleri** kartında görünür.

## Firestore Rules

Bu sürümde `publicTenants` herkese okunabilir, `bookingRequests` ise giriş yapmadan yalnızca yeni talep oluşturabilir. Yönetim verileri için giriş yapmış kullanıcı şartı korunur.

Firebase Console > Firestore Database > Rules bölümüne bu projedeki `firestore.rules` dosyasındaki kuralları yapıştırıp Publish etmeyi unutmayın.

## Vercel

Environment Variables Vercel panelinde de eklenmelidir. Değişikliklerden sonra GitHub'a push yapıldığında Vercel otomatik deploy eder.

## Sonraki önerilen sürüm

v0.9 için mantıklı adım: gelen randevu talebini tek tıkla gerçek randevuya dönüştürme, talep durumunu güncelleme ve müşteriye WhatsApp/SMS metni üretme.
