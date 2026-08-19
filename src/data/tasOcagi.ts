import { Isletmeci, KrediHareketi, TasOcagi } from '../types';

export const isletmeciler: Isletmeci[] = [
{
  id: 'im-1',
  ad: 'Ahmet Kaya',
  tur: 'SAHIS',
  kimlikNo: '11223344556',
  telefon: '0533 220 14 05',
  adres: 'Değirmenlik, Lefkoşa',
  yetkiliKisi: 'Ahmet Kaya',
  aktif: true
},
{
  id: 'im-2',
  ad: 'Beyaz Taş Madencilik Ltd.',
  tur: 'SIRKET',
  kimlikNo: 'KKTC-5590231',
  telefon: '0392 444 78 12',
  adres: 'Alayköy Sanayi Bölgesi, Lefkoşa',
  yetkiliKisi: 'Sevgi Baytar',
  aktif: true
}];


export const tasOcaklari: TasOcagi[] = [
{
  id: 'to-1',
  ad: 'Alfa Taş Ocağı',
  isletmeciId: 'im-1',
  ruhsatNo: 'RUH-2024-0118',
  bolge: 'Lefkoşa',
  adres: 'Değirmenlik yolu 4. km',
  sorumluKisi: 'Ahmet Kaya',
  telefon: '0533 220 14 05',
  aktif: true,
  notlar: 'Hafta içi 09:00-17:00 patlatma yapılabilir.'
},
{
  id: 'to-2',
  ad: 'Kaya I Taş Ocağı',
  isletmeciId: 'im-1',
  ruhsatNo: 'RUH-2023-0912',
  bolge: 'Girne',
  adres: 'Karaağaç bölgesi',
  sorumluKisi: 'Murat Kaya',
  telefon: '0542 118 66 71',
  aktif: true,
  notlar: ''
},
{
  id: 'to-3',
  ad: 'Güney Blok Taş Ocağı',
  isletmeciId: 'im-1',
  ruhsatNo: 'RUH-2025-0044',
  bolge: 'Gazimağusa',
  adres: 'Mormenekşe yolu',
  sorumluKisi: 'İsmail Doğan',
  telefon: '0533 907 41 20',
  aktif: true,
  notlar: 'Okul yakınlığı nedeniyle 08:00 öncesi patlatma yapılmaz.'
},
{
  id: 'to-4',
  ad: 'Beyaz Blok Ocağı',
  isletmeciId: 'im-2',
  ruhsatNo: 'RUH-2024-0771',
  bolge: 'Lefke',
  adres: 'Yeşilyurt sapağı',
  sorumluKisi: 'Sevgi Baytar',
  telefon: '0392 444 78 12',
  aktif: true,
  notlar: ''
}];


export const krediHareketleri: KrediHareketi[] = [
{
  id: 'kh-1',
  isletmeciId: 'im-1',
  tip: 'YUKLEME',
  adet: 7,
  kayitNo: 'EKRD-2026-000015',
  dekontNo: '987654321',
  makbuzNo: 'BM-2026-000144',
  tarih: '2026-08-18',
  aciklama: '7 patlatmalık ön ödeme alındı, makbuz kesildi.'
},
{
  id: 'kh-2',
  isletmeciId: 'im-1',
  tip: 'KULLANIM',
  adet: 1,
  kayitNo: 'EKUL-2026-000031',
  tasOcagiId: 'to-1',
  tarih: '2026-08-20',
  aciklama: 'Alfa Taş Ocağı — planlı patlatma.'
},
{
  id: 'kh-3',
  isletmeciId: 'im-1',
  tip: 'KULLANIM',
  adet: 1,
  kayitNo: 'EKUL-2026-000032',
  tasOcagiId: 'to-3',
  tarih: '2026-08-21',
  aciklama: 'Güney Blok Taş Ocağı — planlı patlatma.'
},
{
  id: 'kh-4',
  isletmeciId: 'im-2',
  tip: 'YUKLEME',
  adet: 3,
  kayitNo: 'EKRD-2026-000016',
  dekontNo: '445512309',
  tarih: '2026-08-19',
  aciklama: '3 patlatmalık ön ödeme alındı (ödeme doğrulaması bekliyor).'
}];


export function isletmeciBul(id?: string): Isletmeci | undefined {
  return isletmeciler.find((i) => i.id === id);
}

export function tasOcagiBul(id?: string): TasOcagi | undefined {
  return tasOcaklari.find((t) => t.id === id);
}