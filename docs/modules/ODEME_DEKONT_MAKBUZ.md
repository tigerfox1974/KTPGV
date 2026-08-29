# Ödeme / Dekont / Makbuz

## Ana prensip
`Önce ödeme, sonra işlem.` Ödeme kanıtı olmadan ödeme gerektiren kayıt operasyonel olarak başlatılmamalıdır.

## Dekont veri modeli
`src/types/index.ts` dekont için dekont no, banka referans no, banka, tarih, ödenen tutar, ödeyen ve tek dosya alanını tanımlar. Dosya PDF/JPG/PNG ve `PERSONEL` veya `QR_LINK` yöntemiyle gelebilir. OCR durum/güven alanları bulunmaktadır.

## Gerçek bileşenler
- `src/components/islem/DekontBolumu.tsx`
- `src/components/islem/QrDekontPaneli.tsx`
- `src/components/islem/DosyaOnizlemeModal.tsx`
- `src/utils/dekontOcr.ts`
- `src/utils/dosya.ts`
- `scripts/dekont-parser-regression.ts`

## Makbuz
- `src/pages/OdemeMakbuz.tsx`
- `src/components/islem/OdemeTablosu.tsx`
- `src/components/islem/MakbuzModal.tsx`
- KTPGV bir vakıf olduğu için Vakfa gelen her ödeme için bağış makbuzu düzenlenir.
- Banka dekontu ödeme kanıtıdır; bağış makbuzu Vakfın ürettiği mali belgedir.
- Makbuz üretimi kullanıcıdaki `makbuzUretebilir` yetkisine ve mali kayıt görünürlüğüne bağlıdır.
- Ödeme bekleyen kayıtta makbuz üretilemez; ödeme doğrulama yetkisi ayrıca kontrol edilir.

## Taş ocağı ödemelerinde çoklu dekont ve makbuz

- Bir kredi talebine hedef tutar tamamlanana kadar birden fazla banka dekontu bağlanabilir.
- Eksik ödemede tolerans uygulanmaz; kümülatif ödemenin karşıladığı tam krediler kullanılabilir olur.
- Tam krediye yetmeyen bakiye sonraki dekontla birleştirilmek üzere bekletilir.
- Kredi hedefini aşan bölüm ek kredi üretmez ve genel Vakıf bağışı olarak kaydedilir.
- Tek banka dekontunun krediye ayrılan bölümü için “Taş Ocağı Patlatması Bağışı”, fazla bölümü için “Genel Vakıf Bağışı” türünde iki ayrı makbuz üretilebilir.
- Her makbuzun numarası, amacı, tutarı ve bağlı olduğu banka dekontu izlenebilir olmalıdır.

## Korunacak kararlar
- Ayrı/global QR Dekont Yükleme menüsü oluşturulmaz; QR kayıt içindeki dekont bölümünün yöntemidir.
- Doğrudan dosya yükleme ve QR birlikte korunur.
- Fiziksel dekont dijital sisteme kaydedilir.
- OCR yardımcıdır; doğrulama sorumluluğunun yerine geçmez.
- Makbuz, dekontun yerine ödeme kanıtı değildir.
