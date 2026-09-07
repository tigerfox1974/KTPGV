# E Bendi — Taş Ocağı / Patlatma Kredisi

## Gerçek kod modeli
`src/types/index.ts` E bendini üç işlem türüne ayırır:
- `KREDI_YUKLEME` — EKRD; ödeme/dekont kaydı ve anlık makbuz üretimi, kredi yükleme
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
- Patlatma planlama (EKPL) ve patlatma sonucu işleme (EKGR) tek giriş noktasından yürür: Patlatma Takvimi ekranı (`src/pages/PatlatmaTakvimi.tsx` üzerinden `PatlatmaPlanFormu`, `PatlatmaYapildiModali`, `PatlatmaSonucModali`). `AppContext` içindeki `patlatmaPlanla` / `patlatmaGerceklesmeIsle` / `patlatmaSonucIsle` fonksiyonları kayıt/ajanda/kredi hareketi ve numaralandırmayı üretir; ekranlar yalnız girdi toplar ve dönen sonucu (başarı/uyarı/audit/kayıt no) gösterir. Yeni İşlem ekranı E bendinde yalnız kredi yükleme (EKRD) kaydı açar; planlama/sonuç girişleri oradan kaldırıldı (bkz. DEC-20260906-002).

## Kredi talebi ve ödeme dağılımı

- Kredi talebinin hedef tutarı `talep edilen kredi adedi x güncel bir kredi bedeli` hesabıdır.
- Firma hedef tutarı tek banka dekontuyla veya birden fazla banka dekontuyla ödeyebilir.
- Eksik ödeme için tolerans veya alt/üst fark sınırı uygulanmaz.
- Aynı talebe bağlı dekontların krediye ayrılan tutarları kümülatif değerlendirilir.
- Kredi kullanılabilirliği hesabına yalnız `dogrulamaDurumu = DOGRULANDI` olan dekontlar girer.
- Kullanılabilir kredi adedi, krediye ayrılan toplam ödemenin karşıladığı tam kredi adedidir.
- Bir tam krediye yetmeyen bakiye kaybolmaz; talepte bekler ve sonraki dekontla birleşir.
- Kullanılabilir kredi hiçbir durumda talep edilen kredi adedini aşmaz.
- Hedef tutarı aşan bölüm ek kredi üretmez ve firma/işletmeci tarafından yapılmış genel Vakıf bağışı olarak kaydedilir.
- Her yeni doğrulanan dekont yalnız kümülatif tam kredi sayısındaki artış kadar `YUKLEME` hareketi üretir; aynı kredi ikinci kez yazılmaz.

Örnek: Bir kredi 7.000 TL, talep 5 kredi ve hedef 35.000 TL ise ilk 15.500 TL dekont 2 kullanılabilir kredi ve 1.500 TL bekleyen bakiye oluşturur. Sonraki 20.000 TL dekontun 19.500 TL bölümü hedefi tamamlar, 500 TL bölümü genel Vakıf bağışı olur ve toplam 5 kredi kullanılabilir hale gelir.

## Bağış makbuzları

- Vakfa gelen her ödeme için bağış makbuzu düzenlenir.
- Banka dekontu ödeme kanıtıdır; bağış makbuzu Vakfın ürettiği mali belgedir.
- Ödeme/dekont kaydı tamamlandığı anda bağlı bağış makbuzu da aynı işlemde üretilir.
- Kredi talebine ayrılan ödeme için “Taş Ocağı Patlatması Bağışı” makbuzu düzenlenir.
- Hedefi aşan ödeme için ayrıca “Genel Vakıf Bağışı” makbuzu düzenlenir.
- Tek banka dekontu iki amaca dağıtılmışsa iki ayrı ve benzersiz bağış makbuzu üretilir.
- Dekont, tutar dağılımları ve bağlı makbuzlar aynı taş ocağı ödeme kaydında birlikte görülebilmelidir.
- İlk patlatma bağışı makbuzu geriye uyum için `makbuzNo` alanında alias olarak korunur; çoklu makbuzların tam listesi ayrıca tutulur.
- Yıl sonu Excel çıktısında taş ocağı patlatması bağışları ile firma bazındaki genel Vakıf bağışları ayrı toplamlar olarak gösterilmelidir.

## Gerçek ekran/bileşenler
- `src/pages/TasOcagiIsletmecileri.tsx`
- `src/pages/TasOcagiKartlari.tsx`
- `src/pages/KrediHareketleri.tsx`
- `src/pages/PatlatmaTakvimi.tsx`
- `src/components/kart/IsletmeciFormu.tsx`
- `src/components/kart/TasOcagiFormu.tsx`
- `src/components/tasocagi/*`
- `src/utils/patlatma.ts`
