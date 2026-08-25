# E Bendi — Taş Ocağı / Patlatma Kredisi

## Gerçek kod modeli
`src/types/index.ts` E bendini üç işlem türüne ayırır:
- `KREDI_YUKLEME` — EKRD; ödeme/dekont/makbuz süreci, kredi yükleme
- `KREDI_PLANLAMA` — EKPL; patlatma planlanır, kredi henüz düşmez
- `KREDI_GERCEKLESME` — EKGR; gerçekleşme/sonuç kaydı, kredi düşer

Kredi hareketleri `YUKLEME`, `PLAN`, `KULLANIM` tipleriyle izlenir. İşletmeci ve taş ocağı ayrı kartlardır; taş ocağı `isletmeciId` ile sahibine bağlanır.

## Kalıcı iş kuralları
- 1 patlatma kredisi = BAÜ x %10.
- Ön ödeme tek veya çoklu patlatma kredisi yükleyebilir.
- Aynı işletmeciye bağlı birden fazla taş ocağı ortak kredi havuzunu kullanabilir.
- Planlama kredi tüketmez.
- Gerçekleşen patlatma kredi bakiyesinden 1 düşer.
- Patlatma bilgisi sözlü/telefon/yazılı/personel/diğer kaynaklardan gelebilir ve kaynak kaydedilir.
- Sonuç sade kullanıcı diliyle Yapıldı/Yapılmadı/Ertelendi/İptal olarak tutulur.

## Gerçek ekran/bileşenler
- `src/pages/TasOcagiIsletmecileri.tsx`
- `src/pages/TasOcagiKartlari.tsx`
- `src/pages/KrediHareketleri.tsx`
- `src/pages/PatlatmaTakvimi.tsx`
- `src/components/kart/IsletmeciFormu.tsx`
- `src/components/kart/TasOcagiFormu.tsx`
- `src/components/tasocagi/*`
- `src/utils/patlatma.ts`
