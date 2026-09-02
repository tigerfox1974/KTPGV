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
| 0 | Plan, kapsam ve takip altyapısı | Tamamlandı |
| 1 | Mali veri modeli | Tamamlandı |
| 2 | Kümülatif ödeme ve kredi motoru | Tamamlandı |
| 3 | Çoklu dekont ve ödeme dağılımı arayüzü | Tamamlandı |
| 4 | Bağış makbuzları ve yıl sonu raporu | Tamamlandı |
| 5 | Mali akış regresyon doğrulaması | Tamamlandı |
| 6 | Konumlu OCR ve aday modeli | Tamamlandı |
| 7 | Tam ekran belge inceleme çalışma alanı | Tamamlandı |
| 8 | Alan düzeltme ve sorun yönetimi | Tamamlandı |
| 9 | Bütünleşik doğrulama ve dokümantasyon | Tamamlandı |

## Faz 0 - Plan ve Takip

- [x] Kullanıcıdan mali iş kuralları alındı.
- [x] BR-023 ile BR-028 arasındaki kalıcı iş kuralları kaydedildi.
- [x] OCR yenileme planı oluşturuldu ve onaylandı.
- [x] Mali iş akışının OCR'dan önce uygulanacağı onaylandı.
- [x] Ana checklist ve bağımlı todo zinciri oluşturuldu.
- [x] Etkilenen mevcut kod ve veri akışının tam etki analizi tamamlanacak.

## İş Paketi A - Mali İş Akışı

### Faz 1 - Mali Veri Modeli

- [x] Bir kredi talebine birden fazla banka dekontu bağlanabilecek.
- [x] Banka dekontu ile bağış makbuzu ayrı veri tipleri olarak temsil edilecek.
- [x] Bir dekontun tutarı birden fazla muhasebe amacına dağıtılabilecek.
- [x] “Taş Ocağı Patlatması Bağışı” makbuz türü tanımlanacak.
- [x] “Genel Vakıf Bağışı” makbuz türü tanımlanacak.
- [x] OCR ilk değeri ve kullanıcı tarafından doğrulanan değer için geriye uyumlu alanlar hazırlanacak.
- [x] Eski demo kayıtlarının yeni modelle çalışması korunacak.

### Faz 2 - Kümülatif Ödeme ve Kredi Motoru

- [x] Hedef tutar kredi adedi ile bir kredi bedelinden hesaplanacak.
- [x] Krediye ayrılan kümülatif dekont tutarı hesaplanacak.
- [x] Tam krediye dönüşen kullanılabilir kredi adedi hesaplanacak.
- [x] Tam krediye yetmeyen bekleyen bakiye hesaplanacak.
- [x] Kalan hedef tutar hesaplanacak.
- [x] Talebi aşan genel bağış tutarı hesaplanacak.
- [x] Yeni dekont önce kalan hedefe, artanı genel bağışa dağıtılacak.
- [x] Kullanılabilir kredi talep edilen kredi adedini aşmayacak.
- [x] Hesaplama saf fonksiyonlarla regresyon testine uygun tutulacak.

### Faz 3 - Çoklu Dekont Arayüzü

- [x] Kredi talep özeti gösterilecek.
- [x] Hedef, ödenen, krediye ayrılan, bekleyen, kalan ve fazla tutarlar gösterilecek.
- [x] Aynı talebe yeni tamamlayıcı dekont eklenebilecek.
- [x] Her banka dekontu ayrı kartta gösterilecek.
- [x] Her dekontun kredi ve genel bağış dağılımı gösterilecek.
- [x] Her dekont mevcut dosya, tarih ve mükerrerlik kontrollerinden geçecek.
- [x] Kısmi ödemede karşılanan tam krediler kullanılabilir olacak.
- [x] Kullanıcıya hangi kredilerin kullanılabilir olduğu açıkça gösterilecek.

### Faz 4 - Bağış Makbuzları ve Raporlama

- [x] Her alınan ödeme için bağış makbuzu üretilecek.
- [x] Tek dekonttan gerekirse iki ayrı bağış makbuzu üretilecek.
- [x] Makbuz numaraları benzersiz kalacak.
- [x] Makbuz amacı, tutarı ve bağlı banka dekontu gösterilecek.
- [x] Taş ocağı ödeme detayında tüm dekont ve makbuzlar birlikte gösterilecek.
- [x] Yıl sonu raporunda patlatma bağışları ayrı toplamlanacak.
- [x] Genel Vakıf bağışları firma bazında ayrı gösterilecek.
- [x] Excel dışa aktarım verisi bu ayrımı koruyacak.

### Faz 5 - Mali Regresyon Senaryoları

- [x] Tek dekontla tam ödeme
- [x] Tek dekontla birden az kredi karşılığı ödeme
- [x] Tek dekontla birkaç tam kredi ve bekleyen bakiye
- [x] Birden fazla dekontla hedefi tamamlama
- [x] Son dekontta fazla ödeme
- [x] İlk dekontta hedefi aşan ödeme
- [x] Talep edilen kredi üst sınırının aşılmaması
- [x] Aynı dekontun tekrar kullanılamaması
- [x] İki makbuzun doğru amaç ve tutarla üretilmesi
- [x] Kredi hareketlerinin doğru kullanılabilir bakiyeyi göstermesi

### Mali İş Paketi Doğrulama Kaydı

- `npm run test:kredi-yukleme`: 14 senaryo başarılı.
- `npm run test:parser`: 7 mevcut dekont ayrıştırma senaryosu başarılı.
- `npm run build`: Başarılı.
- `npm run lint`: Hata yok; proje genelindeki mevcut Fast Refresh uyarıları devam ediyor.
- Bağımsız kod incelemesinde bulunan tahsilat toplamı, rapor veri kapsamı ve genel bağış makbuzu metni sorunları düzeltildi.
- Tarayıcı kontrolünde çoklu dekont, doğrulanmış dağılım, bekleyen dekont, eksik makbuz ve tamamlayıcı dekont eylemleri görüntülendi.
- Trafik rolüyle yapılan kontrolde E bendi işletmeci adlarının rapor ekranına sızmadığı doğrulandı.

## İş Paketi B - OCR İnceleme ve Düzeltme

### Faz 6 - Konumlu OCR

- [x] OCR kelime koordinatları ve güven değerleri korunacak.
- [x] PDF metin koordinatları ortak modele dönüştürülecek.
- [x] Alan başına birden fazla OCR adayı üretilecek.
- [x] Düşük güvenli karakterler işaretlenecek.
- [x] Kullanıcı düzeltmesi OCR tekrarından korunacak.
- [x] Belge bölgesini yeniden okuma desteği eklenecek.

### Faz 7 - Belge İnceleme Çalışma Alanı

- [x] Tam ekran veya geniş belge çalışma alanı oluşturulacak.
- [x] İmleç merkezli zoom uygulanacak.
- [x] Sınırlandırılmış sürükleme uygulanacak.
- [x] Sayfaya ve genişliğe sığdırma uygulanacak.
- [x] Sağa ve sola döndürme uygulanacak.
- [x] PDF sayfa geçişleri uygulanacak.
- [x] OCR alan kutuları belge üzerinde gösterilecek.
- [x] Panel ve belge odağı çift yönlü çalışacak.

### Faz 8 - Alan Düzeltme

- [x] Banka aranabilir standart listeden düzeltilebilecek.
- [x] Tutar belgedeki adaylardan seçilebilecek.
- [x] Ödeme yapan seçili işletmeciyle karşılaştırılacak.
- [x] Tarih adayları ve tarih seçici sunulacak.
- [x] Dekont ve referans numarası belgeden yeniden seçilebilecek.
- [x] Dekont ve referans numarası tek işlemle yer değiştirebilecek.
- [x] Manuel giriş her alan için korunacak.
- [x] Sorunlu alanlar öncelikli sırada gösterilecek.
- [x] Klavye ile doğrula ve sonraki alana geç desteklenecek.

## Faz 9 - Bütünleşik Doğrulama

- [x] Mevcut parser regresyonları çalışacak. (7/7 PASS)
- [x] Yeni mali hesaplama regresyonları çalışacak. (14/14 PASS)
- [ ] PDF, JPG ve PNG örnekleriyle OCR elle doğrulanacak. *(gerçek belgeyle manuel test kullanıcıya ait)*
- [ ] Masaüstü ve dar ekran düzeni kontrol edilecek. *(tarayıcıda manuel kontrol kullanıcıya ait)*
- [x] Yetki ve audit davranışı kontrol edilecek.
- [x] `npm run build` başarılı olacak.
- [x] `npm run lint` başarılı olacak.
- [x] E bendi, ödeme/dekont, veri ve UI belgeleri güncellenecek.
- [x] CHANGELOG güncellenecek.
- [ ] Görev `tasks/review/` aşamasına taşınacak. *(kullanıcı onayı sonrası)*

## Tamamlanma Ölçütü

Görev ancak mali akış ve OCR iş paketlerinin tüm kabul senaryoları başarılı olduğunda, diğer bentlerde regresyon oluşmadığı doğrulandığında ve ilgili belgeler güncellendiğinde tamamlanmış sayılır.
