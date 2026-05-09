# Not Asistan SaaS

Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası, randevu ve takip platformu.

## v0.6 İçerik

- Firebase Authentication ile giriş/kayıt
- İlk işletme oluşturma
- Sektöre göre dashboard
- Sektöre göre tema altyapısı
- Gerçek müşteri ekleme ve Firestore kaydı
- Gerçek randevu ekleme ve Firestore kaydı
- Dashboard randevu listesinin gerçek Firestore verisinden beslenmesi
- Randevu üzerinden işlem notu ekleme
- İşlem notunu müşteriye gönderilecek özete dönüştürme
- Sonraki yapılacak iş ve takip tarihi oluşturma
- Takip ve hatırlatma kayıtlarını Firestore’a yazma
- Dashboard’daki Takipler / Hatırlatmalar / AI Önerileri kartlarını gerçek işlem notlarıyla güncelleme

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
- `appointmentNotes`
- `followUps`
- `reminders`
- `services`

## Test Akışı

1. Kayıt olun veya giriş yapın.
2. İşletme oluşturun.
3. Müşteri ekleyin.
4. Yeni randevu oluşturun.
5. Randevu satırındaki **Not** butonuna basın.
6. İşlem notunu yazın.
7. **Notu Düzenle ve Müşteri Özeti Hazırla** butonunu deneyin.
8. Takip tarihi seçip kaydedin.
9. Firestore’da `appointmentNotes`, `followUps`, `reminders` koleksiyonlarının oluştuğunu kontrol edin.

## GitHub / Vercel

Değişiklikleri göndermek için:

```bash
git status
git add .
git commit -m "Islem notu ve takip sistemi eklendi"
git push
```

Vercel GitHub push sonrası otomatik deploy alır.
