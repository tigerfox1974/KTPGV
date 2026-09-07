# D Bendi — Yol Kapama ve Güvenlik Tedbiri

## Kodda tanım
`src/data/bentler.ts`: `GOREV` hesaplama türü, ajandaya düşer. Temel formül `Polis Sayısı x Görev Süresi x BAÜ x %0,5`.

## Kalıcı iş kuralları
- Bir işlem birden fazla görev dilimi içerebilir.
- Her dilimde polis sayısı ve görev süresi ayrı girilir; toplam tüm dilimlerin toplamıdır.
- Polis sayısı pozitif tam sayı ve en fazla 3 basamak (999).
- Görev süresi pozitif tam saat ve en fazla 2 basamak (99); yarım saat kabul edilmez.
- Her görev diliminin kendi polis-saat/tutar sonucu kullanıcıya gösterilmelidir.
- Yazdırma/PDF düzeninde alıcı `Kıbrıs Türk Polis Güçlendirme Vakfı`, para birimi TL ve BAÜ etiketi korunur.

## Uygulama durumu
Çoklu görev dilimi 2026-09-06 itibarıyla `Islem.gorevDilimleri` alanıyla uygulanmıştır (bkz. DEC-20260906-001): Yeni İşlem formunda dilim satırları eklenebilir/kaldırılabilir, her satırda polis-saat ve satır tutarı görünür; hesaplama `hesapla()` içinde dilim bazlı toplanır (`BAÜ x %0,5 x toplam polis-saat`). Eski tek `polisSayisi`/`gorevSuresi` alanları geriye dönük korunur; dilim verilmeyen kayıtlar tek dilim olarak işlenir.

## İlgili kod
- `src/components/islem/BentAlanlari.tsx`
- `src/utils/hesaplama.ts`
- `src/pages/YeniIslem.tsx`
- `src/pages/KayitDetay.tsx`
- `src/types/index.ts` — `GorevDilimi`
- `src/services/repository/types.ts` — `YeniIslemGirdisi.gorevDilimleri`
- `src/data/ajanda.ts`
