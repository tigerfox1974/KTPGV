# B Bendi — Hurda ve Hizmet Dışı Mal Satışı

## Kodda tanım
`src/data/bentler.ts`: B bendi `MANUEL` hesaplama türündedir, sabit oran yoktur ve ajandaya düşmez.

## Ana davranış
- Tutar manuel girilir.
- Gelir ilgili yasal amaç kapsamında Vakıf/Kurum hesabına aktarılır.
- Otomatik BAÜ oranı uygulanmaz.
- Genel ödeme/dekont/makbuz kuralları korunur.

## İlgili kod
- `src/data/bentler.ts`
- `src/components/islem/BentAlanlari.tsx`
- `src/pages/YeniIslem.tsx`
