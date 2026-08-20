import { Islem } from '../types';

/** Tutarlar BAÜ = 70.893,00 TL üzerinden hesaplanmıştır. */
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
  operasyonTarihi: '2026-08-19',
  operasyonSaati: '11:00',
  yer: 'PGM Trafik Müdürlüğü — Lefkoşa',
  tutar: 2126.79,
  hesaplamaAciklamasi:
  'BAÜ x %1 = 708,93 TL rapor başı tutar · 708,93 TL x 3 rapor = 2.126,79 TL',
  dekont: {
    dekontNo: '556123900',
    banka: 'Kıbrıs Vakıflar Bankası',
    tarih: '2026-08-14',
    odenenTutar: 2126.79,
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
  {
    no: 'TTRF-2026-000045-001',
    plaka: 'LF 421',
    hasarDosyaNo: 'HS-2026-11840',
    kazaTarihi: '2026-07-28',
    raporKonusu: 'Maddi hasarlı kaza',
    raporTutari: 708.93
  },
  {
    no: 'TTRF-2026-000045-002',
    plaka: 'GR 118',
    hasarDosyaNo: 'HS-2026-11902',
    kazaTarihi: '2026-08-01',
    raporKonusu: 'Yaralanmalı kaza',
    raporTutari: 708.93
  },
  {
    no: 'TTRF-2026-000045-003',
    plaka: 'MG 903',
    hasarDosyaNo: 'HS-2026-12044',
    kazaTarihi: '2026-08-05',
    raporKonusu: 'Maddi hasarlı kaza',
    raporTutari: 708.93
  }]

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
  operasyonTarihi: '2026-08-24',
  operasyonSaati: '10:30',
  yer: 'PGM Trafik Müdürlüğü — Girne',
  tutar: 708.93,
  hesaplamaAciklamasi:
  'BAÜ x %1 = 708,93 TL rapor başı tutar · 708,93 TL x 1 rapor = 708,93 TL',
  dekont: {
    dekontNo: '778100234',
    banka: 'Kooperatif Merkez Bankası',
    tarih: '2026-08-17',
    odenenTutar: 708.93,
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
  durum: 'MAKBUZ_BEKLIYOR',
  sigortaSirketiId: 'sg-2',
  altBasvurular: [
  {
    no: 'TTRF-2026-000046-001',
    plaka: 'LN 776',
    hasarDosyaNo: 'HS-2026-12310',
    kazaTarihi: '2026-08-11',
    raporKonusu: 'Maddi hasarlı kaza',
    raporTutari: 708.93
  }]

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
  operasyonTarihi: '2026-08-19',
  operasyonSaati: '09:00',
  yer: 'Palm Beach Otel — Gazimağusa',
  tutar: 2835.72,
  hesaplamaAciklamasi:
  'BAÜ x %2 = 1.417,86 TL işlem başı tutar · 1.417,86 TL x 2 işlem = 2.835,72 TL',
  dekont: {
    dekontNo: '330091822',
    banka: 'Kıbrıs Vakıflar Bankası',
    tarih: '2026-08-12',
    odenenTutar: 2835.72,
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
  operasyonTarihi: '2026-08-22',
  operasyonSaati: '18:00',
  yer: 'Girne sahil yolu — festival güzergâhı',
  etkinlikAdi: 'Girne Zeytin Festivali kortej yürüyüşü',
  polisSayisi: 6,
  gorevSuresi: 2,
  tutar: 4253.58,
  hesaplamaAciklamasi:
  'BAÜ x %0,5 = 354,465 TL kişi/saat · 6 polis x 2 saat x 354,465 TL = 4.253,58 TL',
  dekont: {
    dekontNo: '901238877',
    banka: 'Limasol Türk Kooperatif Bankası',
    tarih: '2026-08-16',
    odenenTutar: 4253.58,
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
  tutar: 49625.1,
  hesaplamaAciklamasi:
  'BAÜ x %10 = 7.089,30 TL (1 patlatma bedeli) · 7.089,30 TL x 7 kredi = 49.625,10 TL',
  dekont: {
    dekontNo: '987654321',
    banka: 'Kıbrıs Vakıflar Bankası',
    tarih: '2026-08-18',
    odenenTutar: 49625.1,
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
  kayitNo: 'EKPL-2026-000031',
  bent: 'E',
  eIslemTuru: 'KREDI_PLANLAMA',
  baslik: 'Planlı patlatma — Alfa Taş Ocağı',
  talepEden: 'Ahmet Kaya',
  birim: 'KTPGV Taş Ocağı Birimi',
  olusturan: 'Taş Ocağı İşlemleri Yetkilisi',
  olusturmaTarihi: '2026-08-19',
  operasyonTarihi: '2026-08-20',
  operasyonSaati: '10:00',
  yer: 'Alfa Taş Ocağı — Lefkoşa',
  tutar: 0,
  hesaplamaAciklamasi:
  'Patlatma planı — kredi henüz düşülmedi. Kredi düşümü patlatma “Yapıldı” olarak işlendiğinde yapılır.',
  dekont: {
    dekontNo: 'EKRD-2026-000015',
    banka: '—',
    tarih: '2026-08-18',
    odenenTutar: 0,
    odemeYapan: 'Ön ödemeli kredi',
    dosya: null
  },
  makbuzNo: null,
  durum: 'ISLEM_BASLATILABILIR',
  isletmeciId: 'im-1',
  tasOcagiId: 'to-1',
  krediAdedi: 1,
  notlar: 'Saha ekibi patlatma sonrası raporu bildirdiğinde kredi düşümü işlenecek.'
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
},
{
  id: 'is-8',
  kayitNo: 'EKRD-2026-000016',
  bent: 'E',
  eIslemTuru: 'KREDI_YUKLEME',
  baslik: 'Patlatma kredisi yükleme — 3 kredi',
  talepEden: 'Beyaz Taş Madencilik Ltd.',
  birim: 'KTPGV Taş Ocağı Birimi',
  olusturan: 'Taş Ocağı İşlemleri Yetkilisi',
  olusturmaTarihi: '2026-08-19',
  tutar: 21267.9,
  hesaplamaAciklamasi:
  'BAÜ x %10 = 7.089,30 TL (1 patlatma bedeli) · 7.089,30 TL x 3 kredi = 21.267,90 TL',
  dekont: {
    dekontNo: '445512309',
    banka: 'Kooperatif Merkez Bankası',
    tarih: '2026-08-19',
    odenenTutar: 21267.9,
    odemeYapan: 'Beyaz Taş Madencilik Ltd.',
    dosya: {
      ad: 'beyaz-tas-dekont.pdf',
      tur: 'PDF',
      boyutKb: 366,
      yontem: 'QR_LINK',
      yuklemeZamani: '19.08.2026 10:47'
    }
  },
  makbuzNo: null,
  durum: 'ODEME_BEKLIYOR',
  isletmeciId: 'im-2',
  krediAdedi: 3
}];