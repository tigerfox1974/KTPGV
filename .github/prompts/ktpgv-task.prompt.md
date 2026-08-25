---
description: KTPGV projesinde mevcut çalışan yapıyı koruyarak tek bir geliştirme görevini uygula.
agent: KTPGV Developer
---

# KTPGV Görev Uygulama Promptu

Aşağıdaki görevi KTPGV proje kurallarına göre uygula.

## Görev
${input:task:Ne yapılmasını istiyorsunuz?}

## Zorunlu çalışma şekli
- Önce repo talimatlarını, AI indeksini, proje hafızasını, iş kurallarını ve ilgili karar kayıtlarını oku.
- Görevle ilgili mevcut kaynak kodu ve kullanımları bulmadan kod yazma.
- Çalışan mevcut yapıyı koru.
- Sadece bu görev için gerekli minimum dosyalara müdahale et.
- Kullanıcının istemediği refactor, yeniden adlandırma veya tasarım değişikliği yapma.
- Mevcut bileşen/utility kullanılabiliyorsa yenisini kopyalama.
- İş sonunda gerekli teknik kontrolleri çalıştır.
- Yeni karar çıktıysa `docs/ai/DECISION_LOG.md` içine kaydet.
- Kalıcı iş kuralı değiştiyse ilgili kalıcı dokümanı güncelle.

## İş sonunda bildir
1. Ne yaptın?
2. Hangi dosyaları değiştirdin?
3. Hangi kontrolleri yaptın?
4. Yeni karar kaydı oluşturdun mu?
