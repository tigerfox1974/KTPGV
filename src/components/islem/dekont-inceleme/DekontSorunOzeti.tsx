import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { DekontAlanAdi } from '../../../types';
import { BilgiRozeti } from '../../common/DurumRozeti';
import { DEKONT_ALAN_ETIKETLERI, DekontSorunu } from './helpers';

interface DekontSorunOzetiProps {
  sorunlar: DekontSorunu[];
  onSorunSec?: (alan: DekontAlanAdi) => void;
}

export function DekontSorunOzeti({ sorunlar, onSorunSec }: DekontSorunOzetiProps) {
  if (!sorunlar.length) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-900">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <p className="text-sm font-medium">Şu an için öncelikli sorun görünmüyor.</p>
        </div>
        <p className="mt-1 text-xs text-emerald-800">
          Yine de OCR sonucu otomatik onay sayılmaz; zorunlu alanları kullanıcı olarak doğrulayın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Sorun Özeti</p>
          <p className="text-xs text-muted-foreground">Öncelikli alanlar üstte listelenir.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <BilgiRozeti
            metin={`${sorunlar.filter((sorun) => sorun.seviye === 'hata').length} kritik`}
            ton={sorunlar.some((sorun) => sorun.seviye === 'hata') ? 'hata' : 'notr'}
          />
          <BilgiRozeti
            metin={`${sorunlar.filter((sorun) => sorun.seviye === 'uyari').length} uyarı`}
            ton={sorunlar.some((sorun) => sorun.seviye === 'uyari') ? 'uyari' : 'notr'}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {sorunlar.map((sorun) => {
          const ton =
            sorun.seviye === 'hata'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : sorun.seviye === 'uyari'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-sky-200 bg-sky-50 text-sky-900';
          const ikon =
            sorun.seviye === 'bilgi' ? (
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            );
          return (
            <li key={sorun.id}>
              <button
                type="button"
                disabled={!sorun.alan}
                onClick={() => sorun.alan && onSorunSec?.(sorun.alan)}
                className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left ${ton} ${
                  sorun.alan ? 'transition hover:shadow-sm' : ''
                }`}>
                {ikon}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{sorun.baslik}</p>
                    {sorun.alan && (
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium">
                        {DEKONT_ALAN_ETIKETLERI[sorun.alan]}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs opacity-90">{sorun.aciklama}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
