export interface KuralGrubu {
  baslik: string;
  kurallar: string[];
}

export const isKurallari: KuralGrubu[] = [
{
  baslik: 'Nihai Kararlar',
  kurallar: [
  'Kayıt numarası kullanıcı tarafından yazılmaz.',
  'Makbuz numarası kullanıcı tarafından yazılmaz.',
  'Gerçek sistemde numaralar merkezi online sistem tarafından transaction, sequence, unique constraint ve idempotency ile üretilecektir.',
  'Offline makbuz üretimi yoktur.',
  'Dekont dosyası olmadan ödeme gerektiren kayıt oluşturulamaz.',
  'QR/link ayrı bir menü değildir, dijital dekont alanının içindedir.',
  'Trafik raporları yalnızca sigorta şirketi kartlarına bağlı açılır.',
  'TTRF alt başvurularına ayrı makbuz kesilmez.',
  'E bendi kredi taş ocağına değil işletmeciye bağlıdır.',
  'Aynı işletmeciye bağlı tüm taş ocakları ortak krediden kullanır.',
  'Patlatma planlama ajandaya düşer, kredi yükleme ajandaya düşmez.',
  'Dekont tarihi mali tarihtir; operasyon tarihi ajanda tarihidir.',
  'Kredi düşümü planlama aşamasında değil, patlatma “Yapıldı” olarak işlendiğinde yapılır.']

},
{
  baslik: 'E Bendi — Patlatma Kredisi Akışı',
  kurallar: [
  'Kredi yükleme (EKRD): ödeme alınır, dekont ve makbuz süreci işler; ödeme doğrulanınca veya makbuz kesilince kredi kullanılabilir olur.',
  'Patlatma planlama (EKPL): plan kaydı açılır, kredi düşülmez; kredi “planlanan / rapor bekleyen” olarak izlenir.',
  'Patlatma sonucu (EKGR): patlatmanın yapıldığı bilgisi işlenir ve kredi bu aşamada düşer.',
  'Patlatma bilgisi sözlü, telefonla, yazılı veya görevli personel bildirimiyle gelebilir; belge ve dosya zorunlu değildir, bilgi kaynağı ise kayda geçer.',
  'Sonuç işlenirken kullanılabilir kredi yetersizse kayıt tamamlanmaz; kredi yükleme / ödeme doğrulama / makbuz süreci gerekir.',
  'Yapıldı sonucunda ajanda kaydı “Yapıldı” olur ve audit log’a kredi düşüm hareketi yazılır.',
  'Yapılmadı, ertelendi ve iptal sonuçlarında kredi düşülmez; ertelemede kart yeni tarih ve saate taşınır.',
  'Patlatmaların günlük takibi Patlatma Takvimi ekranından yapılır; sonuç kart üzerinden tek tıkla işlenir.',
  'Planlama ve sonuç kayıtlarında yeniden ödeme, dekont veya makbuz istenmez.']

},
{
  baslik: 'Veri Görünürlüğü ve Yetki',
  kurallar: [
  'Menü görünürlüğü ile veri görünürlüğü ayrıdır; menüyü gizlemek yeterli değildir, ekran ve kayıt erişimi de korunur.',
  'Merkez Admin tüm kayıtları görür ve tüm işlemleri yapabilir.',
  'Denetçi tüm kayıtları görür ancak hiçbir kaydı oluşturamaz veya değiştiremez.',
  'Vakıf Muhasebe / Mali İşler tüm mali kayıtları görür; operasyonel kayıtları değiştiremez.',
  'Birim kullanıcıları yalnız kendi birimine ve yetkili olduğu bentlere ait kayıtları görür.',
  'PGM Trafik Müdürlüğü F / Trafik kayıtlarını görür; ayrıca yetki verilmedikçe F / Adli kayıtları görmez.',
  'Kayıt detayına adres elle yazılarak yetkisiz erişim yapılamaz.',
  'Yetki filtresi veriyi silmez; Merkez Admin ile giriş yapıldığında tüm veri yine görünür.',
  'Makbuz üretme, ödeme doğrulama ve ajanda işlemleri yalnız kullanıcının kapsamındaki kayıtlarda aktiftir.',
  'Audit Log’da hedef kayıt kullanıcıya görünmüyorsa audit satırı da görünmez.']

},
{
  baslik: 'Kullanıcı ve Birim Yönetimi',
  kurallar: [
  'Giriş kullanıcı adı ve şifre iledir; e-posta ile giriş modeli yoktur.',
  'Kullanıcı adı ve şifre boş olamaz; aynı kullanıcı adıyla ikinci kullanıcı oluşturulamaz.',
  'Pasif kullanıcı giriş yapamaz ancak listede pasif etiketiyle görünür.',
  'Kullanıcı ve birim silinmez, pasife alınır.',
  'Pasif birim listeden kaybolmaz; yeni kullanıcı atamalarında seçilemez.',
  'Atanmış kullanıcısı olan birim pasife alınırken uyarı gösterilir.',
  'Kullanıcı ve birim yönetimi yalnız Merkez Admin ve yetkilendirilmiş üst kullanıcılarda açıktır.',
  'Yetkiler ekranı bilgilendirme amaçlıdır; düzenleme Kullanıcı Yönetimi ve Birim Yönetimi ekranlarından yapılır.']

},
{
  baslik: 'Ödeme / Makbuz Ekranı Kapsamı',
  kurallar: [
  'Ödeme / Makbuz ekranında yalnız ödeme doğuran mali kayıtlar ana satır olarak görünür.',
  'A, B, C, Ç, D, F / Adli, F / Trafik ana TTRF ve E / EKRD kredi yükleme kayıtları listelenir.',
  'Patlatma planlama ve patlatma sonucu kayıtları ana satır olarak görünmez.',
  'EKRD kayıt detayında bağlı planlı ve gerçekleşmiş patlatmalar ile kredi hareketleri gösterilir.']

},
{
  baslik: 'Temel İlke',
  kurallar: [
  'Ödeme/dekont süreci tamamlanmadan işlem kaydı oluşturulmaz.',
  'Dekont dosyası olmadan işlem asla kayda alınmaz.',
  'Ödeme, makbuz ve işlem süreçleri rol, birim ve bent yetkisine göre yönetilir.',
  'Hatalı veya eksik veri ile işlem kaydı oluşturulmaz.',
  'Ödenen tutar hesaplanan tutardan düşükse veya fazlaysa kayıt oluşturulamaz; fark kullanıcıya gösterilir.']

},
{
  baslik: 'Tarih Ayrımı',
  kurallar: [
  'Dekont tarihi mali belge tarihidir.',
  'Operasyon tarihi işin yapılacağı / takip edileceği tarihtir.',
  'Ajanda yalnızca operasyon tarihinden beslenir.',
  'C ve Ç: işlem / denetim tarihi ve saati, yer bilgisi zorunludur.',
  'D: görev tarihi, başlama saati ve görev yeri zorunludur.',
  'E kredi kullanımı: patlatma tarihi ve saati zorunludur.',
  'F: rapor / işlem tarihi zorunludur.']

},
{
  baslik: 'Dekont ve Dosya Kuralları',
  kurallar: [
  'Kabul edilen dosya türleri: PDF, JPG, PNG.',
  'Maksimum dosya boyutu 5 MB.',
  'PDF 5 MB üzerindeyse reddedilir.',
  'JPG/PNG 5 MB üzerindeyse kalite kaybı fazla olmadan 5 MB altına indirilir.',
  'Dosya yüklenmeden kayıt butonu aktif olmaz.',
  'Kayıt öncesinde yanlış dosya "Dosyayı kaldır" ile silinebilir.',
  'Kayıt sonrasında serbest silme yoktur; yetki ve audit log gerektirir.',
  'Ayrı QR Dekont Yükleme menüsü yoktur; QR/link yalnızca işlem formunun Dijital Dekont Dosyası alanındadır.']

},
{
  baslik: 'Benzersiz Numara Mantığı',
  kurallar: [
  'Kayıt numarası kullanıcı tarafından yazılmaz.',
  'Makbuz numarası kullanıcı tarafından yazılmaz.',
  'Numaralar merkezi online sistem tarafından üretilir.',
  'Aynı anda iki kullanıcı işlem yapsa bile aynı numara verilmez.',
  'PostgreSQL transaction, sequence, unique constraint, idempotency ve audit log ile numara çakışması önlenir.',
  'Offline makbuz üretimi yoktur.']

},
{
  baslik: 'Makbuz Kuralları',
  kurallar: [
  'Makbuz üretme yetkisi rol ve birime bağlıdır; her kullanıcı makbuz üretemez.',
  'Yetkililer: Merkez Admin, Vakıf Muhasebe ve yetki verilmiş ilgili birimler.',
  'Bazı bentlerde makbuz merkezi değil, ilgili birimde üretilir.',
  'Makbuz iki nüsha mantığındadır: Nüsha 1 ödemeyi yapana, Nüsha 2 kaydı yapan birimin fiziksel dosyasına.',
  'Aynı kayda ikinci makbuz üretilemez.']

},
{
  baslik: 'Trafik Raporu Kuralları',
  kurallar: [
  'Trafik raporları sadece sigorta şirketlerinden alınır.',
  'Bireysel, avukat, başka kurum veya serbest başvuru türü yoktur.',
  'Sigorta şirketi seçilmeden trafik raporu kaydı oluşturulamaz.',
  'Tekli başvuru bile TTRF ana kayıt mantığıyla açılır.',
  'Ödeme, dekont ve makbuz ana TTRF kaydına bağlanır.',
  'Alt başvurulara ayrı makbuz kesilmez; ayrı TRF serisi kullanılmaz.',
  'Ödeme / Makbuz ekranında tek ana TTRF satırı görünür, alt başvurular açılır detayda gösterilir.']

},
{
  baslik: 'E Bendi — Taş Ocağı Kredi Modeli',
  kurallar: [
  '1 patlatma kredisi = BAÜ x %10.',
  'Ödeme önceden alınır ve patlatma kredisi olarak yüklenir.',
  'Kredi taş ocağına değil, işletmeci/sahip hesabına bağlıdır.',
  'Aynı işletmeciye bağlı farklı taş ocakları ortak krediden düşer.',
  'Kredi yüklemede dekont ve ödeme bilgileri zorunludur.',
  'Yüklenen kredi, ödeme doğrulanana veya makbuz üretilene kadar "doğrulama bekleyen kredi"dir; kullanılabilir krediye eklenmez.',
  'Kredi kullanımında yalnızca kullanılabilir kredi düşülür.',
  'Kullanılabilir kredi yetersizse patlatma kullanım kaydı oluşturulamaz.',
  'Makbuz kredi yükleme kaydına kesilir; patlatma kullanımında makbuz aranmaz.',
  'Kredi yükleme ajandaya düşmez, patlatma kullanımı ajandaya düşer.']

},
{
  baslik: 'Ajanda Kuralları',
  kurallar: [
  'Ajanda banka işleri için değil, operasyonel görev/işlem takibi içindir.',
  'Otomatik düşen bentler: C, Ç, D, E kullanım kayıtları ve F.',
  'A ve B bentleri otomatik ajandaya düşmez.',
  'Durumlar: Planlandı, İşlem Başlatılabilir, Görev Tamamlandı, Ertelendi, İptal Edildi.']

},
{
  baslik: 'Mali Yıl Arşiv Kuralları',
  kurallar: [
  'İşlem kayıtları silinmez.',
  'Eski mali yıl dosyaları export edilir.',
  'Manifest oluşturulur ve hash/bütünlük bilgisi tutulur.',
  'Arşiv doğrulanmadan dosya silinmez.',
  'Dosya arşivlense bile işlem kaydı, makbuz no, dekont no ve audit geçmişi sistemde kalır.']

},
{
  baslik: 'Teknik Notlar (Demo Kapsamı)',
  kurallar: [
  'Bu bir tıklanabilir demo/prototiptir; gerçek veritabanı, storage veya authentication bağlantısı yoktur.',
  'Program dili Türkçedir, para birimi her yerde TL olarak yazılır.',
  'Açılışta hiçbir bent otomatik seçili değildir; ilk seçenek "Lütfen bent seçiniz"dir.',
  'Kaydet sonrası yeni işlem formu sıfırlanır.',
  'Brüt asgari ücret sistem ayarındadır ve demo içinde değiştirilebilir.']

}];