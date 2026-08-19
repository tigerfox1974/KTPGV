/** Para birimi her yerde "TL" olarak yazılır. ₺ sembolü kullanılmaz. */
export function formatTL(tutar: number): string {
  return `${tutar.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} TL`;
}

/**
 * Birim tutarlarda (örn. D bendi kişi/saat bedeli) gereksiz yuvarlama yapmadan
 * en fazla 3 ondalık gösterir: 354,465 TL
 */
export function formatTLHassas(tutar: number): string {
  return `${tutar.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  })} TL`;
}

export function formatSayi(deger: number): string {
  return deger.toLocaleString('tr-TR');
}

export function formatTarih(iso: string): string {
  if (!iso) return '—';
  const [yil, ay, gun] = iso.split('-');
  if (!yil || !ay || !gun) return iso;
  return `${gun}.${ay}.${yil}`;
}