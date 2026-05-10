# Not Asistan SaaS

Randevulu çalışan işletmeler için müşteri, randevu, işlem notu, takip, hatırlatma ve müşteri paneli yönetimi.

## v2.5 - AI Asistan mesaj üretimi

Bu sürümde mesaj üretimi ve işlem özeti hazırlama alanları AI destekli hâle getirildi.

### Eklenenler

- `/api/ai/message` API route eklendi.
- Mesaj Merkezi içinde **AI ile Yenile** butonu eklendi.
- Hatırlatma ve takip mesajları sektör, müşteri adı, işlem ve kanal bilgisine göre yeniden yazılabilir.
- İşlem notu penceresinde **AI ile Notu Düzenle ve Müşteri Özeti Hazırla** akışı eklendi.
- `OPENAI_API_KEY` varsa canlı modelle metin üretilir.
- `OPENAI_API_KEY` yoksa uygulama kesintiye uğramaz; akıllı yerel şablonla devam eder.
- Sağlık/klinik sektöründe tanı, tedavi veya ilaç önerisi üretmemesi için güvenli prompt kuralları eklendi.

## Kurulum

```bash
npm install
npm run dev
```

## Firebase Environment Variables

`.env.local` içinde:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Opsiyonel AI Environment Variables

Gerçek AI üretimi için Vercel > Project Settings > Environment Variables bölümüne ekleyin:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

Bu değerleri GitHub'a göndermeyin. `.env.local` yerelde kalmalıdır.

## Yayın

GitHub'a push sonrası Vercel otomatik deploy eder.
