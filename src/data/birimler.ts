import { Birim, BirimTuru } from '../types';

export const birimTurleri: {deger: BirimTuru;etiket: string;}[] = [
{ deger: 'MERKEZ', etiket: 'Merkez' },
{ deger: 'MUDURLUK', etiket: 'Müdürlük' },
{ deger: 'SUBE', etiket: 'Şube' },
{ deger: 'KARAKOL', etiket: 'Karakol' },
{ deger: 'MALI_ISLER', etiket: 'Mali işler' },
{ deger: 'DENETIM', etiket: 'Denetim' },
{ deger: 'DIGER', etiket: 'Diğer' }];


export function birimTuruEtiketi(tur: BirimTuru): string {
  return birimTurleri.find((t) => t.deger === tur)?.etiket ?? 'Diğer';
}

export const baslangicBirimleri: Birim[] = [
{
  id: 'br-merkez',
  ad: 'KTPGV Merkez',
  kod: 'MRK',
  tur: 'MERKEZ',
  bentler: ['A', 'B', 'C', 'Ç', 'D', 'E', 'F'],
  makbuzUretebilir: true,
  raporGorebilir: true,
  ajandaKullanabilir: true,
  aktif: true,
  aciklama: 'Vakıf merkez yönetimi. Tüm bentlerde işlem ve makbuz yetkisine sahiptir.'
},
{
  id: 'br-mali',
  ad: 'KTPGV Mali İşler',
  kod: 'MALI',
  tur: 'MALI_ISLER',
  ustBirimId: 'br-merkez',
  bentler: ['A', 'B'],
  makbuzUretebilir: true,
  raporGorebilir: true,
  ajandaKullanabilir: false,
  aktif: true,
  aciklama: 'Ödeme doğrulama, dekont kontrolü ve makbuz üretim merkezi.'
},
{
  id: 'br-trafik',
  ad: 'PGM Trafik Müdürlüğü',
  kod: 'TRF',
  tur: 'MUDURLUK',
  ustBirimId: 'br-merkez',
  bentler: ['F'],
  makbuzUretebilir: true,
  raporGorebilir: true,
  ajandaKullanabilir: true,
  aktif: true,
  aciklama: 'F bendi trafik polis raporları. Başvurular yalnız sigorta şirketi kartına bağlıdır.'
},
{
  id: 'br-itfaiye',
  ad: 'PGM İtfaiye Müdürlüğü',
  kod: 'ITF',
  tur: 'MUDURLUK',
  ustBirimId: 'br-merkez',
  bentler: ['C', 'Ç'],
  makbuzUretebilir: true,
  raporGorebilir: true,
  ajandaKullanabilir: true,
  aktif: true,
  aciklama: 'C denetim/kontrol ve Ç yangın risk raporu işlemleri.'
},
{
  id: 'br-karakol-mgs',
  ad: 'Gazimağusa İlçe Karakolu',
  kod: 'MGS',
  tur: 'KARAKOL',
  ustBirimId: 'br-merkez',
  bentler: ['D', 'F'],
  makbuzUretebilir: false,
  raporGorebilir: false,
  ajandaKullanabilir: true,
  aktif: true,
  aciklama: 'Yol kapama / güvenlik tedbiri ve adli rapor işlemleri. Makbuz merkezde üretilir.'
},
{
  id: 'br-tasocagi',
  ad: 'KTPGV Taş Ocağı Birimi',
  kod: 'TAS',
  tur: 'SUBE',
  ustBirimId: 'br-merkez',
  bentler: ['E'],
  makbuzUretebilir: true,
  raporGorebilir: true,
  ajandaKullanabilir: true,
  aktif: true,
  aciklama: 'E bendi patlatma kredisi yükleme, planlama ve gerçekleşme raporu işlemleri.'
},
{
  id: 'br-denetim',
  ad: 'Denetim',
  kod: 'DNT',
  tur: 'DENETIM',
  ustBirimId: 'br-merkez',
  bentler: [],
  makbuzUretebilir: false,
  raporGorebilir: true,
  ajandaKullanabilir: false,
  aktif: true,
  aciklama: 'Sadece görüntüleme ve rapor yetkisi.'
}];