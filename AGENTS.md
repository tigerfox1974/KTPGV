# KTPGV — AI Agent Operating Guide

Bu dosya KTPGV reposunda çalışan yapay zekâ ajanlarının ana çalışma kılavuzudur.

## Amaç
Projeyi kendi kendini açıklayabilen, geçmiş kararlarını kaybetmeyen ve farklı AI ajanlarının aynı iş kurallarına göre güvenli biçimde geliştirebildiği bir yapıda tutmak.

## Her görevde izlenecek sıra
1. `.github/copilot-instructions.md`
2. `docs/ai/AI_INDEX.md`
3. `docs/ai/PROJECT_MEMORY.md`
4. `docs/ai/BUSINESS_RULES.md`
5. Görevle ilgili modül dokümanı
6. `docs/ai/DECISION_LOG.md` içindeki ilgili en yeni kararlar
7. Aktif görev dosyası varsa onu oku
8. İlgili kaynak kodu incele
9. En küçük güvenli değişikliği uygula
10. Dokümantasyonu güncelle

## Çalışma yöntemi
- Önce oku, sonra değiştir.
- Tahmin ederek iş kuralı üretme.
- Mevcut çalışan yapıyı koru.
- İlgisiz dosyalara dokunma.
- Büyük yeniden yazım yerine minimal-touch yaklaşımı kullan.
- Aynı işlevi ikinci kez üretme.
- UI değişikliklerinde mevcut tasarım sistemi ve ekran simetrisini koru.
- Veri modeli değişikliklerinde geriye dönük uyumu gözet.

## Kararların kaydı
Geliştirme sırasında alınan yeni kararlar kaybolmamalıdır.

- Anlık/proje içi karar → `docs/ai/DECISION_LOG.md`
- Kalıcı iş kuralına dönüşen karar → `docs/ai/PROJECT_MEMORY.md`
- İş kuralı niteliğindeki karar → `docs/ai/BUSINESS_RULES.md`
- Yapılan teknik değişiklik → `CHANGELOG.md`

## Görev yaşam döngüsü
Görev dosyaları şu klasörlerde tutulur:
- `tasks/backlog/` — henüz başlanmamış
- `tasks/in-progress/` — aktif geliştirme
- `tasks/review/` — tamamlandı, kontrol bekliyor
- `tasks/completed/` — onaylandı ve kapandı

## KTPGV kritik korumaları
- “Önce ödeme, sonra işlem” ana kuralını bozma.
- Dekont doğrulamasını makbuzla karıştırma.
- Para biriminde `TL` kullan; `₺` kullanma.
- Bent adlandırmalarını kullanıcı kararı olmadan değiştirme.
- Rol/birim yetkilerini gevşetme.
- Kayıt ve makbuz numaralarının benzersizlik mantığını bozma.
- Kullanıcı açıkça istemedikçe çalışan modülleri yeniden tasarlama.

## Ajanın görevi bittiğinde
Ajan şu dört soruya cevap verebilmelidir:
1. Ne değişti?
2. Hangi dosyalar değişti?
3. Hangi iş kuralına dayanarak değişti?
4. Yeni bir karar ortaya çıktıysa nerede kaydedildi?
