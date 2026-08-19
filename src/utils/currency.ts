/** Para birimi her yerde "TL" olarak yazılır. ₺ sembolü kullanılmaz. */
export function formatTL(tutar: number): string {
  return `${tutar.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} TL`;
}

export function formatSayi(deger: number): string {
  return deger.toLocaleString('tr-TR');
}

export function formatTarih(iso: string): string {
  const [yil, ay, gun] = iso.split('-');
  if (!yil || !ay || !gun) return iso;
  return `${gun}.${ay}.${yil}`;
}