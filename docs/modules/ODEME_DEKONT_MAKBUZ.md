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
- Makbuz üretimi kullanıcıdaki `makbuzUretebilir` yetkisine ve mali kayıt görünürlüğüne bağlıdır.
- Ödeme bekleyen kayıtta makbuz üretilemez; ödeme doğrulama yetkisi ayrıca kontrol edilir.

## Korunacak kararlar
- Ayrı/global QR Dekont Yükleme menüsü oluşturulmaz; QR kayıt içindeki dekont bölümünün yöntemidir.
- Doğrudan dosya yükleme ve QR birlikte korunur.
- Fiziksel dekont dijital sisteme kaydedilir.
- OCR yardımcıdır; doğrulama sorumluluğunun yerine geçmez.
- Makbuz, dekontun yerine ödeme kanıtı değildir.
