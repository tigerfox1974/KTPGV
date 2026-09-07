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

## BR-023 — Vakfa gelen her ödeme için bağış makbuzu
KTPGV bir vakıftır. Vakfa hangi amaçla ödeme yapılırsa yapılsın alınan tutar için bağış makbuzu düzenlenir. Banka dekontu ödemenin banka kanıtıdır; bağış makbuzu Vakfın ürettiği mali belgedir ve biri diğerinin yerine geçmez.

## BR-024 — Taş ocağı kredi talebinde çoklu dekont
Taş ocağı patlatma kredi talebinin hedef tutarı, talep edilen kredi adedi ile güncel bir kredi bedelinin çarpımıdır. Firma hedef tutara ulaşıncaya kadar bir veya birden fazla banka dekontu sunabilir. Eksik ödeme için kuruş, oran veya başka bir tolerans sınırı uygulanmaz; her dekont ayrı kaydedilir ve aynı kredi talebiyle ilişkilendirilir.

## BR-025 — Kısmi ödeme tam kredi kadar kullanılabilirlik üretir
Kısmi ödemede bütün kredi talebi bloke edilmez. Yalnız `dogrulamaDurumu = DOGRULANDI` olan dekontların kredi talebine ayrılan kümülatif ödeme toplamının tam kredi bedeline karşılık gelen kısmı kadar kredi firmaya kullanılabilir olarak eklenir. Bir tam krediye yetmeyen bakiye aynı talepte bekletilir ve sonraki doğrulanan dekontlarla birleştirilir. Kullanılabilir kredi adedi `floor(krediye ayrılan toplam ödeme / bir kredi bedeli)` hesabıyla belirlenir ve talep edilen kredi adedini aşamaz.

## BR-026 — Fazla ödeme genel Vakıf bağışıdır
Taş ocağı kredi talebinin henüz karşılanmamış hedef tutarını aşan ödeme ek patlatma kredisi üretmez. Aşan bölüm ilgili firma veya işletmeci tarafından yapılmış genel Vakıf bağışı olarak kaydedilir.

## BR-027 — Tek dekontta iki bağış amacı ve iki makbuz
Bir banka dekontunun bir bölümü taş ocağı kredi talebini karşılarken kalan bölümü hedef tutarı aşıyorsa dekont iki muhasebe amacına dağıtılır. Kredi talebine ayrılan tutar için “Taş Ocağı Patlatması Bağışı”, fazla tutar için “Genel Vakıf Bağışı” türünde ayrı, benzersiz bağış makbuzları düzenlenir. Kısmi ödemede kredi talebine ayrılan dekont tutarı için de Taş Ocağı Patlatması Bağışı makbuzu düzenlenir.

## BR-028 — Taş ocağı ödeme dağılımı ve yıl sonu raporu
Taş ocağı ödeme kaydı; bağlı banka dekontlarını, bağış makbuzlarını, krediye ayrılan tutarı, bekleyen bakiyeyi ve genel bağışa ayrılan fazla tutarı birlikte göstermelidir. Yıl sonu Excel çıktısında taş ocağı patlatması için alınan bağışlar ile firma bazındaki genel Vakıf bağışları ayrı raporlanmalıdır.

## BR-029 — Makbuz kayıt anında üretilir
Ödeme doğuran tüm bent kayıtlarında makbuz üretimi kayıt işleminin ayrılmaz parçasıdır. Kayıt başarıyla oluştuğunda makbuz numarası da aynı işlemde üretilmiş olmalıdır; makbuz üretimi sonradan zorunlu bir adım olarak ertelenmez.

## İş kuralı ekleme yöntemi
Yeni iş kuralı doğarsa:
1. Önce `DECISION_LOG.md` içine karar olarak kaydedilir.
2. Kullanıcı tarafından kalıcı olduğu netleştiğinde bu dosyaya yeni `BR-xxx` numarasıyla eklenir.
3. Gerekirse ilgili modül dokümanı ve `PROJECT_MEMORY.md` güncellenir.
