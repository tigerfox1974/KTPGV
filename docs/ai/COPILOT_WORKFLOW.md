# KTPGV — VS Code Copilot Çalışma Rehberi

Bu belge güncel VS Code Copilot/Agents özelliklerinin KTPGV reposunda nasıl kullanılacağını anlatır.

## 1. Semantik proje indeksi
VS Code Copilot workspace'i otomatik indeksler. Bu indeks yalnız kelime aramak yerine kodun anlamına göre arama yapabilen semantic search (`#codebase`) için kullanılır.

### Kontrol
VS Code alt durum çubuğundaki Copilot simgesine tıkla ve workspace index durumunu kontrol et.

### Gerekirse yeniden oluşturma
`Ctrl+Shift+P` → `Build Codebase semantic index` komutunu çalıştır.

Normal Agent görevlerinde `#codebase` yazmak zorunlu değildir; Agent gerektiğinde semantic search, grep, text search, file search ve usages araçlarını kendi seçer. Özellikle zor bir kod aramasını zorlamak istersen `#codebase` eklenebilir.

## 2. Her sohbette otomatik okunan kurallar
- `.github/copilot-instructions.md`
- `AGENTS.md`

Bunlar proje genelindeki güvenlik, minimal-touch ve KTPGV iş kuralı yönlendirmesini sağlar.

## 3. Dosyaya göre otomatik talimat
`.github/instructions/*.instructions.md` dosyaları `applyTo` desenine göre yalnız ilgili dosyalarda devreye girer.

Mevcut:
- `frontend.instructions.md`
- `documentation.instructions.md`

## 4. Custom Agent
`.github/agents/ktpgv-developer.agent.md` KTPGV'ye özel ajan profilidir. VS Code Agent seçicisinden KTPGV geliştirici ajanı seçilebilir.

## 5. Agent Skill
`.github/skills/ktpgv-development/SKILL.md` göreve göre Copilot tarafından otomatik yüklenebilir ve `/ktpgv-development` şeklinde elle de çağrılabilir.

Skill; talimat dosyalarından farklı olarak yalnız ilgili görevde yüklenir. Bu yüzden proje hafızasını ve geliştirme prosedürünü bağlamı gereksiz şişirmeden taşımak için kullanılır.

## 6. Prompt dosyası
`.github/prompts/ktpgv-task.prompt.md` yerel VS Code Agent sohbetinde tekrar kullanılan görev şablonudur ve `/ktpgv-task` ile çağrılabilir.

Not: Agent Host üzerinde çalışan uzak/cloud ajanlarda prompt file yerine Agent Skill tercih edilmelidir. Bu nedenle KTPGV için ana tekrar-kullanılabilir workflow artık skill içinde de tanımlıdır.

## 7. Proje hafıza zinciri
Yeni görevde bilgi sırası:
1. Always-on instructions
2. AI Index
3. Project Memory + Business Rules
4. Son ilgili Decision Log
5. İlgili module doc
6. Gerçek kod semantik araması
7. Değişiklik
8. Belge/karar güncellemesi

## 8. Kullanıcı için en basit günlük kullanım
VS Code'da repo açıkken Copilot Agent'a normal Türkçe görevini yaz. Örnek:

`F Bendi Trafik ekranında şu değişikliği yap. Mevcut çalışan alanlara dokunma.`

Repo talimatları otomatik gelir. Büyük veya kritik görevde KTPGV custom agent'ını seçmek veya `/ktpgv-development` komutunu kullanmak ek güvence sağlar.
