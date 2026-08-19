# MagicPatterns Düzeltme Promptu — KTPGV Demo/Prototip Kalite Seviyesi

Mevcut KTPGV MagicPatterns projesini esas al. Projeyi baştan yeniden kurma. Mevcut ekran yapısını, genel tasarım dilini, menüleri ve çalışan temel akışı koru. Sadece aşağıda belirtilen eksikleri ve kalite sorunlarını düzelt.

Bu çalışma gerçek backend, Supabase, Vercel, database veya authentication entegrasyonu değildir. Ama gerçek sistemde uygulanacak iş kurallarını doğru temsil eden, yüksek kaliteli, tıklanabilir demo/prototip arayüzü olmalıdır.

## Korunacak Yapılar

Aşağıdaki mevcut doğru yapılar korunacak:

- React / Vite demo mantığı
- Giriş ekranı
- Rol / kullanıcı / birim yetki mantığı
- Dashboard
- Yeni İşlem
- Kayıtlar
- Ödeme / Makbuz
- Sigorta Şirketleri
- Taş Ocağı İşletmecileri
- Taş Ocağı Kartları
- Kredi Hareketleri
- Ajanda
- Raporlar
- Yetkiler
- Mali Yıl Arşiv
- Audit Log
- İş Kuralları
- E bendi taş ocağı kredi modeli
- TTRF ana trafik başvurusu ve alt başvuru mantığı
- Dijital dekont alanı içinde QR/link oluşturma mantığı

Ayrı bir `QR Dekont Yükleme` menüsü oluşturma.

QR/link özelliği sadece ilgili işlem formundaki `Dijital Dekont Dosyası` alanı içinde kalacak.

## Genel Dil ve Format Kuralları

- Program dili Türkçe olacak.
- Para birimi her yerde `TL` olarak yazılacak.
- `₺` sembolü kesinlikle kullanılmayacak.
- “Bent” kelimesi korunacak.
- Brüt asgari ücret için arayüzde `BAÜ` etiketi kullanılacak.
- Para değerleri Türkçe formatta gösterilecek: `70.893,00 TL`
- Açılışta hiçbir bent otomatik seçili olmayacak.
- Bent seçiminde ilk değer `Lütfen bent seçiniz` olacak.
- Kaydet sonrası yeni işlem formu sıfırlanacak.
- Eksik veya hatalı veri ile kayıt oluşturulmayacak.

## 1. BAÜ Değerini Güncelle

Mevcut projede BAÜ değeri eski/yanlış görünüyor. Varsayılan BAÜ değeri şu yapılacak:

`70.893,00 TL`

Bu değer sistem ayarı gibi gösterilecek.

Dashboard veya İş Kuralları / Sistem Ayarları alanında şu bilgi açıkça yer alacak:

`BAÜ: 70.893,00 TL`

Merkez Admin rolü için BAÜ ayarı güncellenebilir gibi gösterilecek. Bu demo olduğu için gerçek kalıcı kayıt gerekmez, fakat arayüzde “BAÜ güncelle” davranışı temsil edilecek.

BAÜ değiştiğinde tüm hesaplama kutuları bu değere göre yeniden hesaplanıyor gibi davranmalı.

## 2. Örnek Tutarları Yeni BAÜ’ye Göre Düzelt

Demo içindeki örnek kayıtlar ve hesaplama açıklamaları 34.000 TL üzerinden kalmışsa düzelt.

Yeni BAÜ:

`70.893,00 TL`

Yasal oranlara göre birim tutarlar:

- C bendi: BAÜ x %2 = `1.417,86 TL`
- Ç bendi: BAÜ x %10 = `7.089,30 TL`
- D bendi: BAÜ x %0,5 = `354,465 TL` kişi/saat
- E bendi: BAÜ x %10 = `7.089,30 TL` bir patlatma kredisi
- F bendi: BAÜ x %1 = `708,93 TL` rapor başı

D bendi için toplam hesaplamada gereksiz iki ondalık yuvarlama yapma; hesaplama açıklamasında tam değeri anlaşılır göster.

Örnek:

`6 polis x 2 saat x 354,465 TL = 4.253,58 TL`

Kullanıcıya hesaplama kutusunda hem formül hem sonuç açıkça gösterilecek.

## 3. Yasal Hesaplama Kuralları Korunacak

Aşağıdaki kurallar aynı kalacak:

### A Bendi

Faaliyet geliri / yardım / bağış.

Sabit oran yok.

Tutar manuel girilir.

### B Bendi

Hurda / hizmet dışı mal satışı.

Sabit oran yok.

Tutar manuel girilir.

### C Bendi

İtfaiye denetim / kontrol / rapor.

Formül:

`BAÜ x %2 x işlem adedi`

### Ç Bendi

Yangın Risk Raporu.

Formül:

`BAÜ x %10 x rapor adedi`

### D Bendi

Yol kapama ve güvenlik tedbiri.

Formül:

`Polis sayısı x görev süresi x BAÜ x %0,5`

### E Bendi

Taş ocağı patlatma işlemi.

Formül:

`1 patlatma kredisi = BAÜ x %10`

Ama E bendi sadece adet hesabı değildir. Taş ocağı kredi modeli korunacak.

### F Bendi

Adli / trafik polis raporu.

Formül:

`BAÜ x %1 x rapor adedi`

## 4. Trafik Alt Başvurularını Gerçek Satır Girişi Haline Getir

Mevcut yapıda TTRF ana kayıt mantığı doğru, ancak alt başvuru detayları fazla otomatik ve zayıf kalmış.

F bendi → Trafik Raporu seçildiğinde:

- Sigorta şirketi seçimi zorunlu olacak.
- Başvuru bireysel, avukat veya serbest başvuru olarak açılmayacak.
- Trafik sadece sigorta şirketi kartına bağlı olacak.

TTRF ana kayıt yapısı korunacak:

`TTRF-2026-000045`

Alt başvurular ana kayıttan türeyecek:

- `TTRF-2026-000045-001`
- `TTRF-2026-000045-002`
- `TTRF-2026-000045-003`

Ancak alt başvurular kullanıcı tarafından satır satır girilecek.

Her alt başvuru satırında şu alanlar olacak:

- Alt başvuru no
- Plaka
- Hasar / dosya no
- Kaza tarihi
- Rapor konusu
- Rapor tutarı

Rapor tutarı otomatik olarak `BAÜ x %1` ile dolabilir, fakat satırda görünür olmalı.

Alt başvuru sayısı değişince satırlar otomatik artıp azalmalı.

Tekli trafik başvurusunda bile yapı şöyle olacak:

- Ana kayıt: `TTRF-2026-000046`
- Alt kayıt: `TTRF-2026-000046-001`

Trafik için ödeme, dekont ve makbuz yalnızca ana TTRF kaydına bağlanacak. Alt başvurular için ayrı makbuz üretilmeyecek.

Ödeme / Makbuz ekranında alt başvurular ayrı ayrı ödeme satırı gibi görünmeyecek. Tek ana TTRF satırı görünecek, alt başvurular açılır detay veya detay panelinde listelenecek.

## 5. Dekont Tarihi ile Operasyon Tarihini Ayır

Mevcut akışta bazı yerlerde ajanda tarihi dekont tarihinden besleniyor gibi görünüyor. Bunu düzelt.

Dekont tarihi mali belge tarihidir.

Operasyon tarihi ise işin yapılacağı veya rapor/görev işleminin takip edileceği tarihtir.

Bunlar farklı alanlar olacak.

Yeni İşlem ekranında ilgili bentlere göre şu alanlar bulunacak:

### C ve Ç İçin

- İşlem / denetim tarihi
- İşlem / denetim saati
- Yer / adres
- Talep eden kişi / kurum
- İşlem adedi veya rapor adedi

Ajanda bu operasyon tarihinden beslenecek.

### D İçin

- Görev tarihi
- Başlama saati
- Görev yeri
- Etkinlik / faaliyet adı
- Polis sayısı
- Görev süresi

Ajanda bu görev tarihinden beslenecek.

### E Kredi Kullanımı İçin

- Patlatma tarihi
- Patlatma saati
- İşletmeci
- Taş ocağı
- Kullanılacak kredi / patlatma adedi

Ajanda bu patlatma tarihinden beslenecek.

### F İçin

- Rapor / işlem tarihi
- Talep eden
- Alt tür
- Trafik ise sigorta şirketi ve alt başvurular

Ajanda bu operasyon tarihinden beslenecek.

Dekont tarihi hiçbir zaman otomatik ajanda tarihi olarak kullanılmayacak.

## 6. D Bendi Alanlarını Güçlendir

D bendi sadece polis sayısı ve görev süresi alanlarından ibaret kalmayacak.

D bendi seçildiğinde şu alanlar net görünecek:

- Talep eden kişi / kurum
- Etkinlik / faaliyet adı
- Görev tarihi
- Başlama saati
- Görev yeri
- Polis sayısı
- Görev süresi: tam saat
- Açıklama / görev notu

Kurallar:

- Polis sayısı pozitif tam sayı olacak.
- Yarım personel girilemez.
- Görev süresi pozitif tam saat olacak.
- Buçuklu saat girilemez.
- Görev tarihi zorunlu.
- Görev yeri zorunlu.

## 7. Ödenen Tutar Kontrolünü Güçlendir

Dekont / ödeme bilgisi bölümünde `Ödenen tutar` hesaplanan tutarla kontrol edilecek.

Kurallar:

- Ödenen tutar boş olamaz.
- Ödenen tutar pozitif olmalı.
- Ödenen tutar hesaplanan tutardan düşükse kayıt oluşturulamaz.
- Ödenen tutar hesaplanan tutarla eşleşmiyorsa uyarı göster.
- Fazla ödeme varsa uyarı göster: `Ödenen tutar hesaplanan tutardan fazladır. Mali onay/politika gerektirir.`
- Demo için fazla ödeme durumunda kayıt engellenebilir veya özel uyarı ile gösterilebilir; tercih edilen davranış: kayıt butonunu pasif yap ve kullanıcıya farkı göster.

Örnek uyarı:

`Hesaplanan tutar: 7.089,30 TL`
`Ödenen tutar: 7.000,00 TL`
`Eksik ödeme nedeniyle kayıt oluşturulamaz.`

## 8. Dekont Dosya Önizlemesini Gerçekçi Hale Getir

Mevcut demo dosya yükleme alanı doğru yerde. Ancak dosya modalı yalnız simülasyon gibi kalmışsa bunu güçlendir.

Dosya yüklendikten sonra dosya kartında şunlar görünecek:

- Dosya adı
- Dosya türü: PDF / JPG / PNG
- Dosya boyutu
- Yükleme yöntemi: Personel ekranı veya QR/link
- Yükleme zamanı

Dosya kartına tıklanınca modal açılacak.

Modal içinde:

- PDF ise PDF önizleme alanı göster
- JPG ise görsel önizleme alanı göster
- PNG ise görsel önizleme alanı göster

MagicPatterns gerçek dosya içeriğini okuyamıyorsa bile modal gerçek dosya görüntüleme davranışını temsil etmeli. “Demo ortamında içerik simüle edilir” notu olabilir; fakat kullanıcı dosyaya tıklayınca PDF/JPG/PNG için ayrı önizleme deneyimi görmeli.

Yanlış dosya, işlem kaydedilmeden önce `Dosyayı kaldır` butonu ile kaldırılabilecek.

İşlem kaydedildikten sonra serbest silme olmayacak; yetki ve audit log gerektiği iş kuralı olarak gösterilecek.

## 9. Dekont Dosyası Olmadan Kayıt Asla Olmayacak

Bu kural tüm ödeme gerektiren kayıtlar için kesin korunacak.

Kredi kullanımı hariç tüm yeni kayıt türlerinde şu alanlar tamamlanmadan `İşlemi kaydet` aktif olmayacak:

- Dekont no
- Banka
- Dekont tarihi
- Ödenen tutar
- Ödeme yapan
- Dijital dekont dosyası

Kredi kullanımı özel durumdur:

- E bendi kredi kullanımında yeniden ödeme alınmaz.
- Kredi kullanımında dekont aranmaz.
- Çünkü ödeme/dekont daha önce kredi yükleme kaydında alınmıştır.
- Ancak sistem yeterli kredi kontrolü yapar.

## 10. E Bendi Kredi Kullanılabilirlik Durumunu Netleştir

Taş ocağı kredi modelinde kredi yükleme ve kredi kullanımı ayrımı doğru kurulmuş. Fakat kredi yüklenir yüklenmez kullanılabilir mi, bu arayüzde net görünmeli.

Bu demo için şu kuralı uygula:

- Kredi yükleme kaydı, dekont ve ödeme bilgisi tamamlanınca oluşturulur.
- Kredi yükleme kaydı `Ödeme Doğrulama Bekliyor` veya `Makbuz Bekliyor` durumunda başlar.
- Makbuz üretildiğinde veya ödeme doğrulandığında kredi `Kullanılabilir Kredi` haline gelir.
- Kredi kullanımı sırasında sadece kullanılabilir kredi düşülür.
- Henüz doğrulanmamış / makbuz bekleyen kredi, kalan toplamda ayrı gösterilir ama kullanılabilir krediye eklenmez.

İşletmeci kartında üç ayrı kredi bilgisi göster:

- Toplam yüklenen kredi
- Kullanılabilir kredi
- Kullanılan kredi
- Kalan kullanılabilir kredi

Eğer bunu karmaşık yapacaksan en azından kartta şu ayrımı göster:

- Ödeme alınan kredi
- Kullanılmış kredi
- Kalan kredi
- Doğrulama bekleyen kredi

Kredi kullanımı yapılırken sistem net uyarı versin:

`Kullanılabilir kredi yetersiz. Önce kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.`

## 11. Taş Ocağı Ekranlarını Kalite Seviyesine Çıkar

Taş Ocağı İşletmecileri ekranında her işletmeci kartında şu bilgiler net görünmeli:

- İşletmeci adı
- Şahıs / şirket türü
- Kimlik / vergi / şirket no
- Telefon
- Adres
- Yetkili kişi
- Bağlı taş ocağı sayısı
- Toplam yüklenen kredi
- Kullanılabilir kredi
- Kullanılmış kredi
- Kalan kredi
- Aktif / pasif durum

Her işletmeci detayında bağlı taş ocakları listesi ve kredi hareketleri görünsün.

Taş Ocağı Kartları ekranında:

- Taş ocağı adı
- Bağlı işletmeci
- Ruhsat no
- Bölge
- Adres / konum
- Sorumlu kişi
- Telefon
- Aktif / pasif
- Notlar

görünsün.

Kredi Hareketleri ekranında:

- Hareket tipi: yükleme / kullanım
- İşletmeci
- Taş ocağı
- Kayıt no
- Dekont no
- Makbuz no
- Kredi adedi
- Tarih
- Önceki kredi
- Sonraki kredi
- Açıklama

bulunsun.

## 12. E Bendi Yeni İşlem Akışını Güçlendir

E bendi seçildiğinde işlem türü sorulacak:

1. Patlatma kredisi yükleme / ödeme alma
2. Patlatma kullanımı / görev kaydı

### Patlatma Kredisi Yükleme

Alanlar:

- İşletmeci / sahip
- Kaç patlatmalık ödeme yapılacak?
- 1 patlatma bedeli: BAÜ x %10
- Toplam tutar
- Dekont bilgileri
- Dijital dekont dosyası
- QR/link ile dekont yükleme seçeneği
- Makbuz süreci

Kayıt numarası:

`EKRD-2026-000001`

### Patlatma Kullanımı

Alanlar:

- İşletmeci / sahip
- Taş ocağı
- Patlatma tarihi
- Patlatma saati
- Patlatma adedi / kullanılacak kredi
- Açıklama / görev notu

Kayıt numarası:

`EKUL-2026-000001`

Kural:

- Kredi kullanımı için yeniden ödeme/dekont istenmez.
- Yeterli kullanılabilir kredi yoksa kayıt oluşturulamaz.
- Kullanım oluşturulduğunda kredi işletmeci hesabından düşer.
- Kredi taş ocağına değil işletmeciye bağlıdır.
- Aynı işletmeciye bağlı farklı taş ocakları aynı ortak krediden kullanır.

## 13. Ajanda Mantığını Düzelt

Ajanda banka/dekont işleri için değil, operasyonel görev ve işlem takibi için olacak.

Ajandaya düşecekler:

- C
- Ç
- D
- E kredi kullanımı
- F

Ajandaya otomatik düşmeyecekler:

- A
- B
- E kredi yükleme

E bendi için:

- Kredi yükleme mali işlemdir, ajandaya düşmez.
- Patlatma kullanımı operasyonel işlemdir, ajandaya düşer.

Ajanda kartlarında operasyon tarihi ve saati görünsün; dekont tarihi ajanda tarihi olarak kullanılmasın.

Ajanda kartlarında şu bilgiler olsun:

- Kayıt no
- Bent
- İşlem türü
- Talep eden / işletmeci
- Birim
- Tarih
- Saat
- Yer / taş ocağı / görev yeri
- Durum
- Ödeme / kredi durumu

## 14. Ödeme / Makbuz Ekranını Daha Net Yap

Ödeme / Makbuz ekranında kayıtlar şu mantıkla ayrışsın:

- Makbuz bekleyenler
- Makbuz kesilenler
- Ödeme doğrulama bekleyenler
- İşlem başlatılabilir olanlar

Makbuz üretme yetkisi olmayan kullanıcı butonu pasif görsün.

Makbuz no sistem tarafından üretiliyor gibi gösterilecek.

Aynı kayda ikinci makbuz üretilemeyecek.

Makbuz çıktısı iki nüsha mantığıyla gösterilecek:

- Nüsha 1: Ödemeyi yapana verilir
- Nüsha 2: Kaydı yapan birimin fiziksel dosyasına konur

TTRF ana kayıtlarında alt başvurular makbuz dökümü içinde ek liste olarak görünsün.

E bendi kredi yükleme makbuzunda:

- İşletmeci
- Yüklenen kredi sayısı
- 1 patlatma bedeli
- Toplam ödeme
- Dekont no
- Makbuz no
- Kredi kullanılabilecek bağlı taş ocakları

görünsün.

## 15. Audit Log’u Güçlendir

Aşağıdaki hareketler audit log’da temsil edilmeli:

- Giriş yapıldı
- BAÜ güncellendi
- QR/link oluşturuldu
- Dekont yüklendi
- Dekont dosyası görüntülendi
- Kayıt öncesi dekont kaldırıldı
- Kayıt oluşturuldu
- Ödeme doğrulandı
- Makbuz üretildi
- Makbuz görüntülendi
- Trafik ana TTRF oluşturuldu
- Trafik alt başvuru oluşturuldu
- Taş ocağı kredi yüklendi
- Taş ocağı kredi kullanılabilir yapıldı
- Taş ocağı kredi kullanıldı
- Kredi yetersiz işlem engellendi
- Ajanda kaydı oluşturuldu
- Ajanda durumu değiştirildi
- Arşiv manifest simülasyonu oluşturuldu

## 16. İş Kuralları Ekranını Güncelle

İş Kuralları ekranında aşağıdaki maddeler açıkça yer alsın:

- Kayıt numarası kullanıcı tarafından yazılmaz.
- Makbuz numarası kullanıcı tarafından yazılmaz.
- Gerçek sistemde numaralar merkezi online sistem tarafından transaction, sequence, unique constraint ve idempotency ile üretilecektir.
- Offline makbuz üretimi yoktur.
- Dekont dosyası olmadan ödeme gerektiren kayıt oluşturulamaz.
- QR/link ayrı menü değildir, dijital dekont alanının içindedir.
- Trafik raporları yalnızca sigorta şirketi kartlarına bağlı açılır.
- TTRF alt başvurularına ayrı makbuz kesilmez.
- E bendi kredi taş ocağına değil işletmeciye bağlıdır.
- Aynı işletmeciye bağlı tüm taş ocakları ortak krediden kullanır.
- Kredi kullanımı ajandaya düşer, kredi yükleme ajandaya düşmez.
- Dekont tarihi mali tarih, operasyon tarihi ajanda tarihidir.

## 17. Görsel Kalite Düzeltmeleri

Demo/prototip daha kurumsal ve premium görünmeli.

Şunları iyileştir:

- Kartlar arası boşluklar dengeli olsun.
- Tablolar okunabilir olsun.
- Kritik durumlar rozetlerle gösterilsin.
- Hesaplama kutuları belirgin olsun.
- Hata / uyarı / başarı mesajları net olsun.
- Mobil görünümde menü ve formlar bozulmasın.
- Modal pencereler temiz ve anlaşılır olsun.
- Kullanıcı baktığında iş akışını sezgisel olarak anlayabilsin.

## Özellikle Yapma

- Projeyi baştan kurma.
- Mevcut ekranları silme.
- Ayrı QR Dekont Yükleme menüsü ekleme.
- Trafik başvurusunu bireysel veya avukat başvurusuna açma.
- Alt trafik başvurularına ayrı makbuz üretme.
- Dekont dosyası olmadan kayıt oluşturma.
- BAÜ değerini 34.000 TL bırakma.
- Operasyon tarihi yerine dekont tarihini ajandaya yazma.
- E bendi kredi modelini basit adet hesabına düşürme.
- Test senaryosu veya test metodu yazma.
- Gerçek backend entegrasyonu yapmaya çalışma.

## Beklenen Sonuç

Mevcut KTPGV demo/prototip projesi, aşağıdaki kaliteye ulaşmış olmalı:

- BAÜ doğru: `70.893,00 TL`
- Tüm hesaplamalar bu BAÜ’ye göre doğru görünür
- Trafik alt başvuruları gerçek satırlarla girilebilir
- Dekont tarihi ve operasyon tarihi ayrılmıştır
- D bendi görev detayları eksiksizdir
- Ödenen tutar hesaplanan tutarla kontrol edilir
- Dekont dosyası modal içinde gerçekçi görüntülenir
- Taş ocağı kredi modeli işletmeci bazında düzgün çalışır
- Kredi yükleme ve kredi kullanımı net ayrılmıştır
- Kredi kullanılabilirlik durumu anlaşılırdır
- Ajanda doğru operasyon tarihinden beslenir
- Ödeme / Makbuz ekranı daha net ve kurumsaldır
- Audit log daha güçlüdür
- İş Kuralları ekranı nihai kararları açıkça anlatır
- Demo, gerçek sisteme geçmeden önce kararları gösterebilecek profesyonel prototip seviyesine gelir