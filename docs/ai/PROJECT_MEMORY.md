# KTPGV — Project Memory

Bu dosya projenin kalıcı hafızasıdır. Zaman içinde alınmış ve geliştirme sırasında unutulmaması gereken doğrulanmış kararlar burada tutulur.

## Proje kimliği
- Sistem Kıbrıs Türk Polis Güçlendirme Vakfı (KTPGV) gelir ve operasyon süreçlerini destekler.
- Vakıf gelirleri KTPGV Vakıf hesaplarına yatırılır.
- Sistem ada genelinde çok kullanıcılı ve merkezi kontrol edilebilir bir web uygulaması olarak tasarlanır.

## Temel finans kuralları
- Para birimi gösteriminde `TL` kullanılır; `₺` kullanılmaz.
- BAÜ değeri yönetim ekranından güncellenebilir olmalı ve güncelleme ilgili tüm hesaplamalara merkezi olarak yansımalıdır.
- Güncel çalışma referansı: `BAÜ = 70.893 TL`.
- Banka hesapları TL hesap kartları olarak gösterilir.

## Temel ödeme kuralı
- Ana prensip: **Önce ödeme, sonra işlem.**
- Hizmet bedeli Vakıf hesabına yatırılmadan ve dekont dijital olarak kaydedilip kontrol edilmeden ilgili polis işlemi başlatılamaz / kayıt tamamlanamaz.
- Fiziksel dekont tek başına yeterli değildir; dijital sisteme de kaydedilir.
- Dekont ve makbuz aynı şey değildir.

## Dekont akışı
- Ayrı/global bir “QR Dekont Yükleme” menüsü kullanılmaz.
- QR yükleme ilgili işlemin kendi dijital dekont bölümünde bulunur.
- Doğrudan dosya yükleme ve QR üzerinden telefonla yükleme birlikte desteklenir.
- Hedef dosya türleri: PDF, JPG, PNG.
- Hedef maksimum dosya boyutu: 5 MB.
- Büyük görseller mümkün olduğunca görünür kalite kaybı olmadan optimize edilir.
- Yüklenen dekont ilgili kaydın dekont listesinde hemen görünmelidir.
- PDF/JPG/PNG önizleme modalı desteklenir.
- Yanlış dosya kayıt tamamlanmadan önce silinebilir.
- Dekont olmadan kayıt tamamlanmamalıdır.
- Dekont alanlarında dekont no, banka bilgisi, dekont tarihi ve gerekli banka referans bilgileri tutulabilir.

## Makbuz
- Makbuz bilgileri mevcut Ödeme / Makbuz alanında yönetilir.
- Makbuz kesme/girme yetkisi rol ve birim bazlıdır.
- Merkez/Vakıf adminleri ve yetkilendirilmiş birimler makbuz işlemi yapabilir.
- Yetkili saha birimleri sistem tarafından üretilen benzersiz makbuzu yazdırabilir.
- Kayıt no ve makbuz no eşzamanlı kullanımda benzersiz kalmalıdır.

## Yetkilendirme
- Kullanıcı adı/şifre ile giriş modeli esas alınır.
- Kullanıcının rolü/birimi hangi bentleri ve ekranları görebileceğini belirler.
- Bent–birim eşlemesi yapılandırılabilir olmalıdır; sabit kod içine gömülmemelidir.
- Ara onay makamı yoktur; süreç yetkili kullanıcı/birim ve merkez kontrolü üzerinden yürür.

## Bent E — Taş Ocakları
- Taş ocağı / firma kartı oluşturma ve işlemle ilişkilendirme desteklenmelidir.
- Ön ödemeler “patlatma hakkı/kredisi” üretir.
- Bir ödeme bir veya birden fazla patlatma hakkı satın alabilir.
- Her gerçekleşen patlatma 1 kredi tüketir.
- Aynı işletmeci/kişiye bağlı birden fazla taş ocağı ortak kredi havuzunu kullanabilir.

## Bent F — Adli ve Trafik Raporları
- F tek benttir ancak Adli ve Trafik ayrı iş akışlarıdır.
- Trafik başvuruları yalnızca sigorta şirketlerinden gelir.
- Her sigorta şirketinin ayrı kartı olmalı ve Trafik kayıtları bu karta bağlanmalıdır.
- Adli başvurularda kişi, avukat, sigorta şirketi vb. başvuru tipleri olabilir.
- Trafik toplu işlem numaralandırma modeli: ana kayıt örneği `TTRF-2026-000045`; alt kayıtlar `TTRF-2026-000045-001`, `-002`, `-003` şeklinde devam eder.

## Bent D — Yol Kapama / Güvenlik Tedbiri
- Bir işlem içinde birden fazla görev dilimi olabilir.
- Her görev diliminde polis sayısı × saat hesabı yapılır ve toplam hizmet bedeline eklenir.
- Polis sayısı en fazla 3 basamak, görev süresi saat en fazla 2 basamak olarak girilir.
- Polis-saat ara toplamı görev dilimi bazında görünür olmalıdır.

## UI ve doğrulama
- Yeni işlem ekranı varsayılan bent seçili olmadan açılır.
- Kayıt sonrası form temizlenir.
- Sayısal alanlarda uygun doğrulamalar uygulanır.
- Personel ve saat alanları tam sayıdır.
- Bağımlı alanlardan önce gerekli ön koşul alanları gösterilir.
- Tüm para girişleri binlik ve ondalık ayırıcılarıyla okunabilir biçimde gösterilir.
- “Bend” terimi değiştirilmez.
- Bent seçimlerinde kod + açıklama birlikte ve tutarlı gösterilir.
- UI temiz, dengeli ve simetrik tutulur.

## Mimari yön
- Hedef merkezi çok kullanıcılı web mimarisi: Supabase + Vercel yaklaşımı.
- Dosya arşivleme ve mali yıl bazlı dışa aktarma/silme akışları planlanabilir.

## Hafıza bakım kuralı
Bu dosyaya yalnızca kalıcı, onaylanmış ve gelecekte tekrar kullanılacak kararlar eklenir. Geçici kararlar önce `DECISION_LOG.md` içinde tutulur.
