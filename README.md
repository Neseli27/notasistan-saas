# Not Asistan SaaS MVP

Not Asistan; randevulu çalışan işletmeler için müşteri kartı, randevu, işlem notu, hatırlatma, takip ve AI öneri altyapısı olan başlangıç SaaS projesidir.

Bu paket ilk prototip içindir. Ekranlar demo veriyle çalışır; Firebase bağlantı dosyası ve güvenlik kuralları hazırdır. Gerçek veri yazma/okuma ve kullanıcı girişi sonraki geliştirme adımında bağlanacaktır.

## Teknolojiler

- Next.js App Router
- React
- TypeScript
- Firebase Web SDK hazırlığı
- Cloud Firestore güvenlik kuralları hazırlığı
- Vercel deploy uyumlu yapı
- GitHub repo yapısına uygun klasörleme

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda açın:

```bash
http://localhost:3000
```

## Firebase ayarları

1. Firebase Console üzerinden yeni proje oluşturun.
2. Web app ekleyin.
3. Firebase config bilgilerini alın.
4. `.env.example` dosyasını `.env.local` olarak kopyalayın.
5. Bilgileri `.env.local` içine girin.

Örnek:

```bash
cp .env.example .env.local
```

## Firestore koleksiyon mantığı

Başlangıç veri modeli şu koleksiyonları hedefler:

- tenants
- users
- customers
- appointments
- appointmentNotes
- followUps
- reminders
- messages
- loyalty
- aiLogs
- settings

Her iş verisinde `tenantId` bulunmalıdır. SaaS izolasyonunun temeli budur.

## Roller

Başlangıçta planlanan roller:

- super_admin
- owner
- manager
- staff

## İlk geliştirme hedefleri

1. Firebase Authentication bağlanacak.
2. Kullanıcı kaydından sonra tenant oluşturulacak.
3. Demo veriler Firestore seed fonksiyonuna taşınacak.
4. Randevu ekleme formu gerçek kayıt yapacak.
5. Müşteri ekleme formu gerçek kayıt yapacak.
6. AI mesaj üretici önce mock, sonra gerçek API ile bağlanacak.
7. Hatırlatmalar önce manuel/dahili, sonra SMS/WhatsApp API ile otomatikleşecek.

## Vercel deploy

GitHub reposunu Vercel’e bağlayın. Vercel proje ayarlarında `.env.local` içindeki değişkenleri Environment Variables bölümüne ekleyin.

## Not

Bu sürüm sağlık verisi işlemek için henüz yeterli güvenlik ve KVKK katmanına sahip değildir. Sağlık/Klinik paketi açılmadan önce açık rıza, audit log, rol bazlı erişim, veri maskeleme ve insan onaylı AI akışı eklenmelidir.
