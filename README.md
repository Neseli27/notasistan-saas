# Not Asistan SaaS Starter

Not Asistan; randevulu çalışan işletmeler için randevu, müşteri notu, işlem hafızası, hatırlatma ve takip yönetimi sunan SaaS başlangıç projesidir.

## v0.2 ile gelenler

- Firebase Authentication bağlantısı
- Giriş / kayıt ekranı
- İlk işletme oluşturma ekranı
- Firestore `users`, `tenants`, `services`, `customers` başlangıç kayıtları
- Dashboard giriş koruması
- Kullanıcı adı ve işletme adına göre kişiselleştirilmiş panel başlığı
- Çıkış yapma butonu

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcı:

```text
http://localhost:3000
```

## Environment Variables

`.env.example` dosyasını `.env.local` olarak kopyalayın ve Firebase Web App config bilgilerinizi girin.

```bash
copy .env.example .env.local
```

Gerekli değişkenler:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Firebase ayarları

1. Authentication > Sign-in method > Email/Password aktif olmalı.
2. Firestore Database oluşturulmuş olmalı.
3. Geliştirme aşaması için geçici Firestore rule:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    match /{document=**} {
      allow read, write: if isSignedIn();
    }
  }
}
```

## GitHub / Vercel

Projeyi GitHub'a gönderin. Vercel'de aynı Firebase env değerlerini Project Settings > Environment Variables bölümüne ekleyin ve Redeploy yapın.

## Notlar

Bu sürüm hâlâ MVP başlangıç sürümüdür. Dashboard kartları büyük ölçüde demo verilerle görünür; ancak kullanıcı kaydı, işletme oluşturma ve başlangıç koleksiyon kayıtları Firestore'a yazılır. Sonraki sürümde müşteri ekleme, randevu ekleme ve gerçek dashboard verileri bağlanacaktır.

## v0.3 - Sektöre göre dashboard düzeltmesi

Bu sürümde onboarding sırasında seçilen sektör dashboard'a yansıtılır.

- Güzellik seçilirse güzellik salonu verileri görünür.
- Klinik seçilirse hasta/klinik dili görünür.
- Otomotiv seçilirse araç, plaka, bakım ve servis dili görünür.
- Eğitim seçilirse öğrenci/veli/görüşme dili görünür.
- Danışmanlık seçilirse danışan/görüşme/takip dili görünür.

Ana dosya: `lib/sector-presets.ts`
