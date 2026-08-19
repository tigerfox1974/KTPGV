import React from 'react';
import { FileText, ImageIcon, Maximize2, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
'../ui/Dialog';
import { DekontDosyasi } from '../../types';

interface DosyaOnizlemeModalProps {
  dosya: DekontDosyasi | null;
  acik: boolean;
  kapat: () => void;
}

function PdfOnizleme({ dosya }: {dosya: DekontDosyasi;}) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          PDF önizleme · Sayfa 1 / 1
        </span>
        <span className="inline-flex items-center gap-1">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Tam ekran
        </span>
      </div>
      <div className="mx-auto max-w-sm rounded-sm border border-border bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Banka Ödeme Dekontu
        </p>
        <div className="mt-2 h-2 w-2/3 rounded-full bg-slate-800/80" />
        <div className="mt-4 space-y-1.5">
          {[
          ['Dekont no', '···········'],
          ['Banka', '················'],
          ['Tarih', '··········'],
          ['Ödeme yapan', '·················'],
          ['Tutar', '·········· TL']].
          map(([etiket, deger]) =>
          <div key={etiket} className="flex items-center justify-between gap-3 text-[10px]">
              <span className="text-slate-500">{etiket}</span>
              <span className="font-mono text-slate-700">{deger}</span>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-slate-200" />
          <div className="h-1.5 w-11/12 rounded-full bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div className="h-8 w-16 rounded border border-dashed border-slate-300" />
          <p className="text-[9px] text-slate-400">{dosya.ad}</p>
        </div>
      </div>
    </div>);

}

function GorselOnizleme({ dosya }: {dosya: DekontDosyasi;}) {
  return (
    <div className="rounded-lg border border-border bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
        <span className="inline-flex items-center gap-1.5 font-medium text-white">
          <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Görsel önizleme · {dosya.tur}
        </span>
        <span className="inline-flex items-center gap-1">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          Yakınlaştır
        </span>
      </div>
      <div className="mx-auto flex aspect-[4/3] max-w-sm items-center justify-center rounded-md bg-slate-700/60">
        <div className="w-4/5 rounded bg-white/95 p-4">
          <div className="h-2 w-1/2 rounded-full bg-slate-800/70" />
          <div className="mt-3 space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-slate-300" />
            <div className="h-1.5 w-5/6 rounded-full bg-slate-300" />
            <div className="h-1.5 w-2/3 rounded-full bg-slate-300" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="h-6 w-12 rounded bg-slate-200" />
            <div className="h-1.5 w-16 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] text-slate-400">{dosya.ad}</p>
    </div>);

}

export function DosyaOnizlemeModal({ dosya, acik, kapat }: DosyaOnizlemeModalProps) {
  if (!dosya) return null;
  const gorsel = dosya.tur === 'JPG' || dosya.tur === 'PNG';

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="break-all">{dosya.ad}</DialogTitle>
          <DialogDescription>
            {dosya.tur} · {(dosya.boyutKb / 1024).toFixed(2)} MB ·{' '}
            {dosya.yontem === 'PERSONEL' ? 'Personel ekranı' : 'QR/link'} · {dosya.yuklemeZamani}
          </DialogDescription>
        </DialogHeader>

        {gorsel ? <GorselOnizleme dosya={dosya} /> : <PdfOnizleme dosya={dosya} />}

        <p className="text-xs text-muted-foreground">
          Demo ortamında dosya içeriği simüle edilir. Gerçek sistemde dosya güvenli storage
          üzerinden yetkili kullanıcıya açılır ve her görüntüleme audit log’a yazılır.
        </p>
      </DialogContent>
    </Dialog>);

}