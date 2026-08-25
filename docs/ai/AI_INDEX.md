# KTPGV — AI Index

Bu dosya yapay zekâ için projenin ana içindekiler sayfasıdır.

## Her zaman geçerli
- `/.github/copilot-instructions.md` — Copilot repo anayasası
- `/AGENTS.md` — çoklu ajan çalışma kılavuzu

## AI hafıza ve kurallar
- `/docs/ai/PROJECT_MEMORY.md` — kalıcı proje hafızası
- `/docs/ai/BUSINESS_RULES.md` — iş kuralları
- `/docs/ai/DECISION_LOG.md` — tarihli/anlık karar günlüğü
- `/docs/ai/ARCHITECTURE.md` — mimari rehber
- `/docs/ai/DATABASE_GUIDE.md` — veri/üretim rehberi
- `/docs/ai/UI_STANDARDS.md` — UI standartları
- `/docs/ai/CODING_STANDARDS.md` — kod standartları
- `/docs/ai/KNOWN_ISSUES.md` — doğrulanmış risk/teknik borçlar
- `/docs/ai/COPILOT_WORKFLOW.md` — VS Code Copilot kullanım ve indeks rehberi

## Gerçek kodla eşleştirilmiş modüller
- `/docs/modules/A_BENDI.md`
- `/docs/modules/B_BENDI.md`
- `/docs/modules/C_BENDI.md`
- `/docs/modules/C_CEDILLA_BENDI.md`
- `/docs/modules/D_BENDI.md`
- `/docs/modules/E_BENDI_TAS_OCAGI.md`
- `/docs/modules/F_BENDI.md`
- `/docs/modules/ODEME_DEKONT_MAKBUZ.md`
- `/docs/modules/SIGORTA_SIRKETLERI.md`
- `/docs/modules/AJANDA_PATLATMA_TAKVIMI.md`
- `/docs/modules/YETKI_KULLANICI_BIRIM.md`
- `/docs/modules/RAPOR_ARSIV_AUDIT.md`
- `/docs/modules/ROUTES_SOURCE_MAP.md`

## Copilot özelleştirme katmanları
- Repo talimatı: `/.github/copilot-instructions.md`
- Dosya özel talimatlar: `/.github/instructions/*.instructions.md`
- Custom agent: `/.github/agents/ktpgv-developer.agent.md`
- Agent Skill: `/.github/skills/ktpgv-development/SKILL.md`
- Prompt: `/.github/prompts/ktpgv-task.prompt.md`

## Görev yaşam döngüsü
- Şablon: `/tasks/TASK_TEMPLATE.md`
- `/tasks/backlog/`
- `/tasks/in-progress/`
- `/tasks/review/`
- `/tasks/completed/`

## Proje yönetimi
- `/ROADMAP.md`
- `/CHANGELOG.md`

## AI okuma sırası
1. Always-on talimatları uygula.
2. Bu indeks üzerinden ilgili modülü bul.
3. Project Memory + Business Rules + son ilgili Decision Log'u oku.
4. İlgili module doc'u oku.
5. Semantic/text/grep/usages araçlarıyla gerçek kodu doğrula.
6. En küçük güvenli değişikliği yap.
7. Yeni karar veya davranış varsa dokümantasyonu güncelle.

## Bilgi önceliği
Çelişki varsa:
1. Kullanıcının en yeni açık kararı
2. Decision Log'daki en yeni ilgili karar
3. Business Rules
4. Project Memory
5. Modül dokümanı
6. Eski görev/teknik not
