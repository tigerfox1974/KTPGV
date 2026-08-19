import React from 'react';
import { Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'../ui/Dialog';
import { Button } from '../ui/Button';
import { Islem } from '../../types';
import { formatTL, formatTarih } from '../../utils/currency';
import { useApp } from '../../contexts/AppContext';

interface MakbuzModalProps {
  islem: Islem | null;
  acik: boolean;
  kapat: () => void;
}

function Nusha({ islem, nusha }: {islem: Islem;nusha: 1 | 2;}) {
  const { isletmeciBul, tasOcaklari } = useApp();
  const isletmeci = isletmeciBul(islem.isletmeciId);
  const bagliOcaklar = isletmeci ?
  tasOcaklari.filter((t) => t.isletmeciId === isletmeci.id).map((t) => t.ad) :
  [];

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="font-heading text-sm font-semibold">KTPGV Bağış / Gelir Makbuzu</p>
          <p className="text-xs text-muted-foreground">
            Kıbrıs Türk Polis Güçlendirme Vakfı · Yasa 57/2026 Madde 6
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold">{islem.makbuzNo}</p>
          <p className="text-xs text-muted-foreground">
            Nüsha {nusha} — {nusha === 1 ? 'Ödemeyi yapana verilir' : 'Birim fiziksel dosyası'}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <dt className="text-muted-foreground">Kayıt no</dt>
        <dd className="font-mono text-foreground">{islem.kayitNo}</dd>
        <dt className="text-muted-foreground">Bent</dt>
        <dd className="text-foreground">{islem.bent}</dd>
        <dt className="text-muted-foreground">Ödeme yapan</dt>
        <dd className="text-foreground">{islem.dekont.odemeYapan}</dd>
        <dt className="text-muted-foreground">Dekont no</dt>
        <dd className="font-mono text-foreground">{islem.dekont.dekontNo}</dd>
        <dt className="text-muted-foreground">Dekont tarihi</dt>
        <dd className="text-foreground">{formatTarih(islem.dekont.tarih)}</dd>
        {islem.krediAdedi && islem.eIslemTuru === 'KREDI_YUKLEME' &&
        <>
            <dt className="text-muted-foreground">Yüklenen kredi</dt>
            <dd className="text-foreground">{islem.krediAdedi} patlatma</dd>
            <dt className="text-muted-foreground">1 patlatma bedeli</dt>
            <dd className="text-foreground">{formatTL(islem.tutar / islem.krediAdedi)}</dd>
          </>
        }
        <dt className="text-muted-foreground">Üreten</dt>
        <dd className="text-foreground">{islem.makbuzUreten ?? '—'}</dd>
      </dl>

      {islem.altBasvurular &&
      <div className="mt-3 rounded-md border border-border bg-muted/40 p-2.5">
          <p className="text-[11px] font-medium text-foreground">
            Ek liste — kapsanan alt başvurular ({islem.altBasvurular.length})
          </p>
          <ul className="mt-1.5 space-y-1 text-[10px]">
            {islem.altBasvurular.map((alt) =>
          <li key={alt.no} className="flex items-center justify-between gap-2">
                <span className="font-mono text-foreground">{alt.no}</span>
                <span className="text-muted-foreground">
                  {alt.plaka} · {formatTL(alt.raporTutari)}
                </span>
              </li>
          )}
          </ul>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Alt başvurulara ayrı makbuz kesilmez; makbuz ana TTRF kaydına aittir.
          </p>
        </div>
      }
      {bagliOcaklar.length > 0 &&
      <p className="mt-3 text-xs text-muted-foreground">
          Kredinin kullanılabileceği taş ocakları: {bagliOcaklar.join(', ')}
        </p>
      }

      <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">Toplam</span>
        <span className="font-heading text-lg font-semibold">{formatTL(islem.tutar)}</span>
      </div>
    </div>);

}

export function MakbuzModal({ islem, acik, kapat }: MakbuzModalProps) {
  if (!islem || !islem.makbuzNo) return null;

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Makbuz {islem.makbuzNo}</DialogTitle>
          <DialogDescription>
            Makbuz iki nüsha olarak üretilir. Aynı kayda ikinci makbuz üretilemez.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] gap-4 overflow-y-auto md:grid-cols-2">
          <Nusha islem={islem} nusha={1} />
          <Nusha islem={islem} nusha={2} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Yazdır
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}