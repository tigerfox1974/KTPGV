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
