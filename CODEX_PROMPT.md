# Not Asistan v2.5 Codex Görevi

Bu proje Next.js + TypeScript + Firebase tabanlı çok işletmeli SaaS uygulamasıdır.

## Bu sürümün amacı

AI Asistan gerçek entegrasyon altyapısını eklemek:

1. Mesaj Merkezi içindeki hatırlatma/takip mesajlarını AI ile yeniden yazmak.
2. İşlem notu penceresinde müşteri özeti üretimini AI destekli hâle getirmek.
3. `OPENAI_API_KEY` yoksa uygulamanın bozulmaması ve fallback şablonla çalışması.

## Kritik dosyalar

- `app/api/ai/message/route.ts`
- `lib/ai.ts`
- `components/MessageCenter.tsx`
- `components/AppointmentNoteModal.tsx`
- `app/globals.css`

## Güvenlik notları

- `OPENAI_API_KEY` istemci tarafında kullanılmamalıdır.
- API key sadece server route içinde `process.env.OPENAI_API_KEY` üzerinden okunmalıdır.
- Sağlık sektöründe tanı, tedavi, ilaç önerisi üretme.
- Müşteriye gönderilecek metinler kısa, sade ve profesyonel olmalıdır.


## v2.6 - Aktif Sol Menü

- Sol menü artık tıklanabilir hale getirildi.
- Seçilen menü aktif olarak vurgulanır.
- Randevular, müşteriler, personel, hizmetler, işlem notları, hatırlatmalar, takipler, sadakat, AI Asistan, raporlar ve ayarlar bölümleri ayrı içerik görünümüne geçer.
- AI Asistan çağrı kartı doğrudan AI Asistan bölümünü açar.


## v2.6.1 - Sidebar taşma düzeltmesi

- Sol menüde Ayarlar/AI Asistan/Raporlar bölümünde CTA kutusunun menü üzerine binmesi düzeltildi.
- Sidebar artık yüksekliği sabit, menü alanı kaydırılabilir, alt CTA kutusu menüden bağımsız çalışır.
- Dar ekranlarda mevcut kompakt sidebar davranışı korunur.


## v2.7 Güvenlik Notu

Firestore rules artık role ve tenantId bazlıdır. Yeni geliştirmelerde her yeni koleksiyon için:

- super_admin erişimi,
- tenant member/admin erişimi,
- customer kendi verisi erişimi,
- public create/read gereksinimi

ayrı ayrı düşünülmelidir. Geniş `match /{document=**}` kuralı kapalıdır.

## v2.8 kapsamı

Tema ve marka ayarları eklendi. `components/AppearanceSettings.tsx` ve `lib/services/appearance-service.ts` dosyaları görünüm ayarlarını yönetir. Ayarlar Firestore'da tenant belgesinin `appearance` alanına ve public profilin `appearance` alanına yazılır. Public sayfa ve müşteri paneli `--theme-primary`, `--theme-accent` CSS değişkenleriyle dinamik renklendirilir.
