# Not Asistan v0.3 - Codex Görev Notu

Bu sürümde onboarding sırasında seçilen sektörün dashboard'a doğru yansıması sağlandı.

## Sorun
Kullanıcı işletme kurulumunda otomotiv sektörünü seçse bile dashboard güzellik salonu demo verileriyle açılıyordu.

## Çözüm
- `lib/sector-presets.ts` eklendi.
- Dashboard artık `profile.sector` değerine göre sektör preset'i seçiyor.
- Sidebar, Header, istatistik kartları, randevu tablosu, AI önerileri, müşteri kartı, hatırlatmalar ve takipler sektöre göre değişiyor.
- Otomotiv sektöründe randevu tablosuna araç/plaka sütunu eklendi.

## Kontrol listesi
1. Yeni kullanıcı kaydı yap.
2. İşletme oluşturma ekranında sektör olarak `Otomotiv / Oto Servis` seç.
3. Dashboard açıldığında şu içeriklerin geldiğini doğrula:
   - `Bugünkü Servis Randevuları`
   - `Araçlar` menüsü
   - `Müşteri & Araç Kartı`
   - VW Passat, Renault Clio, plaka ve bakım içerikleri
4. Klinik, güzellik, eğitim ve danışmanlık sektörlerinde de başlıkların değiştiğini kontrol et.

## Sonraki geliştirme
Dashboard şu anda sektör bazlı demo preset kullanıyor. Bir sonraki aşamada Firestore'daki gerçek `customers`, `appointments`, `services`, `followUps` kayıtları okunacak.
