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
