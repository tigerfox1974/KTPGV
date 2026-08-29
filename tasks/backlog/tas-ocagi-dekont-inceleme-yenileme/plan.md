# Taş Ocağı Kredi Yükleme Dekont İnceleme Yenileme Planı

## Durum

- Yaşam döngüsü: Backlog
- Onay durumu: Kullanıcı onayı bekleniyor
- Uygulama kodu: Henüz değiştirilmedi
- Kapsam: Yalnızca `E > Kredi Yükleme` içindeki dekont görüntüleme, OCR ve alan düzeltme alt modülü

## Özet

E bendi kredi yükleme içindeki mevcut dekont görüntüleme ve OCR alanı, belgeyi merkeze alan tam ekran bir inceleme çalışma alanına dönüştürülecektir. OCR sonucu kesin veri olarak değil, konumu ve güveni bulunan bir öneri olarak gösterilecek; yanlış okunan banka, tutar, şirket, tarih, referans ve dekont numarası kullanıcı tarafından hızlıca düzeltilebilecektir.

Bu plan, kredi yükleme bölümünün genel çalışma sırasını veya iş kurallarını yeniden tasarlamaz. İşletmeci seçimi, kredi adedi, ödeme hesaplama, kayıt oluşturma ve kredi hareketinin çalışma biçiminde daha sonra bildirilecek değişiklikler ayrı bir plan kapsamında ele alınacaktır. Diğer bentlerin dekont akışı, taş ocağı planlama ve gerçekleşme süreçleri, kredi tüketim kuralları ve mevcut route yapısı bu görev kapsamında değiştirilmeyecektir.

## Gereksinimler

### REQ-001 - Sınırlı kapsam

Yeni deneyim yalnızca E bendi `KREDI_YUKLEME` işleminin dekont görüntüleme, OCR ve kullanıcı düzeltme alt modülünde etkinleşmelidir. Kredi yükleme formunun genel çalışma biçimi ve diğer bentlerin mevcut çalışan dekont ekranı korunmalıdır.

### REQ-002 - Belge merkezli çalışma alanı

Dekont yüklendiğinde belgeyi ana içerik yapan, geniş veya tam ekran bir inceleme çalışma alanı açılmalıdır. Kontrol paneli daraltılabilir olmalıdır.

### REQ-003 - Gelişmiş belge kontrolleri

Görüntüleyici; imleç konumuna zoom, sınırlandırılmış sürükleme, sayfaya sığdırma, genişliğe sığdırma, yüzde seçimi, konum sıfırlama ve sağa/sola döndürme sağlamalıdır. PDF sayfa geçişleri desteklenmelidir.

### REQ-004 - Konumlu OCR sonucu

OCR sonucu alan değeriyle birlikte sayfa, koordinat, kaynak ve güven bilgisi üretmelidir. PDF metni ve Tesseract sonucu ortak bir alan tespiti modeline dönüştürülmelidir.

### REQ-005 - Belge üzeri alan işaretleri

Banka, dekont numarası, referans numarası, tarih, tutar ve ödeme yapan alanları belge üzerinde kutularla işaretlenmelidir. Panelden alana tıklanınca belge ilgili konuma odaklanmalı; kutuya tıklanınca ilgili kontrol açılmalıdır.

### REQ-006 - Kolay düzeltme yöntemleri

Her alan en az şu işlemleri sunmalıdır:

- OCR değerini doğrudan düzenleme
- Belgedeki alanı gösterme
- Belgeden yeni bölge seçme
- Seçili bölgeyi tekrar okuma
- Alternatif OCR adaylarından seçim
- Manuel giriş
- Kullanıcı düzeltmesini doğrulama

Dekont numarası ile referans numarası için tek işlemle değer değiştirme desteği sağlanmalıdır.

### REQ-007 - Alan türüne özel düzeltme

- Banka alanı aranabilir standart banka seçimi sunmalıdır.
- Tutar alanı belgede bulunan tutar adaylarını ve beklenen tutarla farkı göstermelidir.
- Ödeme yapan alanı seçili işletmeci kartıyla benzerlik bilgisi göstermelidir.
- Tarih alanı belge üzerindeki tarih adaylarını ve tarih seçiciyi sunmalıdır.
- Dekont ve referans numarası metin olarak tutulmalı, baştaki sıfırlar korunmalı ve şüpheli karakterler gösterilmelidir.

### REQ-008 - Kullanıcı düzeltmesini koruma

Kullanıcı tarafından düzeltilmiş veya doğrulanmış değer, OCR tekrar çalıştırıldığında otomatik olarak ezilmemelidir. Yeni OCR sonucu yalnızca alternatif öneri olarak sunulmalıdır.

### REQ-009 - Durum ve sorun yönetimi

Her alan `Okundu`, `Kontrol gerekli`, `Kullanıcı düzeltti` veya `Doğrulandı` durumlarından birini taşımalıdır. Düşük güvenli, eksik veya çelişkili alanlar sorun listesinde öncelikli gösterilmelidir.

### REQ-010 - Mali ve mükerrerlik kontrolleri

Mevcut tutar eşleşmesi, gelecek tarih, dekont numarası, banka referansı, dosya hash'i ve benzer ödeme kontrolleri korunmalıdır. OCR yüksek güvenli olsa bile kullanıcı doğrulaması olmadan kayıt tamamlanmamalıdır.

### REQ-011 - İzlenebilir düzeltme

OCR tarafından okunan ilk değer, kullanıcının son değeri, değişiklik durumu ve düzeltme zamanı kaybolmamalıdır. Audit kaydı hassas belge içeriğini gereksiz çoğaltmadan düzeltme olayını göstermelidir.

### REQ-012 - Erişilebilir ve hızlı kullanım

Klavye ile alanlar arasında ilerleme, doğrulama, düzenleme ve görüntüleyici kontrolleri desteklenmelidir. Mobil görünümde belge ve kontrol paneli adımlı/dikey düzene geçmelidir.

### REQ-013 - Regresyon güvenliği

Mevcut yedi parser senaryosu korunmalı; yanlış okuma, alternatif aday, kullanıcı düzeltmesini koruma, alan değiştirme ve durum geçişleri için yeni regresyon senaryoları eklenmelidir. Build ve lint başarılı olmalıdır.

## Teknik Bağlam

### Mevcut yapı

- `src/pages/YeniIslem.tsx` E bendi kredi yükleme durumunu belirler.
- `src/components/islem/DekontBolumu.tsx` yükleme, OCR ve kullanıcı kontrolünü aynı bileşende yürütür.
- `src/components/islem/DosyaOnizlemeModal.tsx` temel görüntü/PDF önizlemesini sağlar.
- `src/utils/dekontOcr.ts` PDF metni, Tesseract OCR ve regex tabanlı alan ayrıştırmasını yürütür.
- `src/utils/dosya.ts` dosya doğrulama, görsel optimizasyon ve SHA-256 üretimini sağlar.
- `src/contexts/AppContext.tsx` işlem, kredi ve audit durumunu bellekte yönetir.

### Önerilen bileşen sınırları

Yeni bileşenler `src/components/islem/dekont-inceleme/` altında tutulacaktır:

- `DekontIncelemeCalismaAlani.tsx`
- `BelgeGoruntuleyici.tsx`
- `OcrAlanKatmani.tsx`
- `AlanKontrolPaneli.tsx`
- `AlanDuzeltmeEditoru.tsx`
- `DekontSorunOzeti.tsx`

Mevcut `DekontBolumu`, yükleme ve çalışma alanını açma sorumluluğunu koruyacak; görüntüleme ve düzeltme ayrıntıları yeni bileşenlere taşınacaktır.

## Anayasa ve İş Kuralı Kontrolü

| Kural | Plan karşılığı |
|---|---|
| BR-001 - Önce ödeme, sonra işlem | Kullanıcı alan doğrulaması ve tutar kontrolü tamamlanmadan kayıt açılamaz |
| BR-002 - Dekont ve makbuz farklıdır | Yeni çalışma alanı yalnız dekont kanıtını inceler; makbuz akışını değiştirmez |
| BR-004 - Para birimi TL | Tutar editörü ve karşılaştırma alanları TL kullanır |
| BR-006 - Rol ve birim bazlı yetki | Mevcut route, kayıt ve eylem kontrolleri korunur |
| BR-008 - Benzersiz numaralar | Mevcut mükerrerlik kontrolleri korunur; backend garantisi bu görevin dışındadır |
| BR-012 ve BR-013 - Kredi modeli | Kredi yükleme sonrası mevcut ortak kredi havuzu davranışı korunur |
| BR-015 - Dekont olmadan kayıt yok | Dosya ve zorunlu alan kontrolü tamamlanmadan kayıt engellenir |
| BR-022 - Minimal-touch | Yeni deneyim yalnız E kredi yüklemeye bağlanır |

## Uygulanan Yönergeler

- Mevcut React, TypeScript, Tailwind ve proje UI bileşenleri kullanılacaktır.
- Yeni bir UI veya test kütüphanesi eklenmeyecektir.
- OCR yardımcı kalacak; otomatik mali onay mekanizmasına dönüşmeyecektir.
- Kullanıcı düzeltmesi OCR sonucundan daha yüksek öncelikli olacaktır.
- Mevcut `DekontDosyasi`, `Dekont` ve form akışı geriye uyumlu genişletilecektir.
- Büyük bir `DekontBolumu` yerine sorumluluğu ayrılmış küçük bileşenler kullanılacaktır.

## Kapsam Dışı

- Supabase, backend veya kalıcı veritabanı entegrasyonu
- Banka API'si üzerinden gerçek ödeme teyidi
- Genel QR/link altyapısının üretime alınması
- Diğer bentlerin dekont ekranının aynı anda yenilenmesi
- E kredi yükleme bölümünün genel adım sırası ve form yapısının yeniden tasarlanması
- İşletmeci seçimi, kredi adedi, kredi bedeli ve ödeme hesaplama davranışlarının değiştirilmesi
- Kredi yükleme kaydı ve kredi hareketi oluşturma kurallarının değiştirilmesi
- Makbuz üretme akışının yeniden tasarlanması
- Kullanıcı doğrulamasını kaldıran otomatik onay

## Uygulama Adımları

### Plan 1 - Mevcut davranışın taban çizgisini koruma

#### P1.1 - Akış sınırlarını sabitleme

E kredi yükleme giriş noktası, diğer bentlerin dekont kullanımı ve kayıt engelleme koşulları belgelenip regresyon kontrol listesine dönüştürülecektir. İlgili gereksinimler: REQ-001, REQ-010, REQ-013.

#### P1.2 - Düzeltme kabul senaryolarını tanımlama

Banka, tutar, işletmeci adı, tarih, dekont numarası ve referans numarası için doğru okuma, yanlış okuma, eksik okuma ve alanların karışması senaryoları hazırlanacaktır. İlgili gereksinimler: REQ-006, REQ-007, REQ-008, REQ-009, REQ-013.

### Plan 2 - OCR ve veri modelini genişletme

#### P2.1 - Konumlu OCR veri modeli

Alan tespiti, kelime/kutu koordinatı, sayfa, güven, kaynak, OCR değeri, güncel değer ve kullanıcı kontrol durumu tipleri eklenecektir. İlgili gereksinimler: REQ-004, REQ-005, REQ-008, REQ-009, REQ-011.

#### P2.2 - OCR aday üretimi

Tesseract kelime verileri ve PDF.js metin konumları korunacak; alan başına birden fazla aday ve şüpheli karakter bilgisi üretilecektir. İlgili gereksinimler: REQ-004, REQ-006, REQ-007.

#### P2.3 - Bölgesel tekrar okuma

Kullanıcının seçtiği görüntü bölgesine alan türüne uygun OCR uygulanacaktır. Numara alanlarında karakter kümesi sınırlandırılacak; para alanında tutar adayları üretilecektir. İlgili gereksinimler: REQ-006, REQ-007.

### Plan 3 - Belge inceleme çalışma alanı

#### P3.1 - Tam ekran çalışma alanı

Dekont görüntüleyici ve daraltılabilir kontrol panelinden oluşan geniş çalışma alanı oluşturulacaktır. İlgili gereksinimler: REQ-002, REQ-012.

#### P3.2 - Görüntüleyici etkileşimleri

İmleç merkezli zoom, sınırlandırılmış pan, sığdırma modları, döndürme, sıfırlama ve PDF sayfa kontrolleri eklenecektir. İlgili gereksinimler: REQ-003, REQ-012.

#### P3.3 - OCR alan katmanı

OCR kutuları belge üzerine çizilecek; güven ve kontrol durumuna göre renklendirilecek; panel ile çift yönlü odak senkronizasyonu sağlanacaktır. İlgili gereksinimler: REQ-004, REQ-005, REQ-009.

### Plan 4 - Alan düzeltme ve doğrulama deneyimi

#### P4.1 - Ortak alan kontrol akışı

Her alan için `Belgede göster`, `Düzenle`, `Belgeden seç`, `Tekrar oku`, `Alternatif kullan`, `Manuel gir` ve `Doğrula` işlemleri oluşturulacaktır. İlgili gereksinimler: REQ-005, REQ-006, REQ-008, REQ-009.

#### P4.2 - Alan türüne özel editörler

Banka seçimi, tutar adayları, işletmeci benzerliği, tarih adayları ve numara karakter kontrolleri uygulanacaktır. Dekont ve referans numarası değer değiştirme işlemi eklenecektir. İlgili gereksinimler: REQ-006, REQ-007.

#### P4.3 - Sorun kuyruğu ve hızlı ilerleme

Hatalı, eksik veya düşük güvenli alanlar önceliklendirilecek; kullanıcı doğrula ve sonraki alana geç davranışıyla ilerleyebilecektir. İlgili gereksinimler: REQ-009, REQ-012.

### Plan 5 - OCR alt modülünün mevcut kredi yüklemeye bağlanması

#### P5.1 - E kredi yüklemeye bağlama

Yeni çalışma alanı yalnız `krediYukleme` durumunda açılacak; kredi yükleme formunun mevcut işleyişi ve diğer bentlerin görünümü korunacaktır. İlgili gereksinimler: REQ-001, REQ-010.

#### P5.2 - Kayıt öncesi özet ve engeller

Kullanıcı doğrulaması, tutar uyumu, tarih ve mükerrerlik kontrolleri tek özette gösterilecek; zorunlu kontrol eksikse kayıt engellenecektir. İlgili gereksinimler: REQ-009, REQ-010.

#### P5.3 - Düzeltme audit izi

OCR değeri ve kullanıcı değeri ayrımı işlem verisine taşınacak; düzeltme olayları uygun ayrıntı düzeyinde audit kaydına yazılacaktır. İlgili gereksinimler: REQ-008, REQ-011.

### Plan 6 - Doğrulama ve son düzenlemeler

#### P6.1 - Parser ve durum regresyonları

Mevcut parser senaryoları çalıştırılacak ve yeni düzeltme senaryoları eklenecektir. İlgili gereksinimler: REQ-013.

#### P6.2 - Etkileşim kontrolü

Zoom, pan, döndürme, PDF sayfa geçişi, kutu-panel senkronizasyonu, klavye ve mobil düzen elle doğrulanacaktır. İlgili gereksinimler: REQ-002, REQ-003, REQ-005, REQ-012, REQ-013.

#### P6.3 - Build, lint ve dokümantasyon

Build ve lint çalıştırılacak; E bendi, ödeme/dekont ve UI belgeleriyle changelog güncellenecektir. İlgili gereksinimler: REQ-001, REQ-013.

## Görev Dökümü

### Faz 1 - Taban çizgisi

- [ ] T001 [Plan:1.1] `src/pages/YeniIslem.tsx`, `src/components/islem/DekontBolumu.tsx` ve `src/utils/dekontOcr.ts` mevcut E kredi yükleme davranışını doğrula
- [ ] T002 [Plan:1.2] `scripts/dekont-parser-regression.ts` içinde mevcut senaryoları çalıştırılabilir taban çizgisine getir ve sonuçları kaydet
- [ ] T003 [Plan:1.2] Yanlış banka, yanlış tutar, şirket adı farkı, tarih adayı, karışmış numaralar ve eksik alan kabul örneklerini tanımla

### Faz 2 - Temel model ve OCR

- [ ] T004 [Plan:2.1] Konumlu OCR, aday, güven ve kullanıcı kontrol tiplerini `src/types/index.ts` içinde geriye uyumlu ekle
- [ ] T005 [Plan:2.2] Tesseract kelime koordinatlarını ve güven değerlerini `src/utils/dekontOcr.ts` içinde koru
- [ ] T006 [Plan:2.2] PDF.js metin öğelerini sayfa ve koordinat bilgisiyle `src/utils/dekontOcr.ts` içinde ortak modele dönüştür
- [ ] T007 [Plan:2.2] Alan başına alternatif aday ve şüpheli karakter üretimini `src/utils/dekontOcr.ts` içinde uygula
- [ ] T008 [Plan:2.3] Seçili bölge ve alan türüyle tekrar OCR çalıştırmayı `src/utils/dekontOcr.ts` içinde uygula
- [ ] T009 [Plan:2.3] OCR ön işleme yardımcılarını `src/utils/dekontGoruntuIsleme.ts` içinde oluştur

### Faz 3 - Belge çalışma alanı

- [ ] T010 [P] [Plan:3.1] Tam ekran kabuğu `src/components/islem/dekont-inceleme/DekontIncelemeCalismaAlani.tsx` içinde oluştur
- [ ] T011 [Plan:3.2] Zoom, pan, sığdırma, döndürme ve PDF sayfalarını `src/components/islem/dekont-inceleme/BelgeGoruntuleyici.tsx` içinde uygula
- [ ] T012 [Plan:3.3] Konumlu alan kutularını `src/components/islem/dekont-inceleme/OcrAlanKatmani.tsx` içinde uygula
- [ ] T013 [Plan:3.1,3.3] Görüntüleyici, alan katmanı ve kontrol paneli arasındaki seçili alan durumunu çalışma alanında koordine et

### Faz 4 - Düzeltme deneyimi

- [ ] T014 [P] [Plan:4.1] Alan listesi ve seçili alan görünümünü `src/components/islem/dekont-inceleme/AlanKontrolPaneli.tsx` içinde oluştur
- [ ] T015 [Plan:4.1] Ortak düzenle, manuel gir, alternatif seç, belgeden seç, tekrar oku ve doğrula işlemlerini `src/components/islem/dekont-inceleme/AlanDuzeltmeEditoru.tsx` içinde uygula
- [ ] T016 [Plan:4.2] Banka, tutar, işletmeci, tarih ve numara türlerine özel düzeltme kontrollerini alan editörüne ekle
- [ ] T017 [Plan:4.2] Dekont numarası ve referans numarası değer değiştirme işlemini ekle
- [ ] T018 [Plan:4.3] Öncelikli sorun listesini `src/components/islem/dekont-inceleme/DekontSorunOzeti.tsx` içinde oluştur
- [ ] T019 [Plan:4.1,4.3] Kullanıcı düzeltmelerini OCR tekrarından koru ve klavye ile doğrula/ilerle davranışını uygula

### Faz 5 - OCR alt modülü entegrasyonu

- [ ] T020 [Plan:5.1] Yeni çalışma alanını `src/components/islem/DekontBolumu.tsx` üzerinden yalnız E kredi yüklemeye bağla
- [ ] T021 [Plan:5.1] `src/pages/YeniIslem.tsx` içinde kredi yükleme formunun genel işleyişi, diğer bentler ve E planlama/gerçekleşme akışlarının değişmediğini koru
- [ ] T022 [Plan:5.2] Tutar, tarih, zorunlu alan ve mükerrerlik sonuçlarını kayıt öncesi özette birleştir
- [ ] T023 [Plan:5.3] OCR ilk değeri, kullanıcı son değeri ve kontrol durumunu `src/types/index.ts` ve `src/pages/YeniIslem.tsx` üzerinden işlem kaydına taşı
- [ ] T024 [Plan:5.3] Düzeltme ve doğrulama olaylarını `src/contexts/AppContext.tsx` mevcut audit düzenine uygun bağla

### Faz 6 - Doğrulama ve dokümantasyon

- [ ] T025 [Plan:6.1] Mevcut ve yeni parser/düzeltme regresyonlarını `scripts/dekont-parser-regression.ts` ile çalıştır
- [ ] T026 [Plan:6.2] Gerçek PDF, JPG ve PNG örneklerinde görüntüleyici ve düzeltme kabul senaryolarını elle doğrula
- [ ] T027 [Plan:6.2] Masaüstü, dar ekran, klavye ve dokunmatik etkileşim kontrollerini tamamla
- [ ] T028 [Plan:6.3] Mevcut `npm run build` ve `npm run lint` komutlarını çalıştır
- [ ] T029 [P] [Plan:6.3] `docs/modules/E_BENDI_TAS_OCAGI.md`, `docs/modules/ODEME_DEKONT_MAKBUZ.md` ve `docs/ai/UI_STANDARDS.md` belgelerini güncelle
- [ ] T030 [P] [Plan:6.3] Teknik değişikliği `CHANGELOG.md` içine kaydet

## Kabul Ölçütleri

1. E kredi yükleme dışındaki dekont akışları davranış ve görünüm olarak değişmez.
2. Kullanıcı herhangi bir OCR alanını belge üzerinde bulabilir ve belgeyi aramadan ilgili bölgeye odaklanabilir.
3. Yanlış banka adı listeden, yanlış tutar adaylardan, yanlış işletmeci adı kart eşleşmesinden düzeltilebilir.
4. Dekont ve referans numarası elle yazılabilir, belgeden seçilebilir veya tek işlemle yer değiştirebilir.
5. Kullanıcı düzeltmesi yeniden OCR çalıştırıldığında kaybolmaz.
6. Her zorunlu alan kullanıcı tarafından doğrulanmadan kayıt oluşturulamaz.
7. Mevcut tutar, tarih ve mükerrerlik engelleri korunur.
8. OCR kutuları, panel seçimi ve belge odağı çift yönlü çalışır.
9. Görüntü zoom ve sürükleme sırasında kaybolmaz; sıfırlama ve sığdırma çalışır.
10. Build, lint ve parser regresyonları başarılı olur.

## Riskler ve Önlemler

| Risk | Önlem |
|---|---|
| Tesseract sürümünde kelime koordinatı çıktısının değişmesi | OCR adaptörünü tek utility sınırında tutmak |
| PDF ve görsel koordinatlarının farklı olması | Normalize edilmiş 0-1 belge koordinatı kullanmak |
| Büyük görsellerde performans düşmesi | Görsel katmanlarını memoize etmek ve bölgesel OCR kullanmak |
| Kullanıcı düzeltmesinin kaybolması | Kullanıcı kaynağına OCR'dan yüksek öncelik vermek |
| Yeni ekranın diğer bentleri etkilemesi | Yalnız `krediYukleme` koşulunda bağlamak |
| Çok yoğun kutu görünümü | Alan katmanını açıp kapatma ve yalnız seçili alanı gösterme seçenekleri |
| Mobil ekranda alan darlığı | Görüntü ve kontrolü ardışık/dikey adımlara çevirmek |

## Onay Paketi

Bu plan onaylandığında aşağıdaki yaklaşım kabul edilmiş sayılacaktır:

1. Yeni deneyim ilk aşamada yalnız taş ocağı kredi yükleme içindeki dekont/OCR alt modülünde kullanılacak.
2. Tam ekran belge inceleme çalışma alanı uygulanacak.
3. OCR sonucu öneri olacak; kullanıcı doğrulaması zorunlu kalacak.
4. Kullanıcı düzeltmesi yeniden OCR tarafından ezilmeyecek.
5. Alan düzeltme, belgeden seçme ve alternatif aday yöntemleri birlikte sunulacak.
6. Backend, Supabase ve banka API entegrasyonu bu göreve dahil edilmeyecek.
7. Kredi yükleme bölümünün genel çalışma şekli bu planla değiştirilmeyecek; daha sonra verilecek gereksinimler için ayrı plan hazırlanacak.
8. Diğer bentlere yayılım ayrı kullanıcı onayıyla yapılacak.

## Requirement Mapping

| REQ ID | Açıklama | Plan Maddeleri | Uygulama Kanıtı |
|---|---|---|---|
| REQ-001 | Yalnız E kredi yükleme kapsamı | P1.1, P5.1, P6.3 | `YeniIslem.tsx`, `DekontBolumu.tsx` |
| REQ-002 | Belge merkezli çalışma alanı | P3.1, P6.2 | `DekontIncelemeCalismaAlani.tsx` |
| REQ-003 | Gelişmiş belge kontrolleri | P3.2, P6.2 | `BelgeGoruntuleyici.tsx` |
| REQ-004 | Konumlu OCR sonucu | P2.1, P2.2, P3.3 | `types/index.ts`, `dekontOcr.ts` |
| REQ-005 | Belge üzeri alan işaretleri | P3.3, P4.1, P6.2 | `OcrAlanKatmani.tsx`, `AlanKontrolPaneli.tsx` |
| REQ-006 | Kolay düzeltme yöntemleri | P1.2, P2.3, P4.1, P4.2 | `AlanDuzeltmeEditoru.tsx`, `dekontOcr.ts` |
| REQ-007 | Alan türüne özel düzeltme | P1.2, P2.2, P2.3, P4.2 | `AlanDuzeltmeEditoru.tsx` |
| REQ-008 | Kullanıcı düzeltmesini koruma | P1.2, P2.1, P4.1, P5.3 | `types/index.ts`, `DekontIncelemeCalismaAlani.tsx` |
| REQ-009 | Durum ve sorun yönetimi | P1.2, P2.1, P3.3, P4.1, P4.3, P5.2 | `DekontSorunOzeti.tsx`, `AlanKontrolPaneli.tsx` |
| REQ-010 | Mali ve mükerrerlik kontrolleri | P1.1, P5.1, P5.2 | `DekontBolumu.tsx`, `YeniIslem.tsx` |
| REQ-011 | İzlenebilir düzeltme | P2.1, P5.3 | `types/index.ts`, `AppContext.tsx` |
| REQ-012 | Erişilebilir ve hızlı kullanım | P3.1, P3.2, P4.3, P6.2 | Yeni inceleme bileşenleri |
| REQ-013 | Regresyon güvenliği | P1.1, P1.2, P6.1, P6.2, P6.3 | Parser scripti, build ve lint sonuçları |
