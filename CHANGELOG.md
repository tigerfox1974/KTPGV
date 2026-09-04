# Changelog

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
