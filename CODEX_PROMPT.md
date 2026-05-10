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
