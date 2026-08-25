# F Bendi — Adli / Trafik Polis Raporları

## Gerçek kod modeli
`src/types/index.ts`: F alt türü zorunlu olarak `ADLI` veya `TRAFIK` modelindedir. `src/data/bentler.ts` temel ücret formülünü `BAÜ x %1 x Rapor Adedi` olarak tanımlar.

## Trafik
- Trafik başvuruları sigorta şirketi kartıyla ilişkilidir (`sigortaSirketiId`).
- Çoklu başvurular `TrafikAltBasvuru[]` ile tutulur.
- Alt başvuruda plaka, hasar dosya no, kaza tarihi, rapor konusu ve rapor tutarı alanları vardır.
- PGM Trafik rolü F/Adli kayıtlarını göremez; bu kısıt `src/utils/yetki.ts` içinde uygulanır.
- Ana/çocuk numara modeli proje iş kurallarındaki `TTRF-YYYY-NNNNNN` ve `-001...` düzenine uymalıdır.

## Adli
- `AdliRapor[]` ayrı veri modelidir.
- Başvuran kişi/kurum türü Trafik kadar kısıtlı değildir.

## İlgili kod
- `src/components/islem/TrafikAltBasvurular.tsx`
- `src/components/islem/AdliRaporlar.tsx`
- `src/pages/SigortaSirketleri.tsx`
- `src/components/kart/SigortaSirketiFormu.tsx`
- `src/utils/numaralandirma.ts`
- `src/utils/yetki.ts`
