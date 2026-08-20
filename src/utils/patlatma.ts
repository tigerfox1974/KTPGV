import { BilgiKaynagi } from '../types';

/**
 * Patlatma bilgisi her zaman yazılı raporla gelmez; sözlü bildirim, telefon veya
 * görevli personel bildirimi de geçerli kaynaktır. Bu nedenle belge/dosya zorunlu değildir,
 * bilgi kaynağı ise her sonuç işleminde seçilir.
 */
export const BILGI_KAYNAKLARI: {deger: BilgiKaynagi;etiket: string;}[] = [
{ deger: 'SOZLU', etiket: 'Sözlü bildirim' },
{ deger: 'TELEFON', etiket: 'Telefon bildirimi' },
{ deger: 'YAZILI', etiket: 'Yazılı bildirim' },
{ deger: 'PERSONEL', etiket: 'Görevli personel bildirimi' },
{ deger: 'DIGER', etiket: 'Diğer' }];


export function bilgiKaynagiEtiketi(kaynak?: BilgiKaynagi): string {
  return BILGI_KAYNAKLARI.find((k) => k.deger === kaynak)?.etiket ?? '—';
}