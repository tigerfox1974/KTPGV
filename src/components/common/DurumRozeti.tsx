import React from 'react';
import { AjandaDurumu, IslemDurumu } from '../../types';

const ISLEM_ETIKETLERI: Record<IslemDurumu, string> = {
  ODEME_BEKLIYOR: 'Ödeme Doğrulama Bekliyor',
  MAKBUZ_BEKLIYOR: 'Makbuz Bekliyor',
  ODEME_DOGRULANDI: 'Ödeme Doğrulandı',
  ISLEM_BASLATILABILIR: 'İşlem Başlatılabilir',
  TAMAMLANDI: 'Tamamlandı',
  IPTAL: 'İptal'
};

const ISLEM_STILLERI: Record<IslemDurumu, string> = {
  ODEME_BEKLIYOR: 'bg-amber-50 text-amber-700 border-amber-200',
  MAKBUZ_BEKLIYOR: 'bg-orange-50 text-orange-700 border-orange-200',
  ODEME_DOGRULANDI: 'bg-sky-50 text-sky-700 border-sky-200',
  ISLEM_BASLATILABILIR: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  TAMAMLANDI: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  IPTAL: 'bg-rose-50 text-rose-700 border-rose-200'
};

const AJANDA_STILLERI: Record<AjandaDurumu, string> = {
  'Planlandı': 'bg-sky-50 text-sky-700 border-sky-200',
  'Sonuç Bekliyor': 'bg-amber-50 text-amber-700 border-amber-200',
  'İşlem Başlatılabilir': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Görev Tamamlandı': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Yapıldı': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Yapılmadı': 'bg-slate-100 text-slate-700 border-slate-200',
  'Ertelendi': 'bg-amber-50 text-amber-700 border-amber-200',
  'İptal Edildi': 'bg-rose-50 text-rose-700 border-rose-200'
};

const TEMEL =
'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap';

export function IslemDurumRozeti({ durum }: {durum: IslemDurumu;}) {
  return <span className={`${TEMEL} ${ISLEM_STILLERI[durum]}`}>{ISLEM_ETIKETLERI[durum]}</span>;
}

export function AjandaDurumRozeti({ durum }: {durum: AjandaDurumu;}) {
  return <span className={`${TEMEL} ${AJANDA_STILLERI[durum]}`}>{durum}</span>;
}

export function AktiflikRozeti({ aktif }: {aktif: boolean;}) {
  return (
    <span
      className={`${TEMEL} ${
      aktif ?
      'bg-emerald-50 text-emerald-700 border-emerald-200' :
      'bg-muted text-muted-foreground border-border'}`
      }>
      
      {aktif ? 'Aktif' : 'Pasif'}
    </span>);

}

export function BilgiRozeti({ metin, ton = 'notr' }: {metin: string;ton?: 'notr' | 'olumlu' | 'uyari' | 'hata';}) {
  const stiller = {
    notr: 'bg-muted text-muted-foreground border-border',
    olumlu: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    uyari: 'bg-amber-50 text-amber-700 border-amber-200',
    hata: 'bg-rose-50 text-rose-700 border-rose-200'
  };
  return <span className={`${TEMEL} ${stiller[ton]}`}>{metin}</span>;
}

export function ISLEM_DURUM_ETIKETI(durum: IslemDurumu): string {
  return ISLEM_ETIKETLERI[durum];
}