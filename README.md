# Not Asistan SaaS v0.9

Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası, takip ve müşteri tarafı randevu talep platformu.

## Bu sürümde neler var?

- Firebase Authentication
- Firestore bağlantısı
- Sektöre göre dashboard
- Gerçek müşteri ekleme
- Gerçek randevu ekleme
- İşlem notu, takip ve hatırlatma kayıtları
- PWA manifest, service worker ve telefona ekleme bannerı
- Müşteri tarafı randevu talep sayfası
- Genel randevu linki: `/randevu/[isletme-slug]`
- Admin panelinde gelen randevu talepleri kartı
- **Gelen randevu talebini tek tıkla gerçek randevuya çevirme**
- **Public talepten otomatik müşteri kaydı oluşturma veya aynı telefondaki mevcut müşteriyi kullanma**
- **WhatsApp/SMS için teyit mesajı kopyalama**

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

## Talebi randevuya çevirme

Admin panelindeki **Randevu Talepleri** kartında iki yeni işlem vardır:

1. **Teyit Mesajı**: Müşteri için WhatsApp/SMS'te kullanılabilecek kısa teyit metnini panoya kopyalar.
2. **Randevuya Çevir**: Talebi `appointments` koleksiyonuna gerçek randevu olarak kaydeder. Aynı telefon numarasına sahip müşteri varsa onu kullanır; yoksa otomatik yeni müşteri kaydı oluşturur. Talebin durumu `Randevuya Çevrildi` olur.

## Firestore Rules

Bu sürümde `publicTenants` herkese okunabilir, `bookingRequests` ise giriş yapmadan yalnızca yeni talep oluşturabilir. Yönetim verileri için giriş yapmış kullanıcı şartı korunur.

Firebase Console > Firestore Database > Rules bölümüne bu projedeki `firestore.rules` dosyasındaki kuralları yapıştırıp Publish etmeyi unutmayın.

## Vercel

Environment Variables Vercel panelinde de eklenmelidir. Değişikliklerden sonra GitHub'a push yapıldığında Vercel otomatik deploy eder.

## Sonraki önerilen sürüm

v1.0.1 için mantıklı adım: müşteri tarafında işletmeye özel daha profesyonel mobil randevu deneyimi, hizmet seçimine göre süre/fiyat bilgisi, işletme logosu ve tema ayarları.


## v1.0.1 Notları

- Randevu tablosunda sütun genişlikleri ve aksiyon alanı düzeltildi.
- Durum rozeti ve Not butonu aynı hizaya alındı.
- Uzun araç, plaka, servis ve açıklama metinleri tablo düzenini bozmayacak şekilde sınırlandırıldı.
- Randevu talebi kartları daha düzenli ve okunabilir hâle getirildi.
- Dar ekranlarda randevu listesi taşma yapmadan kullanılacak şekilde iyileştirildi.


## v1.0.1

- Otomotiv randevu tablosunda Durum/Not aksiyon alanı taşması düzeltildi.
- Uzun araç ve işlem metinleri kart düzenini bozmadan kısaltılacak şekilde ayarlandı.
- Dar ekranlarda randevu tablosu için güvenli yatay kaydırma eklendi.
