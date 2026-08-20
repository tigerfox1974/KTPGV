# MagicPatterns Prompt — KTPGV Tüm Sistem Tıklanabilir Demo

Aşağıdaki mevcut demo mantığını baz alarak Kıbrıs Türk Polis Güçlendirme Vakfı için modern, kurumsal, tam kapsamlı ve tıklanabilir bir demo/prototip arayüz oluştur.

Bu bir gerçek backend projesi değildir. Supabase, Vercel, veritabanı, storage veya gerçek authentication bağlantısı kurma. Ancak gerçek sistemde çalışacak iş akışlarını doğru temsil eden yüksek kaliteli bir UI/UX prototipi oluştur.

Demo sadece trafik raporları için değil, KTPGV sisteminin tamamı için hazırlanacak.

## Genel Amaç

KTPGV Ön Ödeme, Dekont, Makbuz, İşlem, Hesaplama, Yetki, Ajanda, Rapor ve Mali Yıl Arşiv sisteminin tıklanabilir demo arayüzünü oluştur.

Sistem şu ana ilkeye göre tasarlanacak:

Ödeme/dekont süreci tamamlanmadan işlem kaydı oluşturulmaz. Dekont dosyası olmadan işlem asla kayda alınmaz. Ödeme, makbuz ve işlem süreçleri rol, birim ve bent yetkisine göre yönetilir.

## Korunacak Temel Kararlar

- Program dili Türkçe olacak.
- Para birimi her yerde `TL` olarak yazılacak.
- `₺` sembolü kullanılmayacak.
- “Bent” kelimesi korunacak.
- Açılışta hiçbir bent otomatik seçili olmayacak.
- İlk seçenek `Lütfen bent seçiniz` olacak.
- Kaydet sonrası yeni işlem formu sıfırlanacak.
- Hatalı veya eksik veri ile işlem kaydı oluşturulmayacak.
- Tüm demo kurumsal, temiz, anlaşılır ve modern görünecek.
- KTPGV sisteminin tamamı gösterilecek; sadece trafik bacağı yapılmayacak.

## Ana Ekranlar

Aşağıdaki ekranları oluştur:

1. Giriş ekranı
2. Dashboard
3. Yeni İşlem
4. Kayıtlar
5. Ödeme / Makbuz
6. Sigorta Şirketi Kartları
7. Taş Ocağı İşletmecileri
8. Taş Ocağı Kartları
9. Taş Ocağı Kredi Hareketleri
10. Ajanda
11. Raporlar
12. Kullanıcı / Rol / Birim Yetkileri
13. Mali Yıl Arşiv
14. Audit Log
15. İş Kuralları / Teknik Kurallar

Ayrı bir `QR Dekont Yükleme` menüsü oluşturma.

QR/link özelliği sadece ilgili işlem formunun `Dijital Dekont Dosyası` alanı içinde olacak.

## Demo Giriş Kullanıcıları

Giriş ekranında aşağıdaki demo kullanıcıları bulunacak:

- `admin / 1234` — Merkez Admin
- `vakif / 1234` — Vakıf Muhasebe
- `trafik / 1234` — PGM Trafik Müdürlüğü
- `itfaiye / 1234` — İtfaiye Birimi
- `karakol / 1234` — İlçe / Karakol Kullanıcısı
- `tasocagi / 1234` — Taş Ocağı İşlemleri Yetkilisi
- `denetci / 1234` — Denetçi

Kullanıcı değiştiğinde görebileceği menüler, kullanabileceği bentler ve makbuz yetkileri değişsin.

## Yetki Mantığı

Kullanıcının rolü ve birimi şunları belirleyecek:

- Hangi bentlerde işlem yapabilir?
- Hangi birimin kayıtlarını görebilir?
- Makbuz üretebilir mi?
- Sadece görüntüleme mi yapabilir?
- Rapor görebilir mi?
- Ajandaya işlem düşürebilir mi?

Örnek yetki matrisi:

- Merkez Admin: tüm ekranlar, tüm bentler, tüm makbuzlar
- Vakıf Muhasebe: ödeme, dekont, makbuz, rapor
- PGM Trafik Müdürlüğü: F / Trafik Raporu
- İtfaiye Birimi: C ve Ç
- İlçe / Karakol: yetki verilen bentler
- Taş Ocağı Yetkilisi: E bendi taş ocağı kredi ve kullanım işlemleri
- Denetçi: sadece görüntüleme ve rapor

## Bentler

Yeni işlem ekranında şu bentler bulunacak:

- A - Faaliyet geliri / yardım / bağış
- B - Hurda ve hizmet dışı mal satışı
- C - İtfaiye denetim / kontrol / rapor
- Ç - Yangın Risk Raporu
- D - Yol kapama ve güvenlik tedbiri
- E - Taş ocağı patlatma işlemi
- F - Adli / trafik polis raporu

F bendi seçildiğinde alt tür ayrımı olacak:

- F - Adli Polis Raporu
- F - Trafik Polis Raporu

## Yasal Hesaplama Kuralları

Sistem hesaplamaları Kıbrıs Türk Polisini Güçlendirme Yasası 57/2026 Madde 6 gelir bentlerine göre temsil edecek.

Brüt asgari ücret sistem ayarında bulunacak. Demo içinde değer değiştirilebilir gibi gösterilecek.

Kullanıcıya sadece toplam değil, hesaplama açıklaması da gösterilecek.

### A Bendi

Faaliyet geliri / yardım / bağış.

Sabit oran yoktur.

Tutar manuel girilecek.

### B Bendi

Hurda veya hizmet dışı mal satışı.

Sabit oran yoktur.

Tutar manuel girilecek.

B bendi için ek bilgi göster:

Bu gelir, ilgili yasal amaç kapsamında Kurum hesabına aktarılır.

### C Bendi

İtfaiye denetim, kontrol ve rapor.

Formül:

`Brüt Asgari Ücret x %2 x İşlem Adedi`

Ekranda gösterilecek örnek açıklama:

`BAÜ x %2 = işlem başı tutar. İşlem adedi ile çarpılarak toplam bulunur.`

### Ç Bendi

Yangın Risk Raporu.

Formül:

`Brüt Asgari Ücret x %10 x Rapor Adedi`

### D Bendi

Yol kapama ve güvenlik tedbiri.

Formül:

`Polis Sayısı x Görev Süresi x Brüt Asgari Ücret x %0,5`

Kurallar:

- Polis sayısı tam sayı olacak.
- Yarım personel girilemeyecek.
- Görev süresi tam saat olacak.
- Buçuklu saat girilemeyecek.
- Sıfır veya negatif değer kabul edilmeyecek.

### E Bendi

Taş ocağı patlatma işlemleri.

Yasal temel:

`Her bir patlatma işlemi için Brüt Asgari Ücret x %10`

Ancak bu bölüm basit `adet x ücret` ekranı olarak yapılmayacak. Aşağıdaki gelişmiş kredi modeli uygulanacak.

### F Bendi

Adli ve trafik polis raporları.

Formül:

`Brüt Asgari Ücret x %1 x Rapor Adedi`

F alt türleri:

- Adli Rapor
- Trafik Raporu

## Dijital Dekont Yapısı

Ayrı QR Dekont Yükleme menüsü olmayacak.

Her işlem formunda `Dekont / Ödeme Bilgisi` bölümü olacak.

Bu bölümde zorunlu alanlar:

- Dekont no
- Banka
- Dekont tarihi
- Ödenen tutar
- Ödeme yapan kişi/kurum
- Dijital dekont dosyası

Dijital dekont dosyası için iki yöntem olacak:

### Yöntem 1 — Personel Dosya Yükleme

Personel kendi ekranından PDF/JPG/PNG dekont dosyası seçer.

### Yöntem 2 — Başvuru Sahibi QR/Link ile Yükleme

İlgili işlem formunda `Başvuru sahibi için QR/link oluştur` butonu olur.

QR/link oluşturulduğunda:

- küçük QR simülasyonu
- yükleme linki
- başvuru sahibi yükleme ekranı simülasyonu

görünsün.

Başvuru sahibi dosyayı yüklediğinde dosya anında aynı işlem formundaki `Dijital dekont dosyası` alanında görünür.

## Dekont Dosyası Görünümü

Dosya yüklendikten sonra dosya kartı olarak gösterilecek.

Kartta şunlar olacak:

- Dosya adı
- Dosya türü: PDF / JPG / PNG
- Dosya boyutu
- Yükleme yöntemi: Personel ekranı veya QR/link
- Yükleme zamanı

Dosyaya tıklanınca modal açılacak.

Modal içinde:

- PDF ise PDF önizleme
- JPG ise görsel önizleme
- PNG ise görsel önizleme

görünecek.

Yanlış dosya yüklenirse, işlem kaydedilmeden önce `Dosyayı kaldır` butonu ile silinebilecek.

Ama işlem kaydedildikten sonra serbest silme olmayacak. Gerçek sistemde bunun yetki ve audit log gerektireceği iş kuralı olarak gösterilecek.

Kesin kural:

Dekont dosyası yoksa işlem kaydedilemez.

## Dosya Kuralları

- Kabul edilen dosya türleri: PDF, JPG, PNG
- Maksimum dosya boyutu: 5 MB
- PDF 5 MB üzerindeyse reddedilecek.
- JPG/PNG 5 MB üzerindeyse kalite kaybı fazla olmadan 5 MB altına indirme simülasyonu gösterilecek.
- Dosya olmadan kayıt butonu aktif olmayacak.

## Ödeme / Makbuz Ekranı

Mevcut `Ödeme / Makbuz` ekranı korunacak ve ana mali işlem merkezi olacak.

Bu ekranda:

- kayıt no
- bent
- talep eden
- ödeme yapan
- tutar
- dekont no
- dekont dosyası
- ödeme durumu
- makbuz durumu
- makbuz üretme
- makbuz görüntüleme
- yazdırma

bulunacak.

Makbuz üretme yetkisi rol ve birime bağlı olacak.

Her kullanıcı makbuz üretemeyecek.

Makbuz üretme yetkisi olanlar:

- Merkez Admin
- Vakıf Muhasebe
- Yetki verilmiş ilgili birimler

Bazı bentlerde makbuz merkezi değil, ilgili birimde üretilecek.

Makbuz çıktısı iki nüsha mantığında gösterilecek:

- Nüsha 1: Ödemeyi yapana verilir.
- Nüsha 2: Kaydı yapan birimin fiziksel dosyasına konur.

Makbuz numarası sistem tarafından benzersiz üretilecek gibi gösterilecek.

Makbuz no kullanıcı tarafından elle yazılmayacak.

Aynı kayda ikinci makbuz üretilemeyecek.

## Benzersiz Numara Mantığı

Demo içinde bu altyapı arayüz ve iş kuralı olarak gösterilecek.

Gerçek sistemde şu mantıkla çalışacağı anlatılacak:

- Kayıt numarası kullanıcı tarafından yazılmaz.
- Makbuz numarası kullanıcı tarafından yazılmaz.
- Numaralar merkezi online sistem tarafından üretilir.
- Aynı anda iki kullanıcı işlem yapsa bile aynı numara verilmez.
- PostgreSQL transaction, sequence, unique constraint, idempotency ve audit log ile numara çakışması önlenir.
- Offline makbuz üretimi yoktur.

Örnek kayıt numaraları:

- A-2026-000001
- B-2026-000001
- C-2026-000001
- Ç-2026-000001
- D-2026-000001
- EKRD-2026-000001
- EKUL-2026-000001
- FADL-2026-000001
- TTRF-2026-000045

Örnek makbuz no:

- BM-2026-000001
- BM-2026-000002

## Trafik Raporu Nihai Modeli

Trafik raporları sadece sigorta şirketlerinden alınacak.

Trafik için başvuru sahibi türü seçenekleri olmayacak.

Olmayacak başvuru türleri:

- bireysel
- avukat
- başka kurum
- serbest başvuru

Trafik başvurusu sadece sigorta şirketi kartına bağlı açılacak.

Her sigorta şirketinin kartı olacak.

Sigorta şirketi kartında:

- şirket adı
- kayıt/vergi no
- adres
- telefon
- e-posta
- yetkili kişi
- yetkili telefon
- aktif/pasif
- notlar

bulunacak.

Sigorta şirketi seçilmeden trafik raporu kaydı oluşturulamaz.

## Trafik TTRF Yapısı

Tekli trafik başvurusu bile TTRF ana kayıt mantığıyla açılacak.

Ana kayıt örneği:

`TTRF-2026-000045`

Alt kayıtlar:

- `TTRF-2026-000045-001`
- `TTRF-2026-000045-002`
- `TTRF-2026-000045-003`

Tekli başvuruda:

- `TTRF-2026-000046`
- `TTRF-2026-000046-001`

Alt başvurular bağımsız TRF serisi kullanmayacak.

Trafik ödeme modeli:

- ödeme ana TTRF kaydına bağlı olacak
- dekont ana TTRF kaydına bağlı olacak
- makbuz ana TTRF kaydına kesilecek
- alt başvurular aynı ödeme/makbuzla ilişkilendirilecek
- alt başvurulara ayrı makbuz kesilmeyecek

Ödeme / Makbuz ekranında alt başvuru sayısı kadar ayrı kayıt görünmeyecek.

Tek ana TTRF satırı görünecek, alt başvurular açılır detay içinde gösterilecek.

## Taş Ocakları / E Bendi Gelişmiş Kredi Modeli

E bendi basit patlatma adedi ekranı olmayacak.

Taş ocağı firmaları veya firma sahibi kişiler, tekli ya da çoklu patlatma için önceden ödeme yapabilecek.

Yapılan ödeme, `patlatma kredisi` olarak işlenecek.

Her bir patlatma gerçekleştiğinde bu krediden düşülecek.

Yasal temel:

`1 patlatma kredisi = Brüt Asgari Ücret x %10`

Örnek:

- 1 patlatmalık ödeme → 1 kredi
- 7 patlatmalık ödeme → 7 kredi
- 10 patlatmalık ödeme → 10 kredi

## Taş Ocağı İşletmecisi / Sahip Kartı

Taş ocakları için üst yapı olarak `İşletmeci / Sahip Kartı` oluştur.

Bu kartta şunlar olacak:

- işletmeci / sahip adı
- şahıs veya şirket türü
- kimlik / vergi / şirket no
- telefon
- adres
- yetkili kişi
- aktif / pasif durumu
- toplam yüklenen kredi
- kullanılan kredi
- kalan kredi
- bağlı taş ocakları
- kredi hareketleri

Aynı işletmecinin birden fazla taş ocağı olabilir.

## Taş Ocağı Kartı

Her taş ocağı bir işletmeciye bağlı olacak.

Taş ocağı kartında:

- taş ocağı adı
- bağlı işletmeci / sahip
- ruhsat no
- bölge
- adres / konum
- sorumlu kişi
- telefon
- aktif / pasif
- notlar

bulunacak.

## Taş Ocağı Kredi Yükleme

E bendi altında iki işlem türü olacak:

1. Patlatma kredisi yükleme / ödeme alma
2. Patlatma kullanımı / görev kaydı

Kredi yükleme işleminde:

- işletmeci seçilir
- kaç patlatmalık ödeme yapılacağı girilir
- sistem yasal tutarı hesaplar
- dekont bilgileri girilir
- dijital dekont dosyası yüklenir
- makbuz süreci çalışır
- kredi işletmeci hesabına yüklenir

Örnek kredi yükleme kaydı:

- Kredi Yükleme No: `EKRD-2026-000015`
- İşletmeci: Ahmet Mehmet
- 1 Patlatma Bedeli: `BAÜ x %10`
- Yüklenen Kredi: 7
- Toplam Tutar: `7 x 1 patlatma bedeli`
- Dekont No: 987654321
- Makbuz No: BM-2026-000144
- Kalan Kredi: 7

Kredi yüklemede dekont ve ödeme bilgileri zorunludur.

Dekont olmadan kredi yükleme kaydı oluşmaz.

## Taş Ocağı Kredi Kullanımı

Patlatma yapılacağı zaman ödeme yeniden alınmayacak. Sistem mevcut krediyi kontrol edecek.

Kullanıcı:

- işletmeci seçer
- taş ocağı seçer
- patlatma tarihi girer
- patlatma saati girer
- patlatma adedi girer
- açıklama / görev notu girer

Sistem kontrol eder:

`İşletmecinin yeterli kredisi var mı?`

Yeterli kredi varsa:

- patlatma kullanım kaydı oluşturulur
- kredi düşülür
- ajandaya düşer
- audit log oluşur

Yeterli kredi yoksa:

- patlatma kullanımı oluşturulamaz
- ödeme/kredi yükleme yapılması gerektiği uyarısı gösterilir

Örnek kullanım kaydı:

- Kullanım No: `EKUL-2026-000031`
- İşletmeci: Ahmet Mehmet
- Taş Ocağı: Alfa Taş Ocağı
- Patlatma tarihi: 20.08.2026
- Saat: 10:00
- Kullanılan kredi: 1
- Önceki kredi: 7
- Kalan kredi: 6
- Durum: Planlandı

## Ortak Kredi Kullanımı

Kredi, tek taş ocağına değil, işletmeci/sahip hesabına bağlı tutulacak.

Örnek:

İşletmeci: Ahmet Mehmet
Toplam kredi: 7

Bağlı taş ocakları:

- Alfa Taş Ocağı
- Kaya I Taş Ocağı
- Güney Blok Taş Ocağı

Bu taş ocaklarından herhangi birinde patlatma yapılınca aynı ortak krediden düşülecek.

Örnek hareket:

- Alfa Taş Ocağı’nda 1 patlatma → kalan kredi 6
- Güney Blok Taş Ocağı’nda 1 patlatma → kalan kredi 5
- Kaya I Taş Ocağı’nda 1 patlatma → kalan kredi 4

## Kredi Hareketleri Ekranı

Her işletmeci kartında kredi hareketleri listelenecek.

Örnek:

- `+7 kredi` | EKRD-2026-000015 | Dekont 987654321 | Makbuz BM-2026-000144
- `-1 kredi` | EKUL-2026-000031 | Alfa Taş Ocağı | 20.08.2026
- `-1 kredi` | EKUL-2026-000032 | Güney Blok Taş Ocağı | 21.08.2026

Kart özeti:

- Toplam yüklenen kredi
- Toplam kullanılan kredi
- Kalan kredi

## Taş Ocağı Ajanda Mantığı

Ajandaya kredi yükleme değil, patlatma kullanımı düşecek.

Kredi yükleme mali işlemdir.

Patlatma kullanımı operasyonel ajanda işlemidir.

Ajanda kartı örneği:

- EKUL-2026-000031
- İşletmeci: Ahmet Mehmet
- Taş Ocağı: Alfa Taş Ocağı
- Tarih: 20.08.2026
- Saat: 10:00
- Kullanılacak kredi: 1
- Kalan kredi: 6
- Durum: Planlandı

Durumlar:

- Planlandı
- İşlem Başlatılabilir
- Görev Tamamlandı
- Ertelendi
- İptal Edildi

## Taş Ocağı Makbuz Mantığı

Makbuz kredi yükleme kaydına kesilecek.

Patlatma kullanımında yeniden makbuz aranmayacak.

Örnek:

İşletmeci 7 patlatmalık ödeme yaptıysa:

- tek dekont
- tek makbuz
- 7 kredi

Daha sonra farklı taş ocaklarında yapılan patlatmalarda bu krediler azalır.

Makbuz üzerinde şu bilgiler görünebilir:

- İşletmeci / sahip
- Yüklenen kredi sayısı
- Bir patlatma bedeli
- Toplam ödeme
- Dekont no
- Makbuz no
- Kredinin kullanılabileceği bağlı taş ocakları

## Ajanda Genel Kuralı

Ajanda banka işleri için değil, operasyonel görev/işlem takibi için olacak.

Ajandaya otomatik düşecek bentler:

- C
- Ç
- D
- E kullanım kayıtları
- F

A ve B otomatik ajandaya düşmeyecek.

E bendi için:

- kredi yükleme ajandaya düşmez
- patlatma kullanımı ajandaya düşer

## Raporlar

Rapor ekranlarında şunlar olacak:

- Gelir raporu
- Bent bazlı rapor
- Birim bazlı rapor
- Ödeme/dekont raporu
- Makbuz raporu
- Sigorta şirketi bazlı trafik raporu
- Toplu TTRF başvuru raporu
- Taş ocağı işletmeci kredi raporu
- Taş ocağı kullanım raporu
- Kalan kredi raporu
- Ajanda raporu
- Audit log raporu
- Mali yıl arşiv raporu

## Mali Yıl Arşiv

Mali yıl arşiv ekranında şu mantığı göster:

- İşlem kayıtları silinmez.
- Eski mali yıl dosyaları export edilir.
- Manifest oluşturulur.
- Hash/bütünlük bilgisi tutulur.
- Arşiv doğrulanmadan dosya silinmez.
- Dosya arşivlense bile işlem kaydı, makbuz no, dekont no ve audit geçmişi sistemde kalır.

## Audit Log

Aşağıdaki hareketler audit log’da görünür şekilde temsil edilecek:

- giriş yapıldı
- kayıt oluşturuldu
- dekont yüklendi
- dekont dosyası görüntülendi
- kayıt öncesi dekont kaldırıldı
- QR/link oluşturuldu
- makbuz üretildi
- ödeme doğrulandı
- işlem başlatılabilir yapıldı
- TTRF ana kayıt oluşturuldu
- trafik alt başvuru oluşturuldu
- taş ocağı işletmeci kartı oluşturuldu
- taş ocağı kartı oluşturuldu
- taş ocağı kredi yüklendi
- taş ocağı kredi kullanıldı
- taş ocağı kullanım kaydı ertelendi
- taş ocağı kullanım kaydı iptal edildi
- rapor görüntülendi
- arşiv manifest simülasyonu oluşturuldu

## Tasarım Dili

Tasarım kurumsal, sade ve premium görünsün.

Görsel karakter:

- lacivert / beyaz / açık gri ana yapı
- net kartlar
- okunabilir tablolar
- durum rozetleri
- modal pencereler
- açık hesaplama kutuları
- temiz form düzeni
- role göre değişen menü yapısı
- tek sayfada anlaşılır ama profesyonel görünüm

Mobilde de kırılmadan görüntülenecek responsive yapı olsun.

## Özellikle Yapılmayacaklar

- Ayrı `QR Dekont Yükleme` menüsü oluşturma.
- Trafik başvurusunu bireysel/avukat/serbest başvuruya açma.
- TTRF alt başvurularına ayrı makbuz üretme.
- Dekont dosyası olmadan kayıt oluşturma.
- Makbuz no veya kayıt noyu kullanıcıya elle yazdırma.
- E bendi taş ocaklarını sadece basit adet hesabı olarak bırakma.
- Test senaryosu, test metodu veya teknik test kriteri yazma.
- Gerçek Supabase/Vercel bağlantısı kurmaya çalışma.
- Demo kapsamını sadece trafik ekranıyla sınırlama.

## Beklenen Sonuç

Tek parça, tıklanabilir, modern ve kapsamlı demo/prototip oluştur.

Demo şu sorulara arayüz üzerinden cevap verebilmeli:

- Hangi kullanıcı hangi bentte işlem yapabilir?
- Hangi bent nasıl hesaplanır?
- Dekont nasıl yüklenir?
- QR/link nerede oluşturulur?
- Başvuru sahibi dekontu nasıl yükler?
- Dosya nasıl görüntülenir?
- Yanlış dosya kayıt öncesi nasıl kaldırılır?
- Dekont olmadan kayıt neden oluşmaz?
- Makbuz kim tarafından üretilir?
- Makbuz numarası nasıl benzersiz görünür?
- Trafik raporu neden sadece sigorta şirketi üzerinden açılır?
- TTRF ana kayıt ve alt başvurular nasıl görünür?
- Taş ocağı işletmecisi nasıl kredi yükler?
- Aynı işletmeciye bağlı farklı taş ocakları ortak krediyi nasıl kullanır?
- Patlatma yapıldıkça kredi nasıl azalır?
- Kalan kredi nasıl izlenir?
- Hangi işlemler ajandaya düşer?
- Raporlar ve audit log nasıl görünür?