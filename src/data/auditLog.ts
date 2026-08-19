import { AuditKaydi } from '../types';

export const baslangicAuditKayitlari: AuditKaydi[] = [
{ id: 'au-1', zaman: '18.08.2026 13:35', kullanici: 'Vakıf Muhasebe', eylem: 'Makbuz üretildi', hedef: 'BM-2026-000144 / EKRD-2026-000015' },
{ id: 'au-2', zaman: '18.08.2026 13:31', kullanici: 'Taş Ocağı İşlemleri Yetkilisi', eylem: 'Taş ocağı kredi yüklendi', hedef: 'Ahmet Kaya · +7 kredi' },
{ id: 'au-3', zaman: '18.08.2026 13:28', kullanici: 'Taş Ocağı İşlemleri Yetkilisi', eylem: 'Dekont yüklendi', hedef: 'kredi-dekont-987654321.pdf (Personel ekranı)' },
{ id: 'au-4', zaman: '17.08.2026 09:12', kullanici: 'Başvuru Sahibi (QR/link)', eylem: 'Dekont yüklendi', hedef: 'dekont-778100234.jpg (QR/link)' },
{ id: 'au-5', zaman: '17.08.2026 09:04', kullanici: 'PGM Trafik Müdürlüğü', eylem: 'QR/link oluşturuldu', hedef: 'TTRF-2026-000046' },
{ id: 'au-6', zaman: '17.08.2026 09:02', kullanici: 'PGM Trafik Müdürlüğü', eylem: 'TTRF ana kayıt oluşturuldu', hedef: 'TTRF-2026-000046' },
{ id: 'au-7', zaman: '14.08.2026 11:30', kullanici: 'PGM Trafik Müdürlüğü', eylem: 'Trafik alt başvuru oluşturuldu', hedef: 'TTRF-2026-000045-003' },
{ id: 'au-8', zaman: '14.08.2026 11:26', kullanici: 'PGM Trafik Müdürlüğü', eylem: 'Kayıt öncesi dekont kaldırıldı', hedef: 'yanlis-dekont.jpg' },
{ id: 'au-9', zaman: '12.08.2026 15:45', kullanici: 'Denetçi', eylem: 'Rapor görüntülendi', hedef: 'Bent bazlı gelir raporu' },
{ id: 'au-10', zaman: '12.08.2026 15:41', kullanici: 'İtfaiye Birimi', eylem: 'Dekont dosyası görüntülendi', hedef: 'itfaiye-dekont.pdf' },
{ id: 'au-11', zaman: '10.08.2026 16:10', kullanici: 'Merkez Admin', eylem: 'Arşiv manifest simülasyonu oluşturuldu', hedef: 'Mali Yıl 2025' },
{ id: 'au-12', zaman: '10.08.2026 08:00', kullanici: 'Merkez Admin', eylem: 'Giriş yapıldı', hedef: 'admin' }];


export const auditEylemleri = [
'giriş yapıldı',
'kayıt oluşturuldu',
'dekont yüklendi',
'dekont dosyası görüntülendi',
'kayıt öncesi dekont kaldırıldı',
'QR/link oluşturuldu',
'makbuz üretildi',
'ödeme doğrulandı',
'işlem başlatılabilir yapıldı',
'TTRF ana kayıt oluşturuldu',
'trafik alt başvuru oluşturuldu',
'taş ocağı işletmeci kartı oluşturuldu',
'taş ocağı kartı oluşturuldu',
'taş ocağı kredi yüklendi',
'taş ocağı kredi kullanıldı',
'taş ocağı kullanım kaydı ertelendi',
'taş ocağı kullanım kaydı iptal edildi',
'rapor görüntülendi',
'arşiv manifest simülasyonu oluşturuldu'];