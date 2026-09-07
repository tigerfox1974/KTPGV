# TASK-20260907-001 — Dekont Akışında Manuel Öncelik, OCR Yardımcı Mod

**Durum:** BACKLOG
**Modül:** E Bendi / Ödeme Dekont Makbuz / Dekont Kontrolü
**Oluşturma tarihi:** 2026-09-07

## Amaç

Dekont işleme sürecini manuel giriş öncelikli hale getirip OCR veya AI tabanlı okuma adımını zorunlu değil, isteğe bağlı yardımcı öneri moduna indirmek.

## Kullanıcının kararı / talebi

Kullanıcı kararı: Otomatik okuma (OCR veya AI API) hatalı sonuç üretebildiği için kayıt akışında varsayılan yöntem manuel giriş olmalı; otomatik okuma yalnız hızlandırıcı yardımcı araç olarak kullanılmalı.

## Kapsam

- Varsayılan akış manuel alan doldurma olacak.
- Dekont yükleme sonrası otomatik OCR zorunlu tetiklenmeyecek.
- İsteğe bağlı Belgeden doldur veya OCR önerisi al eylemi sunulacak.
- Tam ekran belge inceleme alanı zorunlu adım olmaktan çıkarılacak.
- Kayıt engelleri yalnız iş kuralı temelli kalacak: zorunlu alan, mükerrerlik, tarih ve tutar kuralları.
- OCR veya AI sonucu hiçbir zaman otomatik onay olmayacak; kullanıcı doğrulaması zorunlu kalacak.

## Kesinlikle korunacaklar

- Önce ödeme sonra işlem kuralı ve dekont doğrulama disiplini.
- Dekont ve makbuz ayrımı.
- E bendi kredi yükleme mali kuralları ve kredi hareket mantığı.
- E dışındaki bentlerin mevcut çalışan dekont akışları.
- Mevcut yetki, audit ve repository yazma sınırı.

## Önce okunacaklar

- AGENTS.md
- docs/ai/AI_INDEX.md
- docs/ai/PROJECT_MEMORY.md
- docs/ai/BUSINESS_RULES.md
- docs/modules/ODEME_DEKONT_MAKBUZ.md
- docs/modules/E_BENDI_TAS_OCAGI.md
- docs/ai/DECISION_LOG.md içindeki en güncel E bendi ve OCR kararları

## Etkilenecek kod alanları

- src/components/islem/DekontBolumu.tsx
- src/components/islem/dekont-inceleme/DekontIncelemeCalismaAlani.tsx
- src/components/islem/dekont-inceleme/AlanKontrolPaneli.tsx
- src/components/islem/dekont-inceleme/AlanDuzeltmeEditoru.tsx
- src/components/islem/dekont-inceleme/helpers.ts
- src/utils/dekontOcr.ts
- src/pages/YeniIslem.tsx

## Alınan yeni kararlar

- Otomatik okuma varsayılan kayıt yolu değildir; yardımcı öneri modudur.
- Nihai veri doğrulaması kullanıcı onayı ile tamamlanır.
- İleride AI model API entegrasyonu düşünülse bile aynı kullanıcı onayı modeli korunur.

## Sonuç

Bu görev uygulanmak üzere backloga alınmıştır. Bu kayıt yalnız plan ve kapsam kararını tutar; bu dosya oluşturulurken uygulama kodunda yeni davranış değişikliği yapılmamıştır.

## Dokümantasyon güncellemesi

- Karar günlüğüne backloga alma kararı eklenecek.
- Uygulama sırasında ilgili modül dokümanları ve CHANGELOG ayrıca güncellenecek.
