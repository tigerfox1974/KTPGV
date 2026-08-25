# C Bendi — İtfaiye Denetim / Kontrol / Rapor

## Kodda mevcut tanım
`src/data/bentler.ts` C bendini `ADET` hesaplama türünde tanımlar ve ajandaya düşürür. Temel kod formülü `BAÜ x %2 x İşlem Adedi` olarak yer almaktadır.

## Proje iş kuralı
İtfaiye akışında üst seçimler Ruhsatlandırma, İzinlendirme ve Yangın Risk Raporu mantığıyla ele alınır. Denetim + rapor birlikte olduğunda ilgili iş kuralı dokümanındaki birleşik oran ve işlem sayısı/bina sayısı kararları esas alınır.

## Koruma
Kod değişikliği öncesi `BUSINESS_RULES.md` ve en yeni Decision Log kontrol edilmelidir; eski basit `%2 x adet` tanımı tek başına nihai ürün kuralı kabul edilmemelidir.

## İlgili kod
- `src/data/bentler.ts`
- `src/data/isKurallari.ts`
- `src/components/islem/BentAlanlari.tsx`
- `src/utils/hesaplama.ts`
- `src/pages/YeniIslem.tsx`
