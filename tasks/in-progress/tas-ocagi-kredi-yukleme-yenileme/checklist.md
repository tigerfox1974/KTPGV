# Taş Ocağı Kredi Yükleme Yenileme Ana Checklist

## Durum

- Başlangıç: 2026-08-29
- Yaşam döngüsü: In Progress
- Kullanıcı onayı: Alındı
- Uygulama sırası: Önce mali iş akışı, ardından OCR çalışma alanı
- Ayrıntılı OCR planı: [ocr-plan.md](./ocr-plan.md)

## Amaç

E bendi kredi yükleme alanını iki bağımsız fakat birbiriyle uyumlu iş paketi halinde yenilemek:

1. Çoklu banka dekontu, kısmi kredi kullanılabilirliği, bekleyen bakiye, fazla ödeme ve amaç bazlı bağış makbuzları
2. Belge merkezli OCR inceleme, alan işaretleme ve kolay kullanıcı düzeltmesi

## Değişmeyecek İş Kuralları

- 1 patlatma kredisi güncel BAÜ değerinin yüzde 10'udur.
- Kullanılabilir kredi talep edilen kredi adedini aşmaz.
- Fazla ödeme ek kredi üretmez.
- Banka dekontu ile bağış makbuzu farklı belgelerdir.
- Planlama kredi tüketmez; yalnız gerçekleşen patlatma kredi tüketir.
- Aynı işletmeciye bağlı taş ocakları ortak kredi havuzunu kullanır.
- Kullanıcı doğrulaması olmadan OCR sonucu mali onay sayılmaz.

## İlerleme Göstergesi

| Faz | İş Paketi | Durum |
|---|---|---|
| 0 | Plan, kapsam ve takip altyapısı | Devam ediyor |
| 1 | Mali veri modeli | Bekliyor |
| 2 | Kümülatif ödeme ve kredi motoru | Bekliyor |
| 3 | Çoklu dekont ve ödeme dağılımı arayüzü | Bekliyor |
| 4 | Bağış makbuzları ve yıl sonu raporu | Bekliyor |
| 5 | Mali akış regresyon doğrulaması | Bekliyor |
| 6 | Konumlu OCR ve aday modeli | Bekliyor |
| 7 | Tam ekran belge inceleme çalışma alanı | Bekliyor |
| 8 | Alan düzeltme ve sorun yönetimi | Bekliyor |
| 9 | Bütünleşik doğrulama ve dokümantasyon | Bekliyor |

## Faz 0 - Plan ve Takip

- [x] Kullanıcıdan mali iş kuralları alındı.
- [x] BR-023 ile BR-028 arasındaki kalıcı iş kuralları kaydedildi.
- [x] OCR yenileme planı oluşturuldu ve onaylandı.
- [x] Mali iş akışının OCR'dan önce uygulanacağı onaylandı.
- [x] Ana checklist ve bağımlı todo zinciri oluşturuldu.
- [ ] Etkilenen mevcut kod ve veri akışının tam etki analizi tamamlanacak.

## İş Paketi A - Mali İş Akışı

### Faz 1 - Mali Veri Modeli

- [ ] Bir kredi talebine birden fazla banka dekontu bağlanabilecek.
- [ ] Banka dekontu ile bağış makbuzu ayrı veri tipleri olarak temsil edilecek.
- [ ] Bir dekontun tutarı birden fazla muhasebe amacına dağıtılabilecek.
- [ ] “Taş Ocağı Patlatması Bağışı” makbuz türü tanımlanacak.
- [ ] “Genel Vakıf Bağışı” makbuz türü tanımlanacak.
- [ ] OCR ilk değeri ve kullanıcı tarafından doğrulanan değer için geriye uyumlu alanlar hazırlanacak.
- [ ] Eski demo kayıtlarının yeni modelle çalışması korunacak.

### Faz 2 - Kümülatif Ödeme ve Kredi Motoru

- [ ] Hedef tutar kredi adedi ile bir kredi bedelinden hesaplanacak.
- [ ] Krediye ayrılan kümülatif dekont tutarı hesaplanacak.
- [ ] Tam krediye dönüşen kullanılabilir kredi adedi hesaplanacak.
- [ ] Tam krediye yetmeyen bekleyen bakiye hesaplanacak.
- [ ] Kalan hedef tutar hesaplanacak.
- [ ] Talebi aşan genel bağış tutarı hesaplanacak.
- [ ] Yeni dekont önce kalan hedefe, artanı genel bağışa dağıtılacak.
- [ ] Kullanılabilir kredi talep edilen kredi adedini aşmayacak.
- [ ] Hesaplama saf fonksiyonlarla regresyon testine uygun tutulacak.

### Faz 3 - Çoklu Dekont Arayüzü

- [ ] Kredi talep özeti gösterilecek.
- [ ] Hedef, ödenen, krediye ayrılan, bekleyen, kalan ve fazla tutarlar gösterilecek.
- [ ] Aynı talebe yeni tamamlayıcı dekont eklenebilecek.
- [ ] Her banka dekontu ayrı kartta gösterilecek.
- [ ] Her dekontun kredi ve genel bağış dağılımı gösterilecek.
- [ ] Her dekont mevcut dosya, tarih ve mükerrerlik kontrollerinden geçecek.
- [ ] Kısmi ödemede karşılanan tam krediler kullanılabilir olacak.
- [ ] Kullanıcıya hangi kredilerin kullanılabilir olduğu açıkça gösterilecek.

### Faz 4 - Bağış Makbuzları ve Raporlama

- [ ] Her alınan ödeme için bağış makbuzu üretilecek.
- [ ] Tek dekonttan gerekirse iki ayrı bağış makbuzu üretilecek.
- [ ] Makbuz numaraları benzersiz kalacak.
- [ ] Makbuz amacı, tutarı ve bağlı banka dekontu gösterilecek.
- [ ] Taş ocağı ödeme detayında tüm dekont ve makbuzlar birlikte gösterilecek.
- [ ] Yıl sonu raporunda patlatma bağışları ayrı toplamlanacak.
- [ ] Genel Vakıf bağışları firma bazında ayrı gösterilecek.
- [ ] Excel dışa aktarım verisi bu ayrımı koruyacak.

### Faz 5 - Mali Regresyon Senaryoları

- [ ] Tek dekontla tam ödeme
- [ ] Tek dekontla birden az kredi karşılığı ödeme
- [ ] Tek dekontla birkaç tam kredi ve bekleyen bakiye
- [ ] Birden fazla dekontla hedefi tamamlama
- [ ] Son dekontta fazla ödeme
- [ ] İlk dekontta hedefi aşan ödeme
- [ ] Talep edilen kredi üst sınırının aşılmaması
- [ ] Aynı dekontun tekrar kullanılamaması
- [ ] İki makbuzun doğru amaç ve tutarla üretilmesi
- [ ] Kredi hareketlerinin doğru kullanılabilir bakiyeyi göstermesi

## İş Paketi B - OCR İnceleme ve Düzeltme

### Faz 6 - Konumlu OCR

- [ ] OCR kelime koordinatları ve güven değerleri korunacak.
- [ ] PDF metin koordinatları ortak modele dönüştürülecek.
- [ ] Alan başına birden fazla OCR adayı üretilecek.
- [ ] Düşük güvenli karakterler işaretlenecek.
- [ ] Kullanıcı düzeltmesi OCR tekrarından korunacak.
- [ ] Belge bölgesini yeniden okuma desteği eklenecek.

### Faz 7 - Belge İnceleme Çalışma Alanı

- [ ] Tam ekran veya geniş belge çalışma alanı oluşturulacak.
- [ ] İmleç merkezli zoom uygulanacak.
- [ ] Sınırlandırılmış sürükleme uygulanacak.
- [ ] Sayfaya ve genişliğe sığdırma uygulanacak.
- [ ] Sağa ve sola döndürme uygulanacak.
- [ ] PDF sayfa geçişleri uygulanacak.
- [ ] OCR alan kutuları belge üzerinde gösterilecek.
- [ ] Panel ve belge odağı çift yönlü çalışacak.

### Faz 8 - Alan Düzeltme

- [ ] Banka aranabilir standart listeden düzeltilebilecek.
- [ ] Tutar belgedeki adaylardan seçilebilecek.
- [ ] Ödeme yapan seçili işletmeciyle karşılaştırılacak.
- [ ] Tarih adayları ve tarih seçici sunulacak.
- [ ] Dekont ve referans numarası belgeden yeniden seçilebilecek.
- [ ] Dekont ve referans numarası tek işlemle yer değiştirebilecek.
- [ ] Manuel giriş her alan için korunacak.
- [ ] Sorunlu alanlar öncelikli sırada gösterilecek.
- [ ] Klavye ile doğrula ve sonraki alana geç desteklenecek.

## Faz 9 - Bütünleşik Doğrulama

- [ ] Mevcut parser regresyonları çalışacak.
- [ ] Yeni mali hesaplama regresyonları çalışacak.
- [ ] PDF, JPG ve PNG örnekleriyle OCR elle doğrulanacak.
- [ ] Masaüstü ve dar ekran düzeni kontrol edilecek.
- [ ] Yetki ve audit davranışı kontrol edilecek.
- [ ] `npm run build` başarılı olacak.
- [ ] `npm run lint` başarılı olacak.
- [ ] E bendi, ödeme/dekont, veri ve UI belgeleri güncellenecek.
- [ ] CHANGELOG güncellenecek.
- [ ] Görev `tasks/review/` aşamasına taşınacak.

## Tamamlanma Ölçütü

Görev ancak mali akış ve OCR iş paketlerinin tüm kabul senaryoları başarılı olduğunda, diğer bentlerde regresyon oluşmadığı doğrulandığında ve ilgili belgeler güncellendiğinde tamamlanmış sayılır.
