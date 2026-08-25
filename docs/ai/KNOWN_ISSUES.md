# KTPGV Known Issues & Technical Debt

## Etiketler
`OPEN`, `WATCH`, `RESOLVED`, `VERIFY`

### KI-001 — Kalıcı backend/veritabanı entegrasyonu
**Durum:** VERIFY
Mevcut repo React/Vite istemci ağırlıklıdır. Planlanan Supabase veri kalıcılığı, Storage, auth ve eşzamanlı benzersizlik garantileri modül bazında doğrulanmalıdır.

### KI-002 — Demo veri / gerçek veri ayrımı
**Durum:** WATCH
`src/data` altındaki statik verilerin üretim veri kaynağıyla ayrıştırılması gerekir.

### KI-003 — OCR güvenilirliği
**Durum:** WATCH
Dekont OCR yardımcı özellik olmalı; ödeme doğrulamasında tek başına nihai doğruluk kaynağı kabul edilmemelidir.

### KI-004 — Dokümantasyon senkronu
**Durum:** OPEN
Yeni geliştirmelerde ilgili modül belgesi ve karar/hafıza kayıtları güncellenmelidir.
