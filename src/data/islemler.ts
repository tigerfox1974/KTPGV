import { Islem } from '../types';

export const baslangicIslemleri: Islem[] = [
{
  id: 'is-1',
  kayitNo: 'TTRF-2026-000045',
  bent: 'F',
  fAltTur: 'TRAFIK',
  baslik: 'Toplu trafik raporu başvurusu (3 dosya)',
  talepEden: 'Kıbrıs Sigorta Ltd.',
  birim: 'PGM Trafik Müdürlüğü',
  olusturan: 'PGM Trafik Müdürlüğü',
  olusturmaTarihi: '2026-08-14',
  tutar: 1020,
  hesaplamaAciklamasi: 'BAÜ x %1 = 340,00 TL rapor başı tutar x 3 rapor = 1.020,00 TL',
  dekont: {
    dekontNo: '556123900',
    banka: 'Kıbrıs Vakıflar Bankası',
    tarih: '2026-08-14',
    odenenTutar: 1020,
    odemeYapan: 'Kıbrıs Sigorta Ltd.',
    dosya: {
      ad: 'dekont-556123900.pdf',
      tur: 'PDF',
      boyutKb: 412,
      yontem: 'QR_LINK',
      yuklemeZamani: '14.08.2026 11:24'
    }
  },
  makbuzNo: 'BM-2026-000141',
  makbuzUreten: 'Vakıf Muhasebe',
  durum: 'ISLEM_BASLATILABILIR',
  sigortaSirketiId: 'sg-1',
  altBasvurular: [
  { no: 'TTRF-2026-000045-001', dosyaKonusu: 'Maddi hasarlı kaza', plaka: 'LF 421', kazaTarihi: '2026-07-28' },
  { no: 'TTRF-2026-000045-002', dosyaKonusu: 'Yaralanmalı kaza', plaka: 'GR 118', kazaTarihi: '2026-08-01' },
  { no: 'TTRF-2026-000045-003', dosyaKonusu: 'Maddi hasarlı kaza', plaka: 'MG 903', kazaTarihi: '2026-08-05' }]

},
{
  id: 'is-2',
  kayitNo: 'TTRF-2026-000046',
  bent: 'F',
  fAltTur: 'TRAFIK',
  baslik: 'Tekli trafik raporu başvurusu',
  talepEden: 'Anadolu Akdeniz Sigorta',
  birim: 'PGM Trafik Müdürlüğü',
  olusturan: 'PGM Trafik Müdürlüğü',
  olusturmaTarihi: '2026-08-17',
  tutar: 340,
  hesaplamaAciklamasi: 'BAÜ x %1 = 340,00 TL rapor başı tutar x 1 rapor = 340,00 TL',
  dekont: {
    dekontNo: '778100234',
    banka: 'Kooperatif Merkez Bankası',
    tarih: '2026-08-17',
    odenenTutar: 340,
    odemeYapan: 'Anadolu Akdeniz Sigorta',
    dosya: {
      ad: 'dekont-778100234.jpg',
      tur: 'JPG',
      boyutKb: 1840,
      yontem: 'QR_LINK',
      yuklemeZamani: '17.08.2026 09:12'
    }
  },
  makbuzNo: null,
  durum: 'ODEME_DOGRULANDI',
  sigortaSirketiId: 'sg-2',
  altBasvurular: [
  { no: 'TTRF-2026-000046-001', dosyaKonusu: 'Maddi hasarlı kaza', plaka: 'LN 776', kazaTarihi: '2026-08-11' }]

},
{
  id: 'is-3',
  kayitNo: 'C-2026-000008',
  bent: 'C',
  baslik: 'İtfaiye denetim ve kontrol raporu',
  talepEden: 'Palm Beach Otel',
  birim: 'PGM İtfaiye Müdürlüğü',
  olusturan: 'İtfaiye Birimi',
  olusturmaTarihi: '2026-08-12',
  tutar: 1360,
  hesaplamaAciklamasi: 'BAÜ x %2 = 680,00 TL işlem başı tutar x 2 işlem = 1.360,00 TL',
  dekont: {
    dekontNo: '330091822',
    banka: 'Kıbrıs Vakıflar Bankası',
    tarih: '2026-08-12',
    odenenTutar: 1360,
    odemeYapan: 'Palm Beach Otel',
    dosya: {
      ad: 'itfaiye-dekont.pdf',
      tur: 'PDF',
      boyutKb: 302,
      yontem: 'PERSONEL',
      yuklemeZamani: '12.08.2026 15:40'
    }
  },
  makbuzNo: 'BM-2026-000139',
  makbuzUreten: 'İtfaiye Birimi',
  durum: 'TAMAMLANDI'
},
{
  id: 'is-4',
  kayitNo: 'D-2026-000004',
  bent: 'D',
  baslik: 'Yol kapama ve güvenlik tedbiri — festival',
  talepEden: 'Girne Belediyesi',
  birim: 'Gazimağusa İlçe Karakolu',
  olusturan: 'İlçe / Karakol Kullanıcısı',
  olusturmaTarihi: '2026-08-16',
  tutar: 1020,
  hesaplamaAciklamasi: '6 polis x 2 saat x 85,00 TL (BAÜ x %0,5) = 1.020,00 TL',
  dekont: {
    dekontNo: '901238877',
    banka: 'Limasol Türk Kooperatif Bankası',
    tarih: '2026-08-16',
    odenenTutar: 1020,
    odemeYapan: 'Girne Belediyesi',
    dosya: {
      ad: 'belediye-dekont.png',
      tur: 'PNG',
      boyutKb: 2450,
      yontem: 'PERSONEL',
      yuklemeZamani: '16.08.2026 10:05',
      sikistirildi: true
    }
  },
  makbuzNo: null,
  durum: 'ODEME_BEKLIYOR'
},
{
  id: 'is-5',
  kayitNo: 'EKRD-2026-000015',
  bent: 'E',
  eIslemTuru: 'KREDI_YUKLEME',
  baslik: 'Patlatma kredisi yükleme — 7 kredi',
  talepEden: 'Ahmet Kaya',
  birim: 'KTPGV Taş Ocağı Birimi',
  olusturan: 'Taş Ocağı İşlemleri Yetkilisi',
  olusturmaTarihi: '2026-08-18',
  tutar: 23800,
  hesaplamaAciklamasi: 'BAÜ x %10 = 3.400,00 TL (1 patlatma bedeli) x 7 kredi = 23.800,00 TL',
  dekont: {
    dekontNo: '987654321',
    banka: 'Kıbrıs Vakıflar Bankası',
    tarih: '2026-08-18',
    odenenTutar: 23800,
    odemeYapan: 'Ahmet Kaya',
    dosya: {
      ad: 'kredi-dekont-987654321.pdf',
      tur: 'PDF',
      boyutKb: 520,
      yontem: 'PERSONEL',
      yuklemeZamani: '18.08.2026 13:31'
    }
  },
  makbuzNo: 'BM-2026-000144',
  makbuzUreten: 'Vakıf Muhasebe',
  durum: 'TAMAMLANDI',
  isletmeciId: 'im-1',
  krediAdedi: 7
},
{
  id: 'is-6',
  kayitNo: 'EKUL-2026-000031',
  bent: 'E',
  eIslemTuru: 'KREDI_KULLANIM',
  baslik: 'Patlatma kullanımı — Alfa Taş Ocağı',
  talepEden: 'Ahmet Kaya',
  birim: 'KTPGV Taş Ocağı Birimi',
  olusturan: 'Taş Ocağı İşlemleri Yetkilisi',
  olusturmaTarihi: '2026-08-20',
  tutar: 0,
  hesaplamaAciklamasi: 'Kredi kullanımı — yeniden ödeme alınmaz. 1 kredi düşüldü.',
  dekont: {
    dekontNo: 'EKRD-2026-000015',
    banka: '—',
    tarih: '2026-08-18',
    odenenTutar: 0,
    odemeYapan: 'Ön ödemeli kredi',
    dosya: {
      ad: 'kredi-dekont-987654321.pdf',
      tur: 'PDF',
      boyutKb: 520,
      yontem: 'PERSONEL',
      yuklemeZamani: '18.08.2026 13:31'
    }
  },
  makbuzNo: null,
  durum: 'ISLEM_BASLATILABILIR',
  isletmeciId: 'im-1',
  tasOcagiId: 'to-1',
  krediAdedi: 1
},
{
  id: 'is-7',
  kayitNo: 'A-2026-000003',
  bent: 'A',
  baslik: 'Kurumsal bağış',
  talepEden: 'Lefkoşa Ticaret Odası',
  birim: 'KTPGV Mali İşler',
  olusturan: 'Vakıf Muhasebe',
  olusturmaTarihi: '2026-08-10',
  tutar: 50000,
  hesaplamaAciklamasi: 'A bendi — sabit oran yoktur, tutar manuel girildi: 50.000,00 TL',
  dekont: {
    dekontNo: '112233445',
    banka: 'Kooperatif Merkez Bankası',
    tarih: '2026-08-10',
    odenenTutar: 50000,
    odemeYapan: 'Lefkoşa Ticaret Odası',
    dosya: {
      ad: 'bagis-dekont.pdf',
      tur: 'PDF',
      boyutKb: 288,
      yontem: 'PERSONEL',
      yuklemeZamani: '10.08.2026 16:02'
    }
  },
  makbuzNo: 'BM-2026-000136',
  makbuzUreten: 'Vakıf Muhasebe',
  durum: 'TAMAMLANDI'
}];