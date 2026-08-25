# KTPGV — AI Index

Bu dosya yapay zekâ için projenin içindekiler sayfasıdır. Bir görevin hangi bilgi kaynağına bağlı olduğunu buradan bul.

## Çekirdek dosyalar
- Repo genel Copilot talimatı: `/.github/copilot-instructions.md`
- Ajan çalışma kılavuzu: `/AGENTS.md`
- Proje hafızası: `/docs/ai/PROJECT_MEMORY.md`
- İş kuralları: `/docs/ai/BUSINESS_RULES.md`
- Karar günlüğü: `/docs/ai/DECISION_LOG.md`
- Mimari rehber: `/docs/ai/ARCHITECTURE.md`
- Veri rehberi: `/docs/ai/DATABASE_GUIDE.md`
- UI rehberi: `/docs/ai/UI_STANDARDS.md`

## Modül dokümanları
Modül bazlı kalıcı bilgiler `/docs/modules/` altında tutulur.

Planlanan ana başlıklar:
- Bent A
- Bent B
- Bent C
- Bent Ç
- Bent D
- Bent E / Taş Ocakları
- Bent F / Adli ve Trafik
- Ödeme
- Dekont
- Makbuz
- Sigorta Şirketi Kartları
- Taş Ocağı / İşletmeci Kartları ve kredi sistemi
- Ajanda
- Kullanıcı / Rol / Birim Yetkilendirme
- Raporlama ve Arşiv

## Görevler
- `/tasks/backlog/`
- `/tasks/in-progress/`
- `/tasks/review/`
- `/tasks/completed/`

Her görev dosyası en az şunları içermelidir:
- Amaç
- Kapsam
- Korunacak mevcut davranışlar
- İlgili iş kuralları
- Etkilenen modüller
- Alınan yeni kararlar
- Durum

## Copilot özelleştirmeleri
- Repo genel talimat: `/.github/copilot-instructions.md`
- Dosya/klasör özel talimatlar: `/.github/instructions/*.instructions.md`
- Tekrar kullanılabilir görev promptları: `/.github/prompts/*.prompt.md`

## AI okuma kuralı
Kod yazmaya başlamadan önce yalnızca genel belgeleri okumak yetmez. Görev hangi modüle aitse ilgili modül dokümanı ve en yeni karar kayıtları da okunmalıdır.

## Bilgi önceliği
Çelişki varsa şu sıra uygulanır:
1. Kullanıcının en yeni açık kararı
2. `DECISION_LOG.md` içindeki en yeni ilgili karar
3. `BUSINESS_RULES.md`
4. `PROJECT_MEMORY.md`
5. Modül dokümanı
6. Eski görev/teknik notlar
