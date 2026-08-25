# A Bendi — Faaliyet Geliri / Yardım / Bağış

## Kodda tanım
`src/data/bentler.ts`: A bendi `MANUEL` hesaplama türündedir; sabit oran yoktur ve ajandaya düşmez.

## Ana davranış
- Tutar kullanıcı tarafından manuel girilir.
- BAÜ katsayılı otomatik formül uygulanmaz.
- Para gösterimi TL standardına uyar.
- Yeni işlem akışı genel ödeme/dekont/makbuz kurallarına tabidir.

## İlgili kod
- `src/data/bentler.ts`
- `src/components/islem/BentAlanlari.tsx`
- `src/pages/YeniIslem.tsx`
- `src/utils/hesaplama.ts`
