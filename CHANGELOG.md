# Changelog

## 2026-09-07 — Makbuz üretimi tüm mali bentlerde kayıt anına taşındı
- `src/services/repository/mockRepository.ts`: ödeme doğuran kayıtlar (`A/B/C/Ç/D/F` ve `E > KREDI_YUKLEME`) oluşturulurken makbuz aynı işlemde otomatik üretilir hale getirildi. E kredi yüklemede ilk dekont ve sonradan eklenen tamamlayıcı dekont için bağlı bağış makbuzları anlık oluşturuluyor. Kayıt oluşturma ve dekont ekleme akışlarına makbuz yetkisi denetimi eklendi.
- `src/utils/yetki.ts`: E kredi yükleme kayıtlarında makbuz üretim yetkisi doğrulama bekleyen dekontları da kapsayacak şekilde güncellendi.
- `src/pages/YeniIslem.tsx`: başarı geri bildiriminde anlık üretilen makbuz numaraları gösteriliyor; “makbuz süreci ayrı ekranda” ifadesi kaldırıldı.
- `src/pages/OdemeMakbuz.tsx`, `src/components/islem/OdemeTablosu.tsx`, `src/components/islem/KrediYuklemeTalepPaneli.tsx`, `src/pages/KayitDetay.tsx`: ekran metinleri ve buton adları “sonradan üretim” yerine “izleme/yeniden döküm + sadece eksik eski kayıt tamamlama” modeline çekildi.
- `src/data/isKurallari.ts`, `docs/ai/BUSINESS_RULES.md`, `docs/ai/PROJECT_MEMORY.md`, `docs/modules/ODEME_DEKONT_MAKBUZ.md`, `docs/modules/E_BENDI_TAS_OCAGI.md`, `docs/ai/DECISION_LOG.md`: yeni davranış ve karar kayıtları dokümantasyona işlendi.
- Doğrulama: `npx tsc --noEmit` temiz.

## 2026-09-06 — E bendi patlatma girişleri Patlatma Takvimi'nde toplandı
- `src/pages/YeniIslem.tsx`: E bendi "Patlatma Planla" ve "Patlatma Sonucunu İşle" işlem türleri kaldırıldı; E bendi yalnız "Kredi Yükle" akışıyla açılır ve işlem türü otomatik seçili gelir. Sonuç bekleyen plan listesi, "Plan kaydı olmadan sonuç işle" butonu ve `PatlatmaYapildiModali` kullanımı Yeni İşlem'den çıkarıldı.
- `src/components/islem/BentAlanlari.tsx`: E bendi işlem türü seçici ve bilgi kaynağı seçici kaldırıldı; planlama operasyon/hesaplama bölümleri silindi; E için "Patlatma işlemleri nerede?" kural notu eklendi. Kredi yükleme hesaplama görünümü korundu.
- Patlatma planlama (EKPL) ve patlatma sonucu işleme (EKGR) tek giriş noktası olarak Patlatma Takvimi ekranında yürümeye devam eder; repository sözleşmeleri değişmedi.
- Doğrulama: `npx tsc --noEmit` temiz, `npm run lint` (0 hata, bilinen 14 Fast Refresh uyarısı), `npm run build` başarılı, `test:kredi-yukleme` 14/14, `test:parser` 7/7, `test:d-bendi` 9/9.

## 2026-09-06 — D bendi çoklu görev dilimi
- `src/types/index.ts`: `GorevDilimi` tipi ve `Islem.gorevDilimleri` alanı eklendi; eski `polisSayisi`/`gorevSuresi` alanları geriye dönük korundu.
- `src/utils/hesaplama.ts`: D bendi hesabı çoklu dilim toplamına geçti (`BAÜ x %0,5 x toplam polis-saat`); açıklama satırlarında her dilim ayrı gösteriliyor. Dilim verilmeyen eski veri tek dilim olarak işleniyor; diğer bentlerin hesaplama dalı değiştirilmedi.
- `src/components/islem/BentAlanlari.tsx` + `src/pages/YeniIslem.tsx`: Yeni İşlem ekranında D bendi için görev dilimi satır tablosu (Görev Dilimi Ekle/Kaldır); her satırda polis sayısı, görev süresi, polis-saat ve satır tutarı gösterilir; en az bir dilim zorunlu, polis 1-999 ve süre 1-99 pozitif tam sayı doğrulanır.
- `src/services/repository/types.ts` + `src/services/repository/mockRepository.ts`: `YeniIslemGirdisi.gorevDilimleri` ve kayıt oluşturma akışı dilimleri saklıyor.
- `src/pages/KayitDetay.tsx`: D bendi kayıtlarında görev dilimleri satır satır listeleniyor; dilimsiz eski kayıtlarda tek polis/süre gösterimi korunuyor.
- Yeni regresyon: `npm run test:d-bendi` (9 senaryo). Doğrulama: `npx tsc --noEmit` temiz, `npm run lint` (0 hata, bilinen Fast Refresh uyarıları), `npm run build` başarılı, `test:kredi-yukleme` 14/14, `test:parser` 7/7.
- Karar kaydı: `docs/ai/DECISION_LOG.md` → DEC-20260906-001.

## 2026-09-04 — Route/menu/source-map tek kaynaklaştırma (typed registry)
- `src/data/routeRegistry.ts` eklendi: route `yol`, `menuId`, `etiket`, `koruma` ve sidebar grup/ikon bilgileri tek typed kaynakta toplandı.
- `src/App.tsx`: route tanımları manuel bloklar yerine `rotaKayitlari` üzerinden üretiliyor; korumalı ekranlar registry içindeki `koruma: 'menu'` işaretine göre `YetkiKapisi` ile sarılıyor.
- `src/data/menuler.ts`: sidebar menü listesi manuel tanım yerine registry'den türetiliyor.
- `src/data/kullanicilar.ts`: `TUM_MENULER` sabiti manuel string listesi yerine `menuler` kaynağından türetiliyor; menu id tekrarları azaltıldı.
- `src/useScreenInit.js`: runtime davranış no-op uyumluluk kancasına indirildi; route/auth akışına etkisi kaldırıldı.
- `src/canvas.manifest.js`: runtime route/auth kaynağı olmadığı açıkça notlandı.
- `docs/modules/ROUTES_SOURCE_MAP.md`: doküman ikincil kaynak olarak güncellendi; runtime tek kaynağın `routeRegistry` olduğu belirtildi.
- Doğrulama: `npx vite build` başarılı (bilinen chunk-size uyarısı dışında hata yok), ilgili dosyalarda `get_errors` temiz.
- Karar kaydı: `docs/ai/DECISION_LOG.md` → DEC-20260904-004.

## 2026-09-04 — E bendi patlatma planlama tek merkezden yürütüldü
- `src/pages/YeniIslem.tsx`: E bendi "Patlatma Planlama" akışı artık kayıt/ajanda/kredi hareketini elle kurmuyor; `patlatmaPlanla` (AppContext) çağrılıyor ve oluşan kayıt `islemBul` ile geri okunuyor. Kredi yetersiz uyarı toast'ı `PatlatmaPlanFormu` ile aynı hale getirildi.
- `src/components/islem/BentAlanlari.tsx`: `IslemFormu`'na `bilgiKaynagi` alanı eklendi; E bendi patlatma planlama bölümüne `BilgiKaynagiSecimi` seçici eklendi (yeni zorunlu alan).
- `docs/modules/E_BENDI_TAS_OCAGI.md` iki giriş noktasının aynı sözleşmeyi paylaştığını belirtecek şekilde güncellendi.
- Doğrulama: `npx tsc --noEmit` (yalnız değişiklikten bağımsız önceden var olan hatalar), `npx vite build` başarılı.
- Karar kaydı: `docs/ai/DECISION_LOG.md` → DEC-20260904-003.

## 2026-09-04 — mp_screen ile şifresiz oturum açma kapatıldı
- `src/App.tsx`: `?mp_screen=...` URL parametresinden gerçek kullanıcıya giriş yapan bootstrap kodu kaldırıldı; uygulama her zaman `Giriş` ekranından başlar.
- `src/useScreenInit.js`: yalnızca `import.meta.env.DEV` iken çalışacak şekilde ek güvenlik kilidi eklendi.
- `src/canvas.manifest.js`: her ekrana gömülü `state: { kullaniciAdi }` bootstrap verileri kaldırıldı.
- Not: Kullanıcı talebiyle `src/pages/Giris.tsx` içindeki demo kullanıcı adı/şifre listesi bu aşamada değiştirilmedi (proje son aşamaya kadar bilinçli olarak korunuyor).
- Doğrulama: `npx vite build` başarılı.

## 2026-09-04 — Repository/adaptör katmanı (auth, yetki, audit, numaralandırma)
- `src/services/repository/types.ts` içinde `KtpgvRepository` sözleşmesi ve ilgili sonuç/istek tipleri tanımlandı.
- `src/services/repository/mockRepository.ts` içinde `MockKtpgvRepository` sınıfı eklendi; kimlik doğrulama, yetki denetimi (makbuz/ödeme/kayıt değiştirme), kayıt/audit yazımı ve `sonrakiKayitNo`/`sonrakiMakbuzNo` üretimi bu sınıfa taşındı. `src/data/*` artık yalnızca bu sınıfın başlangıç (seed) verisidir.
- `src/contexts/AppContext.tsx` yeniden yazıldı: iş kuralı mantığı kaldırıldı, tüm mutasyonlar `repository` üzerinden çağrılıp React state'i sonucu yansıtacak şekilde tazeleniyor. Dışa açılan `useApp()` fonksiyon imzaları değişmedi; sayfa/komponent dosyalarında değişiklik yapılmadı.
- Doğrulama: `npm run test:kredi-yukleme` 14/14, `npx tsc --noEmit` (yalnız değişiklikten bağımsız önceden var olan uyarılar/hatalar), `npx vite build` başarılı.
- Karar kaydı: `docs/ai/DECISION_LOG.md` → DEC-20260904-001. Mimari rehber güncellendi: `docs/ai/ARCHITECTURE.md`.

## 2026-09-02 — README modül geliştirme aşamaları
- Kök `README.md` proje tanıtımı, başlarken adımları ve modül geliştirme aşamaları (Düzeltildi / Güncellendi / Zenginleştirildi / Temel) tablosuyla genişletildi.
- Modül dokümanlarına ve ROADMAP/CHANGELOG/DECISION_LOG dosyalarına bağlantılar eklendi.

> Bu kayıt kapsamında çalışan uygulama kodunda işlevsel değişiklik yapılmamıştır.

## 2026-09-02 — Taş ocağı dekont OCR inceleme çalışma alanı (Faz 6-8)
- `src/utils/dekontOcr.ts` genişletilerek Tesseract kelime koordinatları ve güven değerleri korunur hale getirildi; PDF metin öğeleri normalize edilmiş ortak belge koordinat modeline dönüştürüldü.
- Alan başına alternatif OCR adayları, şüpheli karakter işaretleme ve seçili bölgeyi tekrar okuma (`dekontBolgesiniTekrarOku`) desteği eklendi.
- `src/components/islem/dekont-inceleme/` altında tam ekran belge inceleme çalışma alanı oluşturuldu: `DekontIncelemeCalismaAlani`, `BelgeGoruntuleyici` (imleç merkezli zoom, sınırlandırılmış pan, sığdırma, döndürme, PDF sayfa geçişi), `OcrAlanKatmani` (belge üzeri konumlu alan kutuları), `AlanKontrolPaneli`, `AlanDuzeltmeEditoru` ve `DekontSorunOzeti`.
- Alan düzeltme deneyimi eklendi: banka için aranabilir standart liste, tutar/tarih/numara adayları, belgeden bölge seçerek tekrar okuma, dekont no ile referans noyu tek işlemle yer değiştirme, klavye ile doğrula/sonraki alana geç.
- Kullanıcı düzeltmeleri OCR tekrarından korunacak şekilde kaynak önceliği uygulandı (`KULLANICI > OCR`); OCR ilk değeri ve doğrulanan son değer ayrı saklanıyor.
- Yeni çalışma alanı `src/components/islem/DekontBolumu.tsx` üzerinden yalnız gelişmiş dekont kontrol moduna "Çalışma alanında incele ve düzelt" butonuyla bağlandı; mevcut yan yana kontrol paneli davranışı korundu.
- Doğrulama: `npm run test:kredi-yukleme` 14/14, `npm run test:parser` 7/7, `npm run build` ve `npm run lint` başarılı (yalnız mevcut Fast Refresh uyarıları).

## 2026-08-29 — Taş ocağı kredi yükleme Faz 3-5
- EKRD ilk dekont kaydı `dekontlar` dizisi ve kredi talep özetiyle oluşturulacak şekilde güncellendi; ilk dekont tutarı pozitif olduğu sürece eksik/eşit/fazla olabilir.
- Kayıt Detayı ve Ödeme / Makbuz ekranlarında çoklu banka dekontu, doğrulama durumu, kredi/genel bağış dağılımı ve birden fazla bağış makbuzu görünür hale getirildi.
- Yalnız `DOGRULANDI` durumundaki dekontların kredi kullanılabilirliği ürettiği, her doğrulamada kümülatif tam kredi artışı kadar `YUKLEME` hareketi yazıldığı ve aynı kredinin ikinci kez oluşmadığı akış uygulandı.
- Doğrulanan dekont dağılımları için “Taş Ocağı Patlatması Bağışı” ve gerekiyorsa “Genel Vakıf Bağışı” makbuzları aynı BM serisinden ayrı üretilecek şekilde makbuz modeli genişletildi; legacy `makbuzNo` ilk patlatma makbuzu aliası olarak korundu.
- Kredi raporunda işletmeci bazında doğrulanmış ödeme, patlatma bağışı ve genel Vakıf bağışı ayrımı eklendi; dışa aktarma akışı simülasyon olarak bırakıldı.
- `scripts/kredi-yukleme-regression.ts` çoklu dekont, doğrulanmamış dekont, kısmi doğrulama, çift makbuz ve tekrar doğrulama idempotensi senaryolarıyla genişletildi.

## 2026-08-29 — Taş ocağı ödeme ve bağış makbuzu kuralları
- Kısmi ödemede tam kredi karşılığı kadar kullanılabilir kredi üretilmesi kararı belgelendi.
- Bir kredi talebine çoklu banka dekontu bağlanması ve bekleyen bakiyenin kümülatif değerlendirilmesi tanımlandı.
- Fazla ödemenin genel Vakıf bağışı olması ve tek dekonttan farklı amaçlı iki bağış makbuzu üretilebilmesi kaydedildi.
- Yıl sonu Excel raporunda taş ocağı patlatması bağışları ile firma bazındaki genel bağışların ayrılması tanımlandı.

> Bu kayıt kapsamında çalışan uygulama kodunda işlevsel değişiklik yapılmamıştır.

## 2026-08-29 — Mimari diyagramlar
- Mevcut uygulama mimarisi ve bileşen ilişkileri için ayrıntılı Türkçe Mermaid diyagramları oluşturuldu.
- Teknoloji yığını, veri saklama yaklaşımı ve ana bileşen sorumlulukları belgelendi.
- Ödeme/dekont/kayıt ve taş ocağı kredi/patlatma iş akışları görselleştirildi.

> Bu kayıt kapsamında çalışan uygulama kodunda işlevsel değişiklik yapılmamıştır.

## 2026-08-25 — AI geliştirme altyapısı
- Copilot repository instructions ve AGENTS.md eklendi.
- AI index, project memory, business rules ve decision log eklendi.
- Architecture, database, UI ve coding rehberleri eklendi.
- Known issues, roadmap ve task yaşam döngüsü eklendi.
- KTPGV özel Copilot agent ve reusable task prompt eklendi.
- Kod tabanını açıklayan modül belgeleri eklendi.

> Bu kayıt kapsamında çalışan uygulama kodunda işlevsel değişiklik yapılmamıştır.
