import { BentKodu, EIslemTuru, FAltTur, Islem } from '../types';

const MALI_YIL = 2026;

/**
 * Kayıt ve makbuz numaraları kullanıcı tarafından yazılmaz.
 * Gerçek sistemde merkezi online sistem tarafından
 * transaction + sequence + unique constraint ile üretilir.
 */
export function seriKodu(
bent: BentKodu,
fAltTur?: FAltTur | '',
eIslemTuru?: EIslemTuru | '')
: string {
  if (bent === 'E') return eIslemTuru === 'KREDI_KULLANIM' ? 'EKUL' : 'EKRD';
  if (bent === 'F') return fAltTur === 'TRAFIK' ? 'TTRF' : 'FADL';
  return bent;
}

function pad(sayi: number): string {
  return sayi.toString().padStart(6, '0');
}

export function sonrakiKayitNo(
islemler: Islem[],
bent: BentKodu,
fAltTur?: FAltTur | '',
eIslemTuru?: EIslemTuru | '')
: string {
  const seri = seriKodu(bent, fAltTur, eIslemTuru);
  const onEk = `${seri}-${MALI_YIL}-`;
  const mevcut = islemler.
  filter((i) => i.kayitNo.startsWith(onEk)).
  map((i) => parseInt(i.kayitNo.slice(onEk.length).split('-')[0], 10)).
  filter((n) => !Number.isNaN(n));
  const sonraki = (mevcut.length ? Math.max(...mevcut) : 0) + 1;
  return `${onEk}${pad(sonraki)}`;
}

export function altBasvuruNo(anaKayitNo: string, sira: number): string {
  return `${anaKayitNo}-${sira.toString().padStart(3, '0')}`;
}

export function sonrakiMakbuzNo(islemler: Islem[]): string {
  const onEk = `BM-${MALI_YIL}-`;
  const mevcut = islemler.
  map((i) => i.makbuzNo).
  filter((no): no is string => !!no && no.startsWith(onEk)).
  map((no) => parseInt(no.slice(onEk.length), 10)).
  filter((n) => !Number.isNaN(n));
  const sonraki = (mevcut.length ? Math.max(...mevcut) : 0) + 1;
  return `${onEk}${pad(sonraki)}`;
}