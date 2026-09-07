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
- `src/pages/KayitDetay.tsx`
- KTPGV bir vakıf olduğu için Vakfa gelen her ödeme için bağış makbuzu düzenlenir.
- Banka dekontu ödeme kanıtıdır; bağış makbuzu Vakfın ürettiği mali belgedir.
- Ödeme doğuran kayıt kaydedildiği anda makbuz numarası otomatik üretilir; bu adım kayıt işleminden ayrılmaz.
- Makbuz üretimi kullanıcıdaki `makbuzUretebilir` yetkisine ve mali kayıt görünürlüğüne bağlıdır.
- Ödeme / Makbuz ekranı birincil olarak izleme, görüntüleme ve yeniden döküm içindir; manuel üretim yalnız geçmiş/eksik kayıt düzeltmesi için istisna olarak tutulur.

## Taş ocağı ödemelerinde çoklu dekont ve makbuz

- Bir kredi talebine hedef tutar tamamlanana kadar birden fazla banka dekontu bağlanabilir.
- Eksik ödemede tolerans uygulanmaz; kümülatif ödemenin karşıladığı tam krediler kullanılabilir olur.
- Kredi kullanılabilirliği hesabına yalnız `dogrulamaDurumu = DOGRULANDI` olan dekontlar girer.
- Tam krediye yetmeyen bakiye sonraki dekontla birleştirilmek üzere bekletilir.
- Kredi hedefini aşan bölüm ek kredi üretmez ve genel Vakıf bağışı olarak kaydedilir.
- Her dekont kaydıyla bağlı bağış makbuzu aynı anda üretilir; kredi kullanılabilirliği ise doğrulama adımına bağlı kalır.
- Tek banka dekontunun krediye ayrılan bölümü için “Taş Ocağı Patlatması Bağışı”, fazla bölümü için “Genel Vakıf Bağışı” türünde iki ayrı makbuz üretilebilir.
- Her makbuzun numarası, amacı, tutarı ve bağlı olduğu banka dekontu izlenebilir olmalıdır.
- İlk patlatma bağışı makbuzu legacy `makbuzNo` aliası olarak korunur; aynı dağılıma ikinci kez makbuz üretilmez.

## Korunacak kararlar
- Ayrı/global QR Dekont Yükleme menüsü oluşturulmaz; QR kayıt içindeki dekont bölümünün yöntemidir.
- Doğrudan dosya yükleme ve QR birlikte korunur.
- Fiziksel dekont dijital sisteme kaydedilir.
- OCR yardımcıdır; doğrulama sorumluluğunun yerine geçmez.
- Makbuz, dekontun yerine ödeme kanıtı değildir.

## Dekont OCR inceleme çalışma alanı (2026-09-02)
- `src/components/islem/dekont-inceleme/` altında tam ekran belge inceleme çalışma alanı bulunur; `DekontBolumu` içindeki "Çalışma alanında incele ve düzelt" butonuyla açılır.
- `BelgeGoruntuleyici`: imleç merkezli zoom, sınırlandırılmış pan, sayfaya/genişliğe sığdırma, döndürme ve PDF sayfa geçişi sağlar.
- `OcrAlanKatmani`: OCR alanlarının normalize edilmiş koordinat kutularını belge üzerinde gösterir; panel-belge odağı çift yönlüdür.
- `AlanKontrolPaneli` + `AlanDuzeltmeEditoru`: banka standart listeden, tutar/tarih/numara adaylardan düzeltilebilir; bölge seçilerek tekrar OCR okunabilir; dekont no ile referans no tek işlemle yer değiştirilebilir.
- Kullanıcı düzeltmesi (`KULLANICI` kaynağı) yeniden OCR tarafından ezilmez; OCR ilk değeri ve doğrulanan son değer `ocrIlkDegerleri` / `ocrDogrulananDegerleri` alanlarında ayrı saklanır.
