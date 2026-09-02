# KTPGV — Kıbrıs Türk Polis Güçlendirme Vakfı Yönetim Sistemi

Bu proje, Kıbrıs Türk Polis Güçlendirme Vakfı'nın gelir kalemlerini (A-F bentleri), ödeme/dekont/makbuz süreçlerini, taş ocağı patlatma kredilerini, yetki/birim yönetimini ve raporlamayı tek bir web uygulamasında yönetmek için geliştirilmektedir.

Kod tabanı [Magic Patterns](https://magicpatterns.com) ile üretilen bir React/Vite prototipinden ([Source Design](https://www.magicpatterns.com/c/clmv7vsnemufvpysptwutz)) başlamış, ardından iş kuralları netleştirilerek kademeli olarak geliştirilmektedir.

## Başlarken

1. `npm install`
2. `npm run dev`

Doğrulama komutları:
- `npm run test:parser` — dekont OCR/parser regresyonu
- `npm run test:kredi-yukleme` — taş ocağı kredi yükleme mali akış regresyonu
- `npm run build`, `npm run lint`

## Modül geliştirme aşamaları

Proje AI destekli, minimal-touch bir yaklaşımla geliştirilir: mevcut çalışan davranış korunur, yalnız üzerinde açıkça çalışılan modül değiştirilir. Her modülün geldiği aşama üç kategoriden biriyle özetlenir:

| Aşama | Anlamı |
|---|---|
| 🛠️ Düzeltildi | Modülün iş kuralları ve/veya arayüzü kullanıcı talebiyle kökten yeniden ele alındı; kod ve davranış fiilen değişti. |
| ♻️ Güncellendi | Mevcut modül geriye uyumlu şekilde genişletildi; temel davranış korunarak yeni yetenek eklendi. |
| 📚 Zenginleştirildi | Modülün çalışan kodu değişmedi; AI hafızası, iş kuralı belgesi ve modül dokümantasyonu eklenerek anlaşılırlığı artırıldı. |
| ⏳ Temel (bekliyor) | Prototipten gelen temel davranış korunuyor; ayrıntılı iş kuralı doğrulaması ve üretim entegrasyonu henüz yapılmadı (bkz. `ROADMAP.md` Faz 2-4). |

| Modül | Aşama | Özet |
|---|---|---|
| [E Bendi — Taş Ocağı / Patlatma Kredisi](docs/modules/E_BENDI_TAS_OCAGI.md) | 🛠️ Düzeltildi | Kredi yükleme mali akışı kökten yenilendi: çoklu banka dekontu, kısmi/fazla ödeme dağılımı, birden fazla bağış makbuzu türü. Dekont OCR/inceleme ekranı tam ekran çalışma alanına dönüştürüldü: konumlu OCR adayları, belge üzerinde alan işaretleme, zoom/pan/döndürme, alan bazlı düzeltme ve doğrulama. |
| [Ödeme / Dekont / Makbuz](docs/modules/ODEME_DEKONT_MAKBUZ.md) | ♻️ Güncellendi | Çoklu dekont, dekont doğrulama durumu, "Taş Ocağı Patlatması Bağışı" ve "Genel Vakıf Bağışı" makbuz türleri geriye uyumlu olarak eklendi; diğer bentlerin exact tutar davranışı korundu. |
| [Raporlama / Mali Yıl Arşivi / Audit](docs/modules/RAPOR_ARSIV_AUDIT.md) | ♻️ Güncellendi | Kredi raporunda patlatma bağışı ile genel Vakıf bağışı ayrımı ve yetkiye göre işletmeci gizliliği eklendi. |
| [A Bendi](docs/modules/A_BENDI.md) · [B Bendi](docs/modules/B_BENDI.md) · [C Bendi](docs/modules/C_BENDI.md) · [Ç Bendi](docs/modules/C_CEDILLA_BENDI.md) · [D Bendi](docs/modules/D_BENDI.md) · [F Bendi](docs/modules/F_BENDI.md) | 📚 Zenginleştirildi | Kod davranışı değişmedi; modül dokümanı, iş kuralları ve AI hafızası eklendi. Kod/iş kuralı birebir doğrulaması Faz 2 kapsamında planlı. |
| [Yetki / Kullanıcı / Birim](docs/modules/YETKI_KULLANICI_BIRIM.md) | 📚 Zenginleştirildi | Rol/birim modeli dokümante edildi; backend seviyesinde yetki doğrulaması Faz 2-3 kapsamında planlı. |
| [Sigorta Şirketi Kartları](docs/modules/SIGORTA_SIRKETLERI.md) · [Ajanda ve Patlatma Takvimi](docs/modules/AJANDA_PATLATMA_TAKVIMI.md) | 📚 Zenginleştirildi | Mevcut davranış dokümante edildi; işlevsel değişiklik yapılmadı. |

Ayrıntılı ilerleme fazları için [ROADMAP.md](ROADMAP.md), teknik değişiklik geçmişi için [CHANGELOG.md](CHANGELOG.md), aktif/geçmiş kararlar için [docs/ai/DECISION_LOG.md](docs/ai/DECISION_LOG.md) dosyalarına bakınız.

## Dokümantasyon haritası

- [docs/ai/AI_INDEX.md](docs/ai/AI_INDEX.md) — proje geneli AI/geliştirme içindekiler sayfası
- [docs/ai/PROJECT_MEMORY.md](docs/ai/PROJECT_MEMORY.md) — kalıcı proje hafızası
- [docs/ai/BUSINESS_RULES.md](docs/ai/BUSINESS_RULES.md) — numaralandırılmış iş kuralları
- [docs/modules/](docs/modules/) — her modülün kodla eşleştirilmiş davranış belgesi
- [tasks/](tasks/) — görev yaşam döngüsü (backlog → in-progress → review → completed)
