# Not Asistan SaaS

Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası, randevu ve takip yönetim platformu.

## v1.1 - Randevu talebi karar merkezi

Bu sürümde müşteri tarafından gelen public randevu talepleri daha profesyonel şekilde yönetilir:

- Randevu Talepleri kartına filtreler eklendi: Açık, Randevu, Red, Tümü.
- Her talep için teyit metni kopyalama özelliği korundu.
- Randevuya çevirme akışı güçlendirildi.
- Talep reddetme özelliği eklendi.
- Reddedilen talepler için müşteri bilgilendirme metni kopyalanabilir.
- Talep durum rozetleri iyileştirildi: Yeni Talep, Görüldü, Randevuya Çevrildi, Reddedildi.
- Dashboard üst aksiyonlarındaki tekrar eden AI butonu temizlendi.
- `package.json` sürümü `1.1.0` yapıldı.

## Mevcut ana özellikler

- Firebase Authentication ile giriş/kayıt
- Firestore veritabanı bağlantısı
- İşletme oluşturma ve sektör seçimi
- Sektöre göre dashboard: güzellik, klinik, otomotiv, eğitim, danışmanlık
- Gerçek müşteri ekleme
- Gerçek randevu ekleme
- Randevu sonrası işlem notu, takip ve hatırlatma kaydı
- Public PWA müşteri randevu talep sayfası
- Public talepleri randevuya çevirme
- PWA manifest, service worker ve mobil ekleme bannerı

## Kurulum

```bash
npm install
npm run dev
```

Yerel adres:

```text
http://localhost:3000
```

## Ortam değişkenleri

`.env.local` dosyası GitHub'a gönderilmemelidir. `.env.example` şablon olarak tutulur.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Firebase servisleri

- Authentication > Email/Password aktif olmalı.
- Firestore Database oluşturulmuş olmalı.
- Firestore Rules güncel dosyadaki kurallarla yayınlanmalı.

## GitHub/Vercel

```bash
git status
git add .
git commit -m "Randevu talebi karar merkezi eklendi"
git push
```

Vercel, GitHub push işleminden sonra yeni sürümü otomatik deploy eder.


## v1.2 - Randevu Durum Yönetimi

Bu sürümde randevu tablosuna hızlı durum değiştirme özelliği eklendi.

- Randevu durumları Firestore üzerinde güncellenir.
- Desteklenen durumlar: Bekliyor, Onaylandı, Tamamlandı, Gelmedi, İptal.
- Durum değişimi sonrası dashboard bilgilendirme mesajı gösterir.
- Tablo aksiyon alanı önceki UI hizalama düzenini koruyacak şekilde iyileştirildi.



## v1.3 - Randevu Durum Geçmişi ve Bilgilendirme Metni

Bu sürümde randevu durum yönetimi daha profesyonel hale getirildi.

- Randevu durumu değiştirildiğinde `appointmentStatusLogs` koleksiyonuna geçmiş kaydı eklenir.
- Durum değişimine göre müşteriye gönderilecek hazır bilgilendirme metni üretilir.
- Oluşan metin panelde gösterilir ve tek tıkla panoya kopyalanabilir.
- Dashboard'a **Durum Geçmişi** kartı eklendi.
- Geçmiş kayıtlardaki mesajlar tekrar kopyalanabilir.

Not: Firestore kurallarında genel geliştirme kuralı giriş yapan kullanıcıya izin verdiği için bu sürümde ek rules değişikliği zorunlu değildir.

## v1.4 - Müşteri Paneli ve Müşteri Hesabı

Bu sürümde işletme müşterileri için ayrı bir müşteri paneli eklendi.

### Yeni müşteri paneli adresi

```text
/musteri/[isletme-slug]
```

Örnek:

```text
/musteri/gulizar-guzellik-merkezi
/musteri/servet-oto-bakim
```

### Eklenenler

- Müşteri kayıt / giriş ekranı
- Firebase Authentication ile müşteri hesabı
- Mevcut müşteri kaydı telefon/e-posta ile eşleştirme
- Müşterinin kendi randevularını görmesi
- Bekleyen randevu taleplerini görmesi
- Müşteriye açık işlem özetlerini görmesi
- Erteleme ve iptal talebi oluşturması
- İşletme panelinde müşteri erteleme/iptal talepleri kartı
- Public randevu sayfasından müşteri paneline yönlendirme
- PWA müşteri deneyimine uygun mobil arayüz

### Önemli

Bu sürümde Firestore kuralları hâlâ geliştirme aşaması kolaylığı için giriş yapmış kullanıcıya geniş izin verir. Canlı ve ücretli kullanıma geçmeden önce tenant ve müşteri bazlı güvenlik kuralları sıkılaştırılmalıdır.
