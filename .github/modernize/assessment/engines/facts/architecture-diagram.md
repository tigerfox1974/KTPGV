# KTPGV Mimari Diyagramları ve İş Akışları

Bu belge, KTPGV uygulamasının mevcut React tabanlı prototip mimarisini, ana bileşen ilişkilerini ve kritik iş akışlarını Türkçe olarak görselleştirir. Diyagramlar çalışan tarayıcı içi yapıyı gösterir; henüz uygulanmamış hedef Supabase mimarisi ayrıca belirtilir.

## Uygulama Mimarisi

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart TD
    Kullanici1(("Yetkili Kullanıcı"))
    subgraph SunumKatmani1["Sunum Katmanı"]
        Tarayici1["Web Tarayıcısı"]
        Router1["React Router"]
        Yerlesim1["AppLayout"]
        Sayfalar1["Operasyon Sayfaları"]
        Yonetim1["Yönetim Sayfaları"]
        OrtakUi1["Ortak UI Bileşenleri"]
    end
    subgraph UygulamaKatmani1["Uygulama ve İş Kuralları"]
        Context1["AppContext"]
        Kimlik1["Giriş ve Oturum"]
        Yetki1["Rol Birim ve Bent Yetkisi"]
        Islem1["İşlem Kayıt Yönetimi"]
        Odeme1["Ödeme Dekont Makbuz"]
        Kredi1["Taş Ocağı Kredi Yönetimi"]
        Ajanda1["Ajanda ve Takvim"]
        Rapor1["Rapor ve Arşiv"]
        Audit1["Audit Kayıtları"]
    end
    subgraph AltyapiKatmani1["Tarayıcı Altyapısı"]
        Hesap1["BAÜ Hesaplama"]
        Numara1["Kayıt ve Makbuz Numaralama"]
        Dosya1["Dosya Yükleme ve Optimizasyon"]
        Ocr1["Dekont OCR"]
        Pdf1["PDF.js"]
        Tesseract1["Tesseract.js"]
        BrowserApi1["File Canvas Crypto API"]
    end
    subgraph VeriKatmani1["Mevcut Veri Katmanı"]
        Seed1[("TypeScript Örnek Verileri")]
        Bellek1[("React Bellek Durumu")]
        DosyaBellek1[("Blob URL ve ArrayBuffer")]
    end
    subgraph HedefKatman1["Planlanan Üretim Katmanı"]
        SupabaseAuth1[("Supabase Auth")]
        Postgres1[("Supabase PostgreSQL")]
        Storage1[("Supabase Storage")]
    end

    Kullanici1 -->|"uygulamayı kullanır"| Tarayici1
    Tarayici1 -->|"route isteği"| Router1
    Router1 -->|"yerleşimi açar"| Yerlesim1
    Yerlesim1 -->|"operasyon ekranları"| Sayfalar1
    Yerlesim1 -->|"yönetim ekranları"| Yonetim1
    Sayfalar1 -->|"bileşenleri kullanır"| OrtakUi1
    Yonetim1 -->|"bileşenleri kullanır"| OrtakUi1
    Sayfalar1 -->|"durum ve eylemler"| Context1
    Yonetim1 -->|"durum ve eylemler"| Context1
    Context1 -->|"girişi yönetir"| Kimlik1
    Context1 -->|"erişimi denetler"| Yetki1
    Context1 -->|"kayıtları yönetir"| Islem1
    Context1 -->|"mali süreci yönetir"| Odeme1
    Context1 -->|"kredileri yönetir"| Kredi1
    Context1 -->|"takvimi günceller"| Ajanda1
    Context1 -->|"görünür veriyi sağlar"| Rapor1
    Context1 -->|"olayları yazar"| Audit1
    Islem1 -->|"tutar hesaplar"| Hesap1
    Islem1 -->|"numara üretir"| Numara1
    Odeme1 -->|"dosya işler"| Dosya1
    Dosya1 -->|"tarayıcı servisleri"| BrowserApi1
    Dosya1 -->|"geçici dosya verisi"| DosyaBellek1
    Dosya1 -->|"alan okuma"| Ocr1
    Ocr1 -->|"PDF metni"| Pdf1
    Ocr1 -->|"görsel tanıma"| Tesseract1
    Seed1 -->|"başlangıç verisi"| Context1
    Context1 -->|"oturumluk veri"| Bellek1
    Kimlik1 -.->|"gelecek entegrasyon"| SupabaseAuth1
    Bellek1 -.->|"gelecek kalıcı veri"| Postgres1
    DosyaBellek1 -.->|"gelecek dosya deposu"| Storage1
```

### Teknoloji Yığını Özeti

| Katman | Teknoloji | Sürüm | Görevi | Mevcut Durum |
|---|---|---:|---|---|
| Derleme | Vite | 5.2.x | Geliştirme sunucusu ve üretim paketi | Kullanılıyor |
| Arayüz | React | 18.3.x | Sayfa, form, yerleşim ve bileşen sunumu | Kullanılıyor |
| Yönlendirme | React Router DOM | 6.26.x | Tarayıcı route yapısı ve sayfa geçişleri | Kullanılıyor |
| Dil | TypeScript | 5.5.x | Sıkı tip kontrolü ve alan modelleri | Kullanılıyor |
| Stil | Tailwind CSS | 3.4.x | Yardımcı sınıf tabanlı tasarım sistemi | Kullanılıyor |
| Bildirim | Sonner | 2.0.x | Başarı, hata ve uyarı bildirimleri | Kullanılıyor |
| İkon | Lucide React | 0.522.x | Arayüz ikonları | Kullanılıyor |
| Uygulama durumu | React Context ve hook yapısı | 18.3.x | Merkezi bellek durumu, eylemler ve filtreli görünümler | Kullanılıyor |
| Yetkilendirme | Özel route ve veri kontrolleri | Proje kodu | Rol, birim, menü, bent, kayıt ve eylem denetimi | Tarayıcı içinde |
| Hesaplama | Özel TypeScript yardımcıları | Proje kodu | BAÜ oranları, tutar ve girdi doğrulama | Tarayıcı içinde |
| Belge işleme | PDF.js | 6.2.x | PDF metni ve sayfa görseli çıkarma | Tarayıcı içinde |
| OCR | Tesseract.js | 7.0.x | Türkçe ve İngilizce dekont metni tanıma | Tarayıcı içinde |
| Dosya işleme | File, Canvas ve Web Crypto API | Tarayıcı | Yükleme, önizleme, optimizasyon ve SHA-256 özeti | Tarayıcı içinde |
| Hedef kimlik | Supabase Auth | Planlanan | Merkezi kullanıcı oturumu | Henüz bağlı değil |
| Hedef veritabanı | Supabase PostgreSQL | Planlanan | Çok kullanıcılı kalıcı veri ve benzersizlik | Henüz bağlı değil |
| Hedef dosya deposu | Supabase Storage | Planlanan | Dekont ve rapor dosyalarının kalıcı saklanması | Henüz bağlı değil |

### Veri Saklama ve Dış Servisler

Mevcut çalışan uygulamada backend, kalıcı veritabanı, cache, mesaj kuyruğu veya uzak API bağlantısı yoktur. `src/data` altındaki TypeScript örnek verileri `AppContext` durumunu başlatır; kullanıcı işlemleri yalnızca açık tarayıcı oturumundaki React belleğinde tutulur ve sayfa yenilendiğinde başlangıç durumuna döner. Dekont dosyaları Blob URL ve `ArrayBuffer` olarak geçici biçimde işlenir. PDF.js ve Tesseract.js tarayıcıda çalışır; OCR sonucu tek başına ödeme doğrulaması sayılmaz.

Hedef üretim yönü Supabase Auth, PostgreSQL ve Storage kullanımıdır. Kayıt ve makbuz numarası benzersizliği, rol ve birim yetkileri, mali kayıtlar, audit izi ve dosya saklama üretimde sunucu ve veritabanı seviyesinde güvence altına alınmalıdır.

### Temel Mimari Kararlar

- `AppContext`, kullanıcı, birim, işlem, ödeme, ajanda, kredi, audit ve ana kart verileri için merkezi uygulama cephesidir.
- Menü görünürlüğü, route erişimi, kayıt görünürlüğü ve işlem yapma yetkisi ayrı ayrı denetlenir.
- Sayfalar iş akışını yönetir; hesaplama, numaralandırma, yetki, dosya ve OCR işlemleri yardımcı modüllere ayrılmıştır.
- Mevcut veri katmanı prototip amaçlı ve geçicidir; çok kullanıcılı üretim garantisi sağlamaz.
- Ana mali kural korunur: ödeme ve dijital dekont kontrolü tamamlanmadan ödeme gerektiren işlem tamamlanamaz.

## Bileşen İlişkileri

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart LR
    subgraph SunumKatmani2["Sunum"]
        App2["App ve Router"]
        Layout2["AppLayout Sidebar Topbar"]
        IslemSayfalari2["İşlem ve Kayıt Sayfaları"]
        MaliSayfalar2["Ödeme ve Rapor Sayfaları"]
        TakvimSayfalari2["Ajanda ve Takvim Sayfaları"]
        YonetimSayfalari2["Kullanıcı Birim Yetki Sayfaları"]
        KartSayfalari2["Sigorta İşletmeci Ocak Kartları"]
        DekontUi2["Dekont Bileşenleri"]
        PatlatmaUi2["Patlatma Bileşenleri"]
    end
    subgraph IsMantigi2["İş Mantığı"]
        Context2["AppContext"]
        KayitAkisi2["Kayıt Oluşturma Akışı"]
        MaliAkis2["Ödeme ve Makbuz Akışı"]
        KrediAkisi2["Kredi ve Patlatma Akışı"]
        AjandaAkisi2["Ajanda Akışı"]
        AuditAkisi2["Audit Akışı"]
    end
    subgraph Yardimcilar2["Altyapı ve Yardımcılar"]
        YetkiKapisi2["YetkiKapisi"]
        YetkiUtil2["yetki.ts"]
        HesapUtil2["hesaplama.ts"]
        NumaraUtil2["numaralandirma.ts"]
        DosyaUtil2["dosya.ts"]
        OcrUtil2["dekontOcr.ts"]
        ParaUtil2["currency.ts"]
        PatlatmaUtil2["patlatma.ts"]
    end
    subgraph VeriErisimi2["Veri ve Modeller"]
        Tipler2["types index.ts"]
        VeriModulleri2["data Modülleri"]
        ReactState2[("React State Koleksiyonları")]
    end

    App2 -->|"yerleşimi kurar"| Layout2
    Layout2 -->|"route içeriği"| IslemSayfalari2
    Layout2 -->|"route içeriği"| MaliSayfalar2
    Layout2 -->|"route içeriği"| TakvimSayfalari2
    Layout2 -->|"route içeriği"| YonetimSayfalari2
    Layout2 -->|"route içeriği"| KartSayfalari2
    YetkiKapisi2 -.->|"route denetimi"| IslemSayfalari2
    YetkiKapisi2 -.->|"route denetimi"| MaliSayfalar2
    YetkiKapisi2 -->|"politika sorar"| YetkiUtil2
    IslemSayfalari2 -->|"durum ve eylem"| Context2
    MaliSayfalar2 -->|"durum ve eylem"| Context2
    TakvimSayfalari2 -->|"durum ve eylem"| Context2
    YonetimSayfalari2 -->|"durum ve eylem"| Context2
    KartSayfalari2 -->|"durum ve eylem"| Context2
    IslemSayfalari2 -->|"dekont alanı"| DekontUi2
    TakvimSayfalari2 -->|"sonuç girişi"| PatlatmaUi2
    Context2 -->|"koordine eder"| KayitAkisi2
    Context2 -->|"koordine eder"| MaliAkis2
    Context2 -->|"koordine eder"| KrediAkisi2
    Context2 -->|"koordine eder"| AjandaAkisi2
    Context2 -->|"olay kaydeder"| AuditAkisi2
    KayitAkisi2 -->|"tutar hesaplar"| HesapUtil2
    KayitAkisi2 -->|"numara üretir"| NumaraUtil2
    KayitAkisi2 -->|"TL ve tarih biçimler"| ParaUtil2
    MaliAkis2 -->|"yetki kontrolü"| YetkiUtil2
    KrediAkisi2 -->|"kredi kuralları"| PatlatmaUtil2
    DekontUi2 -->|"dosya hazırlar"| DosyaUtil2
    DekontUi2 -->|"alanları okur"| OcrUtil2
    VeriModulleri2 -->|"başlangıç verisi"| Context2
    Tipler2 -.->|"alan tipleri"| Context2
    Context2 -->|"okur ve günceller"| ReactState2
```

### Bileşen Envanteri

| Bileşen | Katman | Tür | Temel Sorumluluk | Bağlı Olduğu Alan |
|---|---|---|---|---|
| `App.tsx` | Sunum | Uygulama kabuğu | Kullanıcı durumuna göre giriş veya route ağacını açar | Tüm uygulama |
| `AppLayout` | Sunum | Yerleşim | Sidebar, Topbar ve sayfa içeriğini bir araya getirir | Tüm yetkili ekranlar |
| `YetkiKapisi` | Sunum ve güvenlik | Route koruyucu | URL elle yazılsa bile yetkisiz ekranı engeller | Route erişimi |
| İşlem ve kayıt sayfaları | Sunum | Sayfa grubu | Yeni işlem oluşturma, kayıt listeleme ve detay görüntüleme | A, B, C, Ç, D, E, F bentleri |
| Ödeme ve rapor sayfaları | Sunum | Sayfa grubu | Mali kayıt, makbuz, rapor, arşiv ve audit görünümleri | Mali ve denetim süreçleri |
| Ajanda ve takvim sayfaları | Sunum | Sayfa grubu | Operasyon tarihleri ve patlatma sonuçlarını yönetir | C, Ç, D, E, F bentleri |
| Yönetim sayfaları | Sunum | Sayfa grubu | Kullanıcı, birim, menü, bent ve işlem yetkilerini yönetir | Yetkilendirme |
| Ana kart sayfaları | Sunum | Sayfa grubu | Sigorta şirketi, işletmeci ve taş ocağı kartlarını yönetir | F Trafik ve E bendi |
| `DekontBolumu` | Sunum | Özellik bileşeni | Dosya yükleme, OCR, alan kontrolü ve mükerrerlik uyarısı sağlar | Ödeme gerektiren kayıt |
| Patlatma bileşenleri | Sunum | Özellik bileşeni | Plan, yapıldı, yapılmadı, ertelendi ve iptal sonuçlarını alır | E bendi |
| `AppContext` | İş mantığı | Merkezi context | Durumu, eylemleri, sorguları, filtreli görünümleri ve audit akışını sunar | Tüm modüller |
| Kayıt oluşturma akışı | İş mantığı | Alan iş akışı | Ön koşulları doğrular, kayıt numarası üretir ve ilgili ajanda kaydını açar | Yeni işlem |
| Ödeme ve makbuz akışı | İş mantığı | Alan iş akışı | Dekont kanıtı, ödeme doğrulama ve makbuz durumlarını yönetir | Mali süreç |
| Kredi ve patlatma akışı | İş mantığı | Alan iş akışı | Kredi yükleme, planlama, sonuç ve tüketim hareketlerini yönetir | E bendi |
| Ajanda akışı | İş mantığı | Alan iş akışı | Operasyon tarihini, durumunu ve sonuç kaydını izler | Operasyonel bentler |
| Audit akışı | İş mantığı | Çapraz kesen işlev | Giriş, kayıt, ödeme, yönetim ve uyarı olaylarını kaydeder | Tüm kritik işlemler |
| `yetki.ts` | Altyapı | Politika fonksiyonları | Rol, birim, bent, menü, kayıt ve eylem yetkisini hesaplar | Güvenlik |
| `hesaplama.ts` | Altyapı | Alan yardımcıları | BAÜ tabanlı bedelleri ve sayısal doğrulamaları hesaplar | C, Ç, D, E, F |
| `numaralandirma.ts` | Altyapı | Alan yardımcıları | Kayıt, alt rapor ve makbuz numaralarını üretir | Kayıt süreçleri |
| `dosya.ts` | Altyapı | Tarayıcı adaptörü | Tür ve boyut kontrolü, görsel optimizasyonu ve SHA-256 üretir | Dekont ve belge |
| `dekontOcr.ts` | Altyapı | Belge adaptörü | PDF metni çıkarır, görsel OCR yapar ve alanları ayrıştırır | Dekont |
| `types/index.ts` | Veri | Alan modeli | Kullanıcı, işlem, dekont, kredi, ajanda ve ana kart tiplerini tanımlar | Tüm uygulama |
| `src/data` modülleri | Veri | Örnek veri kaynağı | Uygulamanın başlangıç koleksiyonlarını sağlar | Prototip |
| React state koleksiyonları | Veri | Geçici veri deposu | Oturum süresince kullanıcı değişikliklerini bellekte tutar | Prototip |

## Kritik İş Akışları

### Ödeme, Dekont ve Kayıt Akışı

Bu akış ödeme gerektiren standart işlem ve E bendi kredi yükleme kayıtlarında uygulanan temel kontrol sırasını gösterir.

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart TD
    AkisBaslangic3(("Yeni İşlem Başlat"))
    BentSec3["Yetkili Bent Seç"]
    KaynakGir3["Başvuru ve Operasyon Bilgilerini Gir"]
    Hesapla3["BAÜ ve Bent Kuralıyla Tutar Hesapla"]
    HesapGecerli3["Hesap Geçerli mi"]
    DosyaYukle3["PDF JPG veya PNG Dekont Yükle"]
    DosyaKontrol3["Tür Boyut ve Hash Kontrolü"]
    OcrOku3["PDF Metni veya OCR ile Alanları Oku"]
    KullaniciKontrol3["Kullanıcı Alanları Doğrular veya Düzeltir"]
    MukerrerKontrol3["No Referans ve Hash Mükerrerlik Kontrolü"]
    TutarKontrol3["Ödenen ve Hesaplanan Tutarı Karşılaştır"]
    KayitUygun3["Tüm Zorunlu Kontroller Tamam mı"]
    KayitOlustur3["Kayıt Numarası Üret ve Kaydı Oluştur"]
    MaliDurum3["Ödeme veya Makbuz Bekleyen Duruma Al"]
    AjandaKontrol3["Operasyon Ajandaya Düşer mi"]
    AjandaEkle3["Ajanda Kaydı Oluştur"]
    AuditYaz3["Audit Olaylarını Yaz"]
    AkisBitis3(("Kayıt Tamamlandı"))
    HataGoster3["Eksik veya Hatalı Alanı Göster"]

    AkisBaslangic3 -->|"başla"| BentSec3
    BentSec3 -->|"seçim yapıldı"| KaynakGir3
    KaynakGir3 -->|"bilgiler tamam"| Hesapla3
    Hesapla3 -->|"sonuç"| HesapGecerli3
    HesapGecerli3 -->|"hayır"| HataGoster3
    HataGoster3 -->|"düzelt"| KaynakGir3
    HesapGecerli3 -->|"evet"| DosyaYukle3
    DosyaYukle3 -->|"dosya seçildi"| DosyaKontrol3
    DosyaKontrol3 -->|"uygun değil"| HataGoster3
    DosyaKontrol3 -->|"uygun"| OcrOku3
    OcrOku3 -->|"önerilen alanlar"| KullaniciKontrol3
    KullaniciKontrol3 -->|"onaylandı"| MukerrerKontrol3
    MukerrerKontrol3 -->|"mükerrer"| HataGoster3
    MukerrerKontrol3 -->|"benzersiz"| TutarKontrol3
    TutarKontrol3 -->|"eşleşmiyor"| HataGoster3
    TutarKontrol3 -->|"eşleşiyor"| KayitUygun3
    KayitUygun3 -->|"hayır"| HataGoster3
    KayitUygun3 -->|"evet"| KayitOlustur3
    KayitOlustur3 -->|"mali durum belirle"| MaliDurum3
    MaliDurum3 -->|"operasyon kontrolü"| AjandaKontrol3
    AjandaKontrol3 -->|"evet"| AjandaEkle3
    AjandaKontrol3 -->|"hayır"| AuditYaz3
    AjandaEkle3 -->|"ajanda hazır"| AuditYaz3
    AuditYaz3 -->|"iz kaydı tamam"| AkisBitis3
```

### Taş Ocağı Kredi ve Patlatma Akışı

E bendinde ödeme, kredi yükleme, planlama ve gerçekleşme birbirinden ayrılır. Kredi planlama sırasında değil, yalnızca patlatma sonucu `Yapıldı` olarak işlendiğinde tüketilir.

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart TD
    KrediBaslangic4(("E Bendi Başlangıç"))
    IsletmeciSec4["İşletmeci Seç"]
    KrediYukle4["Kredi Yükleme Kaydı Oluştur"]
    OdemeDogrula4["Ödeme ve Dekontu Doğrula"]
    KrediHazir4["Kredi Kullanılabilir Olur"]
    OcakSec4["Taş Ocağı ve Tarih Seç"]
    PlanOlustur4["Patlatma Planı Oluştur"]
    KrediDusmez4["Plan Aşamasında Kredi Düşmez"]
    AjandaBekle4["Ajandada Sonuç Bekler"]
    SonucGir4["Patlatma Sonucunu Gir"]
    YapildiMi4["Sonuç Yapıldı mı"]
    ErteleIptal4["Yapılmadı Ertelendi veya İptal"]
    KrediKoru4["Kredi Bakiyesini Koru"]
    Gerceklesme4["Gerçekleşme Kaydı Oluştur"]
    KrediDus4["Krediyi Gerçekleşen Adet Kadar Düş"]
    HareketYaz4["Kredi Hareketi ve Audit Yaz"]
    KrediBitis4(("Akış Tamamlandı"))

    KrediBaslangic4 -->|"başla"| IsletmeciSec4
    IsletmeciSec4 -->|"ön ödeme"| KrediYukle4
    KrediYukle4 -->|"mali kontrol"| OdemeDogrula4
    OdemeDogrula4 -->|"doğrulandı"| KrediHazir4
    KrediHazir4 -->|"planla"| OcakSec4
    OcakSec4 -->|"bilgiler tamam"| PlanOlustur4
    PlanOlustur4 -->|"kural"| KrediDusmez4
    KrediDusmez4 -->|"takvime ekle"| AjandaBekle4
    AjandaBekle4 -->|"sonuç geldi"| SonucGir4
    SonucGir4 -->|"değerlendir"| YapildiMi4
    YapildiMi4 -->|"hayır"| ErteleIptal4
    ErteleIptal4 -->|"tüketim yok"| KrediKoru4
    KrediKoru4 -->|"iz kaydı"| HareketYaz4
    YapildiMi4 -->|"evet"| Gerceklesme4
    Gerceklesme4 -->|"tüketim"| KrediDus4
    KrediDus4 -->|"iz kaydı"| HareketYaz4
    HareketYaz4 -->|"tamam"| KrediBitis4
```

### Akışlarda Korunan İş Kuralları

- **BR-001 ve BR-015:** Ödeme ve dijital dekont olmadan ödeme gerektiren kayıt tamamlanmaz.
- **BR-002:** Dekont ödeme kanıtıdır; makbuzdan farklı bir kayıt türüdür.
- **BR-004 ve BR-005:** Tutarlar TL olarak gösterilir ve BAÜ merkezi hesaplama girdisidir.
- **BR-006:** Rol ve birim kontrolleri yalnızca menü gizlemeye bırakılmaz.
- **BR-008:** Kayıt ve makbuz numaraları üretimde veritabanı seviyesinde benzersiz olmalıdır.
- **BR-012 ve BR-013:** Ön ödeme kredi üretir; aynı işletmeciye bağlı ocaklar ortak kredi havuzunu kullanır.
- **E bendi sonucu:** Planlama kredi düşürmez; yalnızca `Yapıldı` sonucu kredi tüketir.
