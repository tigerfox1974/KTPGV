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
  const temiz = iso.trim();
  const tarihParcasi = temiz.split(/[ T]/)[0];
  const [yil, ay, gun] = tarihParcasi.split('-');
  if (!yil || !ay || !gun) return iso;
  return `${gun}.${ay}.${yil}`;
}

export function formatTarihSaat(tarih: string, saat?: string): string {
  if (!tarih) return '—';
  const temizTarih = tarih.trim();
  const [tarihParcasi, saatParcasi] = temizTarih.split(/[ T]/);
  const gorunenTarih = formatTarih(tarihParcasi);
  const gorunenSaat = saat || saatParcasi;
  return gorunenSaat ? `${gorunenTarih} · ${gorunenSaat}` : gorunenTarih;
}

/**
 * Kullanıcının yazdığı / yapıştırdığı metni sayıya çevirir.
 * Desteklenen girişler: "70893", "70893,5", "70.893,50", "70.893,50 TL",
 * "70893.50", "70,893.50". Negatif değer kabul edilmez.
 * Değer okunamazsa null döner.
 */
export function parseTL(metin: string): number | null {
  if (metin === null || metin === undefined) return null;
  let temiz = String(metin).
  replace(/tl/gi, '').
  replace(/\s|\u00a0/g, '').
  replace(/[^0-9.,]/g, '');

  if (!temiz) return null;

  const sonVirgul = temiz.lastIndexOf(',');
  const sonNokta = temiz.lastIndexOf('.');

  if (sonVirgul !== -1 && sonNokta !== -1) {
    // Her iki ayırıcı da var: sondaki ondalık ayırıcıdır.
    const ondalikIndex = Math.max(sonVirgul, sonNokta);
    const tamKisim = temiz.slice(0, ondalikIndex).replace(/[.,]/g, '');
    const ondalik = temiz.slice(ondalikIndex + 1).replace(/[.,]/g, '');
    temiz = `${tamKisim}.${ondalik}`;
  } else if (sonVirgul !== -1) {
    // Türkçe ondalık ayırıcı
    temiz = temiz.replace(/,/g, (_, i) => i === sonVirgul ? '.' : '');
  } else if (sonNokta !== -1) {
    const ondalikBasamak = temiz.length - sonNokta - 1;
    const noktaSayisi = temiz.split('.').length - 1;
    if (noktaSayisi > 1 || ondalikBasamak === 3) {
      // 70.893 veya 1.234.567 → binlik ayırıcı
      temiz = temiz.replace(/\./g, '');
    }
  }

  const sayi = Number(temiz);
  if (!Number.isFinite(sayi)) return null;
  return sayi < 0 ? 0 : sayi;
}

/** Para alanı odaklandığında gösterilen, kolay düzenlenebilir metin: 70893,50 */
export function paraDuzenlemeMetni(tutar: number | null): string {
  if (tutar === null || tutar === undefined || Number.isNaN(tutar)) return '';
  return tutar.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  });
}