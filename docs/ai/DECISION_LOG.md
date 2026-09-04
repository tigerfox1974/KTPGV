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
