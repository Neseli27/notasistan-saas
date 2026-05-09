# Not Asistan SaaS

Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası, randevu ve takip platformu.

## v0.5 İçerik

- Firebase Authentication ile giriş/kayıt
- İlk işletme oluşturma
- Sektöre göre dashboard
- Sektöre göre tema altyapısı
- Gerçek müşteri ekleme ve Firestore kaydı
- Müşteri kartının gerçek Firestore verisiyle beslenmesi
- Gerçek randevu ekleme ve Firestore kaydı
- Dashboard randevu listesinin gerçek Firestore verisinden beslenmesi

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

## GitHub / Vercel

Değişiklikleri göndermek için:

```bash
git status
git add .
git commit -m "Gercek randevu ekleme sistemi eklendi"
git push
```

Vercel GitHub push sonrası otomatik deploy alır.
