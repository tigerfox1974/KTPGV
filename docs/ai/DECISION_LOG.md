# KTPGV — Decision Log

Bu dosya geliştirme sırasında alınan anlık ve yeni kararların kronolojik kaydıdır. Kararlar burada kaybolmadan tutulur; kalıcı hale gelenler daha sonra `PROJECT_MEMORY.md` ve/veya `BUSINESS_RULES.md` dosyasına taşınır.

## Kayıt formatı
Her yeni karar aşağıdaki formatta eklenir:

### DEC-YYYYMMDD-NNN — Kısa karar başlığı
- Tarih: YYYY-MM-DD
- Modül: ilgili modül/bent
- Durum: Önerildi | Onaylandı | Uygulandı | İptal edildi | Kalıcı kurala taşındı
- Karar: Ne kararlaştırıldı?
- Gerekçe: Neden?
- Etki: Hangi ekran, veri, dosya veya akış etkileniyor?
- Koruma: Özellikle değişmemesi gereken mevcut davranış nedir?
- İlgili iş kuralı: varsa BR-xxx
- İlgili görev: varsa `tasks/...`

---

## Başlangıç kayıtları

### DEC-20260906-002 — E bendi patlatma planlama/sonuç girişleri Yeni İşlem'den kaldırıldı
- Tarih: 2026-09-06
- Modül: E Bendi / Taş Ocağı / Patlatma Takvimi / Yeni İşlem
- Durum: Uygulandı
- Karar: Yeni İşlem ekranındaki E bendi "Patlatma Planla" (KREDI_PLANLAMA) ve "Patlatma Sonucunu İşle" (KREDI_GERCEKLESME) işlem türleri kaldırıldı; E bendi Yeni İşlem'de yalnız kredi yükleme (KREDI_YUKLEME) kaydı açar ve işlem türü otomatik seçili gelir. Patlatma planlama ve patlatma sonucu işleme (Yapıldı/Yapılmadı/Ertelendi/İptal) tek giriş noktası olarak Patlatma Takvimi ekranında yürür.
- Gerekçe: `isKurallari` "patlatmaların günlük takibi Patlatma Takvimi ekranından yapılır; sonuç kart üzerinden tek tıkla işlenir" derken Ajanda ve Ödeme/Makbuz ekranları da Takvime yönlendiriyordu. Yeni İşlem yolundaki sonuç işleme yalnız "Yapıldı" işleyebiliyor (Yapılmadı/Ertelendi/İptal modalleri yoktu) ve planlama için ikinci bir form kopyası sürdürülüyordu — DEC-20260904-003'te belgelenen iki giriş noktası drift riskinin kaynağı buydu.
- Etki: `src/pages/YeniIslem.tsx` (planlama/gerçekleşme bölümleri, sonuç bekleyen plan listesi, "Plan kaydı olmadan sonuç işle" butonu, `PatlatmaYapildiModali` kullanımı ve `patlatmaPlanla`/`islemBul`/`ajanda` bağımlılıkları kaldırıldı), `src/components/islem/BentAlanlari.tsx` (E işlem türü seçici, bilgi kaynağı seçici, planlama operasyon/hesaplama bölümleri kaldırıldı; E için "Patlatma işlemleri nerede?" kural notu eklendi), `docs/modules/E_BENDI_TAS_OCAGI.md`, `CHANGELOG.md`.
- Koruma: Kredi yükleme (EKRD) akışı, dekont doğrulama/makbuz kuralları, `patlatmaPlanla`/`patlatmaGerceklesmeIsle`/`patlatmaSonucIsle` repository sözleşmeleri ve Patlatma Takvimi ekranı değiştirilmedi. "Plan kaydı olmadan sonuç işle" yeteneği Yeni İşlem'le birlikte kalktı; ihtiyaç halinde Takvime ayrı kullanıcı kararıyla eklenecek. Diğer bentlerin hesaplama ve form davranışı korunudu.
- İlgili iş kuralı: BR-001, BR-022; `isKurallari` E bendi akışı
- İlgili görev: —

### DEC-20260906-001 — D bendi çoklu görev dilimi uygulandı (BR-019)
- Tarih: 2026-09-06
- Modül: D Bendi / Yol Kapama / Güvenlik Tedbiri
- Durum: Uygulandı
- Karar: `Islem` tipine `gorevDilimleri?: GorevDilimi[]` eklendi. Yeni İşlem formunda D bendi için görev dilimi satırları (polis sayısı, görev süresi, polis-saat, satır tutarı) girilebilir; "Görev Dilimi Ekle/Kaldır" ile satır yönetimi yapılır, en az bir dilim zorunludur. `hesapla()` D bendini dilim bazlı toplam üzerinden hesaplar: `BAÜ x %0,5 x toplam polis-saat`. Sınırlar: polis sayısı 1-999, görev süresi 1-99, ikisi de pozitif tam sayı; geçersiz dilimli hesap kaydı engeller.
- Gerekçe: BR-019 kuralı dokümanlarda tanımlıydı ancak kodda karşılığı yoktu; tek `polisSayisi`/`gorevSuresi` alanı birden fazla görev dilimini temsil edemiyor ve dilim bazlı polis-saat ara toplamı gösterilemiyordu.
- Etki: `src/types/index.ts`, `src/utils/hesaplama.ts`, `src/components/islem/BentAlanlari.tsx`, `src/pages/YeniIslem.tsx`, `src/services/repository/types.ts`, `src/services/repository/mockRepository.ts`, `src/pages/KayitDetay.tsx`, `scripts/d-bendi-hesaplama-regression.ts` (yeni), `package.json` (`test:d-bendi`).
- Koruma: Diğer bentlerin hesaplama davranışı değiştirilmedi; E bendi kredi/dekont/makbuz/OCR akışları ve repository sözleşmesi korunudu. Eski `polisSayisi`/`gorevSuresi` alanları geriye dönük korundu; dilim verilmeyen kayıtlar tek dilim olarak işlenir. Doğrulama: `tsc --noEmit` temiz, lint 0 hata, build başarılı, `test:kredi-yukleme` 14/14, `test:parser` 7/7, `test:d-bendi` 9/9.
- İlgili iş kuralı: BR-019, BR-020
- İlgili görev: —

### DEC-20260904-004 — Route/menu/protection tek kaynakta (`routeRegistry`) toplandı
- Tarih: 2026-09-04
- Modül: Route yönetimi / Menü / Yetki kapısı
- Durum: Uygulandı
- Karar: `src/data/routeRegistry.ts` dosyası eklenerek path, menu id, etiket, koruma gereksinimi ve sidebar grup/ikon bilgileri tek typed kayıt altında toplandı. `src/App.tsx` route wiring'i bu kayıtlardan üretilecek şekilde değiştirildi; `src/data/menuler.ts` manuel menü listesi kaldırılarak registry'den türetildi. Ek olarak `src/data/kullanicilar.ts` içindeki `TUM_MENULER` listesi menü kaynağından türetildi.
- Gerekçe: Route/path/menu-id bilgisinin birden çok dosyada tutulması drift riski doğuruyordu. Tracer AI yorumu bu riski hedefledi.
- Etki: `src/data/routeRegistry.ts` (yeni), `src/App.tsx`, `src/data/menuler.ts`, `src/data/kullanicilar.ts`, `docs/modules/ROUTES_SOURCE_MAP.md`.
- Koruma: Runtime auth akışı `canvas.manifest` bağımlılığından tamamen ayrıldı; `src/useScreenInit.js` no-op uyumluluk kancası olarak bırakıldı, `src/canvas.manifest.js` yalnız tasarım/tuval metadatası olarak işaretlendi.
- İlgili iş kuralı: Menüden gizlemek yetmez; route/ekran erişimi yetki kapısıyla korunur (BUSINESS_RULES / Yetki ilkeleri).
- İlgili görev: —

### DEC-20260904-003 — E bendi patlatma planlama tek merkezden (`patlatmaPlanla`) yürütüldü
- Tarih: 2026-09-04
- Modül: E Bendi / Taş Ocağı / Patlatma Planlama
- Durum: Uygulandı
- Karar: `src/pages/YeniIslem.tsx` içindeki E bendi "Patlatma Planlama" (`KREDI_PLANLAMA`) akışı, kayıt/ajanda/kredi hareketi kayıtlarını elle oluşturmayı bıraktı; artık `AppContext` içindeki `patlatmaPlanla` fonksiyonunu çağırıyor — `src/components/tasocagi/PatlatmaPlanFormu.tsx` ile aynı sözleşme. Bu akışın çalışabilmesi için `IslemFormu` tipine ve E bendi ekranına (bkz. `BentAlanlari.tsx`) zorunlu "Bilgi kaynağı" seçici alanı eklendi (`PatlatmaPlanFormu`'nda zaten vardı).
- Gerekçe: İki ayrı giriş noktası (YeniIslem ve PatlatmaPlanFormu) aynı iş kuralını bağımsız olarak uyguluyordu; YeniIslem yolunda bilgi kaynağı hiç toplanmıyordu, kredi yetersiz uyarısı gösterilmiyordu ve audit metinleri farklıydı. Bu, gelecekte `patlatmaPlanla` içinde yapılacak bir kural değişikliğinin YeniIslem yoluna yansımaması riskini taşıyordu.
- Etki: `src/pages/YeniIslem.tsx`, `src/components/islem/BentAlanlari.tsx`, `docs/modules/E_BENDI_TAS_OCAGI.md`. `src/components/tasocagi/PatlatmaPlanFormu.tsx` ve `src/pages/PatlatmaTakvimi.tsx` zaten merkezi yolu kullandığı için değişmedi.
- Koruma: A/B/C/Ç/D/F bentleri ve E bendinin kredi yükleme/gerçekleşme akışları değiştirilmedi. Kullanıcı onayıyla YeniIslem ekranına yeni zorunlu "Bilgi kaynağı" alanı eklendi (UI değişikliği).
- İlgili iş kuralı: Patlatma bilgisi sözlü/telefon/yazılı/personel/diğer kaynaklardan gelebilir ve kaynak kaydedilir (BUSINESS_RULES.md / E_BENDI_TAS_OCAGI.md).
- İlgili görev: —

### DEC-20260904-002 — mp_screen URL parametresiyle şifresiz oturum açma kapatıldı
- Tarih: 2026-09-04
- Modül: Kimlik doğrulama / Giriş
- Durum: Uygulandı
- Karar: `App.tsx` içinde `?mp_screen=...` URL parametresinden gerçek kullanıcıya (ör. admin) `giris()` ve şifre kontrolü olmadan doğrudan oturum açan kod tamamen kaldırıldı. `useScreenInit.js` yalnızca `import.meta.env.DEV` iken çalışacak şekilde ek olarak kilitlendi. `canvas.manifest.js` içindeki her ekrana gömülü `state: { kullaniciAdi: ... }` kullanıcı bootstrap verileri kaldırıldı.
- Gerekçe: Bu link herhangi bir ziyaretçinin şifre girmeden admin dahil herhangi bir seeded kullanıcı olarak oturum açmasına izin veriyordu (kimlik doğrulama atlatma).
- Etki: `src/App.tsx`, `src/useScreenInit.js`, `src/canvas.manifest.js`.
- Koruma: Kullanıcının açık talimatıyla `src/pages/Giris.tsx` içindeki demo kullanıcı adı/şifre listesi bu aşamada KALDIRILMADI; proje son aşamaya gelene kadar bilinçli olarak tutulacak.
- İlgili iş kuralı: Kullanıcı adı/şifre ile giriş modeli (PROJECT_MEMORY.md).
- İlgili görev: —

### DEC-20260904-001 — AppContext ile mutasyonlar arasına repository/adaptör katmanı eklendi
- Tarih: 2026-09-04
- Modül: Mimari / Tüm bentler (ortak veri katmanı)
- Durum: Uygulandı
- Karar: `src/services/repository/` altında `KtpgvRepository` arayüzü ve bunu karşılayan `MockKtpgvRepository` sınıfı oluşturuldu. Kimlik doğrulama (`girisYap`), yetki denetimi (makbuz üretme/ödeme doğrulama/kayıt değiştirme kontrolleri), kayıt/audit yazımı ve `sonrakiKayitNo`/`sonrakiMakbuzNo` numaralandırma üretimi bu katmana taşındı. `src/data/*` artık yalnızca repository'nin başlangıç (seed) verisi olarak kullanılıyor; çalışma zamanı gerçek durumu repository içinde tutuluyor. `AppContext.tsx` artık mutasyon mantığını kendi içinde uygulamıyor; repository'yi çağırıp sonuç durumunu React state'ine "ayna" (mirror) olarak yansıtıyor.
- Gerekçe: Kod incelemesinde auth/yetki/audit/numaralandırma mantığının tarayıcı belleğindeki dizilerde uygulanmasının, dokümante edilen çok-kullanıcılı merkezi mimariyi (bkz. `ARCHITECTURE.md`, `DATABASE_GUIDE.md`) engellediği belirtildi.
- Etki: `src/contexts/AppContext.tsx`, yeni `src/services/repository/{types,mockRepository,index}.ts`. Sayfa/komponent dosyalarında (`src/pages/*`, `src/components/*`) herhangi bir değişiklik yapılmadı; `useApp()` üzerinden dışa açılan fonksiyon imzaları (senkron) korunmuştur.
- Koruma: Mevcut iş kuralları (önce ödeme sonra işlem, kısmi kredi/bağış makbuzu ayrımı, yetki filtreleri) davranışsal olarak değiştirilmedi; yalnızca uygulandığı kod konumu taşındı. Repository şu an bellek içi/senkron demo uygulamasıdır; gerçek Supabase entegrasyonu ayrı ve kontrollü bir görevde ele alınmalıdır (`AppContext` çağrılarının o aşamada asenkrona çevrilmesi gerekebilir).
- İlgili iş kuralı: —
- İlgili görev: —

### DEC-20260829-003 — Taş ocağı kredi kullanılabilirliği yalnız doğrulanan dekonttan üretilir
- Tarih: 2026-08-29
- Modül: E Bendi / Kredi Yükleme / Ödeme Doğrulama
- Durum: Uygulandı
- Karar: EKRD kredi talebinde yalnız `dogrulamaDurumu = DOGRULANDI` olan banka dekontları kredi kullanılabilirlik hesabına dahil edilir. Her yeni doğrulanan dekont kümülatif tam kredi sayısındaki artış kadar `YUKLEME` hareketi üretir; aynı kredi ikinci kez yazılmaz. Bağış makbuzları doğrulanan dekont dağılımlarına bağlı olarak üretilir ve ilk patlatma bağışı makbuzu legacy `makbuzNo` aliası olarak korunur.
- Gerekçe: Çoklu dekontlu kısmi ödeme senaryosunda kredi kullanılabilirliği, bağış makbuzu üretimi ve geriye uyumun aynı anda tutarlı çalışması gerekir.
- Etki: `src/utils/krediYukleme.ts`, `src/contexts/AppContext.tsx`, Ödeme / Makbuz, Kayıt Detayı, Kredi Hareketleri ve raporlama ekranları.
- Koruma: Banka dekontu ile bağış makbuzu karıştırılmaz; eksik/fazla ödeme ilk kayıt için engel değildir; diğer bentlerde exact tutar davranışı korunur; OCR çalışma alanı yeniden tasarlanmaz.
- İlgili iş kuralı: BR-023, BR-024, BR-025, BR-027, BR-028
- İlgili görev: `tasks/in-progress/tas-ocagi-kredi-yukleme-yenileme/checklist.md`

### DEC-20260829-002 — Taş ocağı kısmi ve fazla ödeme dağılımı
- Tarih: 2026-08-29
- Modül: E Bendi / Kredi Yükleme / Ödeme ve Bağış Makbuzu
- Durum: Kalıcı kurala taşındı
- Karar: Kredi talebi birden fazla banka dekontuyla ödenebilir. Kümülatif ödemenin karşıladığı tam krediler kullanılabilir olur; tam krediye yetmeyen bakiye sonraki dekontu bekler. Hedefi aşan ödeme ek kredi üretmez ve genel Vakıf bağışı olarak kaydedilir. Krediye ayrılan tutar ile fazla bağış tutarı için ayrı bağış makbuzları düzenlenir.
- Gerekçe: KTPGV bir vakıftır; Vakfa gelen her ödeme için bağış makbuzu kesilir. Muhasebe görüşü kısmi ödeme, fazla ödeme ve raporlama ayrımını netleştirmiştir.
- Etki: E bendi kredi yükleme veri modeli, çoklu dekont, kredi kullanılabilirlik hesabı, makbuz dağılımı ve yıl sonu Excel raporu.
- Koruma: Banka dekontu ile bağış makbuzu karıştırılmaz; kullanılabilir kredi talep edilen kredi adedini aşmaz; fazla ödeme otomatik krediye dönüşmez.
- İlgili iş kuralı: BR-023, BR-024, BR-025, BR-026, BR-027, BR-028
- İlgili görev: Henüz uygulama planı oluşturulmadı

### DEC-20260829-001 — Taş ocağı dekont OCR yenilemesi ayrı kapsamda yürütülecek
- Tarih: 2026-08-29
- Modül: E Bendi / Kredi Yükleme / Dekont OCR
- Durum: Onay bekliyor
- Karar: Hazırlanan yenileme planı yalnız kredi yükleme içindeki dekont görüntüleme, OCR, alan işaretleme ve kullanıcı düzeltme alt modülünü kapsayacak.
- Gerekçe: Kredi yükleme bölümünün genel çalışma biçimine ilişkin değişiklikler kullanıcı tarafından daha sonra ayrıca bildirilecek.
- Etki: `tasks/backlog/tas-ocagi-dekont-inceleme-yenileme/plan.md` kapsam sınırı.
- Koruma: İşletmeci seçimi, kredi adedi, hesaplama, kayıt ve kredi hareketi işleyişi bu plan kapsamında değiştirilmez.
- İlgili iş kuralı: BR-001, BR-012, BR-013, BR-015, BR-022
- İlgili görev: `tasks/backlog/tas-ocagi-dekont-inceleme-yenileme/plan.md`

### DEC-20260825-001 — AI proje hafızası ve karar günlüğü oluşturuldu
- Tarih: 2026-08-25
- Modül: Proje geneli
- Durum: Uygulandı
- Karar: KTPGV geliştirmelerinde AI ajanlarının geçmiş kararları kaybetmemesi için kalıcı proje hafızası, iş kuralları ve kronolojik karar günlüğü repo içinde tutulacak.
- Gerekçe: VS Code Copilot/Agent ve diğer AI araçlarının proje bağlamını daha tutarlı kullanmasını sağlamak.
- Etki: Repo dokümantasyonu ve bundan sonraki tüm geliştirme görevleri.
- Koruma: Uygulama kodunun mevcut işleyişi bu dokümantasyon kurulumu sırasında değiştirilmez.

### DEC-20260825-002 — Copilot özelleştirme dosyaları standart konumlarında tutulacak
- Tarih: 2026-08-25
- Modül: Proje geneli / AI geliştirme altyapısı
- Durum: Uygulandı
- Karar: Repo genel Copilot talimatları `.github/copilot-instructions.md`; ajan kılavuzu kökte `AGENTS.md`; klasör/dosya özel talimatlar `.github/instructions/`; tekrar kullanılabilir görev promptları `.github/prompts/` altında tutulacak.
- Gerekçe: VS Code ve GitHub Copilot'un güncel repository custom instructions ve prompt-file yapısından doğrudan yararlanmak.
- Etki: Copilot Chat, Agent Mode ve tekrar kullanılan geliştirme görevleri.
- Koruma: Bu dosyalar mevcut kaynak kodunu değiştirmez; yalnızca AI geliştirme davranışını yönlendirir.
