# Codex için görev metni

Bu projeyi geliştirmeye devam et.

Proje adı: Not Asistan
Domain: notasistan.com
Amaç: Randevulu çalışan işletmeler için yapay zekâ destekli müşteri notu, işlem hafızası, hatırlatma, takip ve sadakat SaaS platformu.

Mevcut durum:
- Next.js App Router, React, TypeScript yapısı var.
- Dashboard demo verilerle çalışıyor.
- Firebase bağlantı dosyası hazır: lib/firebase.ts
- Firestore security rules başlangıç taslağı hazır.
- Tasarım dili lacivert, beyaz, turkuaz ve pastel vurgulu modern SaaS dashboard.

Lütfen sırayla şu geliştirmeleri yap:

1. Firebase Authentication ile e-posta/şifre login-register ekranı ekle.
2. İlk kayıt olan kullanıcı için tenant oluşturma akışı hazırla.
3. Firestore koleksiyonlarını şu yapıya göre düzenle:
   - tenants
   - users
   - customers
   - appointments
   - appointmentNotes
   - followUps
   - reminders
   - messages
   - aiLogs
4. Her dokümanda tenantId alanı zorunlu olsun.
5. Kullanıcı sadece kendi tenantId verisini görebilsin.
6. Dashboard demo verileri yerine Firestore verilerini okuyacak servis katmanı oluştur.
7. Müşteri ekleme formu oluştur.
8. Randevu ekleme formu oluştur.
9. Randevu tamamlandıktan sonra işlem notu ekleme ekranı oluştur.
10. İşlem notundan sonraki takip tarihi oluşturma akışı ekle.
11. AI mesaj yazma modülünü şimdilik mock fonksiyonla çalıştır.
12. Kodları temiz, modüler, anlaşılır ve genişletilebilir tut.

Önemli:
- Gerçek SMS/WhatsApp gönderimi şimdilik yapılmayacak.
- Sağlık verisi için henüz otomatik tıbbi öneri üretme yapılmayacak.
- AI çıktıları sadece taslak olarak gösterilecek.
