# KTPGV — Business Rules

Bu dosya sistem davranışını belirleyen iş kurallarının ana kaynağıdır. Teknik kolaylık bu kuralların önüne geçemez.

## BR-001 — Önce ödeme, sonra işlem
Bir hizmet/işlem için gerekli ödeme Vakıf hesabına yapılmadan, dijital dekont kaydedilmeden ve gerekli kontrol tamamlanmadan işlem tamamlanamaz.

## BR-002 — Dekont ve makbuz farklı kayıt türleridir
Dekont ödeme kanıtıdır. Makbuz ise Vakıf/Yetkili birim tarafından yürütülen tahsilat/makbuz kayıt sürecidir. Biri diğerinin yerine geçmez.

## BR-003 — Ayrı global QR dekont menüsü yoktur
QR ile yükleme, ilgili işlem kaydının dekont bölümünde bulunur. Aynı bölüm doğrudan dosya yüklemeyi de destekler.

## BR-004 — Para birimi standardı
Tüm arayüz, belge ve hesap alanlarında `TL` kullanılır. `₺` sembolü kullanılmaz.

## BR-005 — BAÜ merkezi parametredir
BAÜ değeri yönetilebilir merkezi bir ayar olmalı ve BAÜ’ye bağlı tüm hesaplamalar aynı güncel kaynağı kullanmalıdır.

## BR-006 — Rol ve birim bazlı yetki
Kullanıcının rolü ve bağlı birimi; ekran, bent, kayıt ve makbuz yetkilerini belirler. Yetki yalnızca görsel gizleme ile uygulanmamalıdır.

## BR-007 — Bent–birim eşlemesi değişebilir
Bir bendin hangi birim/birimler tarafından yürütüleceği yapılandırılabilir olmalıdır. Gelecekte değişebileceği için sabit varsayım haline getirilmemelidir.

## BR-008 — Benzersiz numaralar
Kayıt numarası ve makbuz numarası çok kullanıcılı eşzamanlı kullanımda dahi benzersiz olmalıdır.

## BR-009 — Trafik raporu başvuru kaynağı
F Bendi Trafik iş akışında başvuru sahibi yalnızca sigorta şirketidir. Trafik kaydı bir Sigorta Şirketi Kartına bağlanır.

## BR-010 — Adli ve Trafik ayrı iş akışlarıdır
İkisi F Bendi altında bulunur ancak alanları, başvuru kaynakları ve süreçleri birbirine zorla birleştirilmez.

## BR-011 — Trafik toplu kayıt numaralandırması
Ana numara örneği: `TTRF-2026-000045`.
Alt kayıtlar: `TTRF-2026-000045-001`, `-002`, `-003` ... biçiminde oluşturulur.

## BR-012 — Taş ocağı kredi modeli
Önceden yapılan ödemeler patlatma hakkı/kredisi üretir. Gerçekleşen her patlatmada 1 kredi düşer.

## BR-013 — Ortak kredi havuzu
Aynı işletmeci/kişiye bağlı birden fazla taş ocağı, işletmeciye ait ortak uygun kredi havuzundan tüketim yapabilir.

## BR-014 — Dekont dosyaları
PDF, JPG ve PNG desteklenir. Hedef üst sınır 5 MB’tır. Uygun olduğunda büyük görseller görünür kaliteyi koruyarak optimize edilir.

## BR-015 — Dekont olmadan kayıt yok
Gerekli ödeme kanıtı olmadan ödeme gerektiren işlem kaydı tamamlanamaz.

## BR-016 — Yeni işlem başlangıç durumu
Yeni kayıt formunda bent varsayılan seçili gelmez.

## BR-017 — Form temizliği
Başarılı kayıt sonrasında yeni işlem formu temiz başlangıç durumuna döner.

## BR-018 — Tam sayı alanları
Personel ve görev süresi saat gibi tam sayı olması gereken alanlar kesirli değer kabul etmez.

## BR-019 — D Bendi çoklu görev dilimi
Tek yol kapama/güvenlik işleminde birden fazla polis sayısı + süre görev dilimi olabilir. Her dilimin polis-saat hesabı ayrı yapılır ve toplam hizmet hesabına dahil edilir.

## BR-020 — D Bendi giriş sınırları
Polis sayısı en fazla 999, görev süresi saat en fazla 99 olabilir.

## BR-021 — Terminoloji
Kullanıcının belirlediği “Bend” ifadesi korunur. Bent seçimlerinde kod ve açıklama birlikte gösterilir.

## BR-022 — Minimal-touch geliştirme
Kullanıcı belirli bir değişiklik istediğinde, zorunlu teknik bağlantılar dışında çalışan diğer yapı değiştirilmez.

## İş kuralı ekleme yöntemi
Yeni iş kuralı doğarsa:
1. Önce `DECISION_LOG.md` içine karar olarak kaydedilir.
2. Kullanıcı tarafından kalıcı olduğu netleştiğinde bu dosyaya yeni `BR-xxx` numarasıyla eklenir.
3. Gerekirse ilgili modül dokümanı ve `PROJECT_MEMORY.md` güncellenir.
