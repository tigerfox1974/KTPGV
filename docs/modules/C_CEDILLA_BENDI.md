# Ç Bendi — Yangın Risk Raporu

## Kodda tanım
`src/data/bentler.ts`: Ç bendi `ADET` türündedir; temel formül `BAÜ x %10 x Rapor Adedi`, ajandaya düşer.

## Ana davranış
- Rapor adedi pozitif tam sayı olmalıdır.
- BAÜ merkezi ayardan beslenmelidir.
- Tutar TL olarak gösterilir.
- Planlı operasyon tarihi varsa ajanda akışıyla ilişkilidir.

## İlgili kod
- `src/data/bentler.ts`
- `src/data/isKurallari.ts`
- `src/components/islem/BentAlanlari.tsx`
- `src/utils/hesaplama.ts`
