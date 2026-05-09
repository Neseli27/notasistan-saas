# Not Asistan SaaS

Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası ve takip platformu.

## v0.4 içeriği

Bu sürümde aşağıdaki temel özellikler eklendi:

- Firebase Authentication ile giriş/kayıt akışı
- İlk girişte işletme oluşturma
- Sektör seçimine göre dashboard uyarlaması
- Sektöre göre otomatik tema renkleri altyapısı
- `Müşteri Ekle / Hasta Ekle / Öğrenci Ekle` butonunun çalışması
- Sektöre göre değişen müşteri kayıt formu
- Firestore `customers` koleksiyonuna gerçek müşteri kaydı
- Dashboard müşteri kartı ve müşteri sayısının Firestore kayıtlarından okunması

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

`.env.example` dosyasını `.env.local` olarak kopyalayın ve Firebase Web App config bilgilerinizi girin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

`.env.local` dosyası GitHub’a gönderilmemelidir.

## Firebase servisleri

Firebase Console içinde şunlar açık olmalı:

1. Authentication > Sign-in method > Email/Password
2. Firestore Database
3. Firestore Rules: geliştirme aşamasında sadece giriş yapan kullanıcıların erişmesine izin veren kural

Önerilen geçici geliştirme kuralı:

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

## GitHub ve Vercel akışı

Yerelde test ettikten sonra:

```bash
git status
git add .
git commit -m "Gercek musteri ekleme sistemi eklendi"
git push
```

Vercel GitHub push sonrası otomatik deploy başlatır.

## Sonraki sürüm önerisi

v0.5 için önerilen modül:

- Gerçek randevu ekleme
- Randevuları Firestore’a kaydetme
- Randevu listesini gerçek veriden okuma
- Randevu durumları: Bekliyor / Onaylandı / Tamamlandı / Gelmedi
