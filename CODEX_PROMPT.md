# Not Asistan v0.4 - Codex Görev Notu

Bu proje Next.js + TypeScript + Firebase + Vercel tabanlı çok sektörlü SaaS başlangıç uygulamasıdır.

## Mevcut durum

- Firebase Auth çalışıyor.
- Kullanıcı kayıt/giriş akışı var.
- İlk girişte işletme oluşturuluyor.
- İşletmenin sektörü Firestore `users` profilinde tutuluyor.
- Dashboard sektöre göre otomotiv, güzellik, klinik, eğitim veya danışmanlık verileriyle uyarlanıyor.
- v0.4 ile müşteri ekleme modali eklendi.
- Müşteri kayıtları Firestore `customers` koleksiyonuna yazılıyor.
- Dashboard müşteri kartı ve müşteri sayısı Firestore’dan okunuyor.
- Tema renkleri `theme-${sector}` class yapısıyla sektöre göre otomatik değişmeye hazırlandı.

## Dikkat edilecekler

- `.env.local` GitHub’a gönderilmemeli.
- Çok kiracılı yapı için tüm iş verilerinde `tenantId` korunmalı.
- Firestore sorgularında mevcut kullanıcının `tenantId` değeri temel alınmalı.
- Sağlık/klinik tarafında AI çıktıları ileride insan onayından geçmeli.

## Sonraki hedef

v0.5 geliştirmesi:

1. Yeni Randevu butonunu çalıştır.
2. Sektöre göre randevu formu oluştur.
3. Firestore `appointments` koleksiyonuna kayıt yaz.
4. Dashboard randevu listesini Firestore’dan okusun.
5. Randevu durumu değiştirilebilsin.
6. Otomotivde müşteri + araç/plaka alanları desteklensin.
