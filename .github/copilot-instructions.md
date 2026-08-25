# KTPGV — GitHub Copilot Repository Instructions

Bu dosya KTPGV projesinde GitHub Copilot Chat ve Agent için depo genelinde her zaman geçerli temel talimatları içerir.

## Önce oku
Bir göreve başlamadan önce sırasıyla:
1. `AGENTS.md`
2. `docs/ai/AI_INDEX.md`
3. `docs/ai/PROJECT_MEMORY.md`
4. `docs/ai/BUSINESS_RULES.md`
5. Görevle ilgili modül dokümanı ve varsa aktif görev kaydı

## Ana çalışma ilkeleri
- Çalışan mevcut yapıyı koru; kullanıcı açıkça istemedikçe yeniden yazma veya geniş refactor yapma.
- Sadece verilen görev kapsamındaki dosyalara dokun. İlgisiz çalışan alanları değiştirme.
- Önce mevcut kodu, bileşenleri, tipleri ve veri akışını incele; sonra değişiklik yap.
- Aynı işlev zaten varsa yeni kopya üretme; mevcut yapıyı yeniden kullan.
- Kullanıcı tarafından verilmiş iş kuralları teknik kolaylıktan üstündür.
- Çelişki olduğunda `PROJECT_MEMORY.md`, `BUSINESS_RULES.md` ve en yeni `DECISION_LOG.md` kaydı esas alınır.
- Para gösteriminde `TL` kullan; `₺` kullanma.
- Kayıt/ödeme/dekont/makbuz gibi kritik akışlarda doğrulama kurallarını gevşetme.
- Yetki ve rol kontrollerini atlama veya yalnızca arayüz seviyesinde bırakma.
- Kullanıcı açıkça istemedikçe mevcut isimleri, route'ları, veri alanlarını veya ekran hiyerarşisini değiştirme.

## Değişiklik öncesi
- İlgili dosyaları ve bağlantılı bileşenleri bul.
- Etkilenecek veri tiplerini ve state akışını kontrol et.
- Değişikliğin başka bent/modülleri etkileyip etkilemeyeceğini değerlendir.
- En küçük güvenli değişikliği tercih et.

## Değişiklik sonrası
- TypeScript/derleme/lint hatası bırakma.
- Yeni karar oluştuysa `docs/ai/DECISION_LOG.md` dosyasına ekle.
- Kalıcı iş kuralı değiştiyse `docs/ai/PROJECT_MEMORY.md` ve/veya `docs/ai/BUSINESS_RULES.md` güncelle.
- Yapılan işi ilgili görev kaydında ve gerekiyorsa `CHANGELOG.md` içinde belirt.

## Kapsam koruması
Kullanıcının “bunun dışında hiçbir şeyi değiştirme”, “minimal-touch”, “mevcut çalışan yapıyı koru” benzeri talimatları kesin kısıt olarak kabul edilir.
