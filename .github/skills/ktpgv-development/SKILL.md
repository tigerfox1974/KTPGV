---
name: ktpgv-development
description: KTPGV projesinde özellik geliştirme, hata düzeltme, modül analizi veya mevcut iş akışını değiştirme görevlerinde kullan. Proje hafızasını, karar günlüğünü, ilgili modül belgesini ve mevcut kodu birlikte okuyarak minimal-touch yaklaşımıyla güvenli değişiklik yapılmasını sağlar.
argument-hint: "[yapılacak görev]"
---

# KTPGV Development Skill

## Ne zaman kullanılır
KTPGV içinde yeni özellik, düzeltme, ekran değişikliği, iş kuralı uygulaması, yetki, ödeme/dekont/makbuz, bent veya raporlama görevi geldiğinde bu akışı uygula.

## Süreç
1. `AGENTS.md` ve `.github/copilot-instructions.md` kurallarını uygula.
2. `docs/ai/AI_INDEX.md` üzerinden doğru bilgi kaynağını bul.
3. `docs/ai/PROJECT_MEMORY.md`, `docs/ai/BUSINESS_RULES.md` ve son ilgili `docs/ai/DECISION_LOG.md` kayıtlarını oku.
4. Görevle ilgili `docs/modules/*.md` belgesini oku.
5. Semantik arama, text/grep, usages ve file search ile gerçek kod akışını bul; dosya adından varsayım yapma.
6. Mevcut çalışan çözümü yeniden kullan; en küçük güvenli değişikliği yap.
7. İlgisiz modüllere dokunma.
8. Para birimi, BAÜ, yetki ve ödeme sırası gibi kalıcı iş kurallarını ihlal etme.
9. Build/lint ve varsa modüle özel regresyon kontrolünü çalıştır.
10. Yeni karar oluştuysa Decision Log'u; kalıcı kural değiştiyse Project Memory/Business Rules'u; modül davranışı değiştiyse ilgili modül belgesini güncelle.

## Özel koruma
- Kullanıcı açıkça istemedikçe çalışan kodu yeniden mimarileştirme.
- UI düzeltmesi yaparken veri modelini gereksiz değiştirme.
- Backend/veritabanı yoksa varmış gibi davranma; üretim gereksinimini ayrı belirt.
- OCR sonucunu ödeme doğrulamasının tek kaynağı kabul etme.
- Route/menü görünürlüğünü backend güvenliği sanma.
