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


## v2.6 - Aktif Sol Menü

- Sol menü artık tıklanabilir hale getirildi.
- Seçilen menü aktif olarak vurgulanır.
- Randevular, müşteriler, personel, hizmetler, işlem notları, hatırlatmalar, takipler, sadakat, AI Asistan, raporlar ve ayarlar bölümleri ayrı içerik görünümüne geçer.
- AI Asistan çağrı kartı doğrudan AI Asistan bölümünü açar.


## v2.6.1 - Sidebar taşma düzeltmesi

- Sol menüde Ayarlar/AI Asistan/Raporlar bölümünde CTA kutusunun menü üzerine binmesi düzeltildi.
- Sidebar artık yüksekliği sabit, menü alanı kaydırılabilir, alt CTA kutusu menüden bağımsız çalışır.
- Dar ekranlarda mevcut kompakt sidebar davranışı korunur.


## v2.7 - Firestore tenant ve rol bazlı güvenlik

- Geniş geliştirme kuralı kaldırıldı.
- Süper admin, işletme kullanıcıları ve müşteri kullanıcıları ayrıştırıldı.
- İşletme kullanıcıları yalnızca kendi `tenantId` verilerine erişir.
- Müşteri paneli yalnızca kendi `customerId`, telefon/e-posta eşleşmesi ve kendi randevularını okuyabilir.
- Public randevu formu yalnızca gerekli alanlarla `bookingRequests` oluşturabilir.
- Public randevu sayfası yalnızca aktif ve public hizmetleri okuyabilir.
- Müşteri portal kayıt akışı güvenlik kurallarına uygun hâle getirildi.

> Not: Sağlık sektöründe iç notların müşteriye görünmemesi için ileride müşteri özetleri ayrı bir public summary koleksiyonuna taşınacaktır.
