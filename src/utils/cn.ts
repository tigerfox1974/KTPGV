import { twMerge } from 'tailwind-merge';

type SinifDegeri = string | number | null | undefined | false | SinifDegeri[];

/** Tailwind sınıflarını çakışmasız birleştirir. */
export function cn(...siniflar: SinifDegeri[]): string {
  const duz: string[] = [];
  const gez = (deger: SinifDegeri) => {
    if (!deger) return;
    if (Array.isArray(deger)) {
      deger.forEach(gez);
      return;
    }
    duz.push(String(deger));
  };
  siniflar.forEach(gez);
  return twMerge(duz.join(' '));
}