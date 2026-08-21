import { useRef, useState } from 'react';
import { FileText, ImageIcon, Maximize2, Move, ZoomIn, ZoomOut } from 'lucide-react';
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
  if (dosya.previewUrl) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-3">
        <object data={dosya.previewUrl} type="application/pdf" className="h-[520px] w-full rounded-md border border-border bg-white">
          <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">PDF önizlemesi bu tarayıcıda desteklenmiyor.</p>
            <p className="mt-1">{dosya.ad} · {dosya.tur} · {(dosya.boyutKb / 1024).toFixed(2)} MB</p>
          </div>
        </object>
      </div>);

  }
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
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [surukleniyor, setSurukleniyor] = useState(false);
  const baslangic = useRef({ x: 0, y: 0 });

  const zoomAyarla = (deger: number) => {
    setZoom(Math.min(3, Math.max(0.5, deger)));
    if (deger <= 1) setOffset({ x: 0, y: 0 });
  };

  if (dosya.previewUrl) {
    return (
      <div className="rounded-lg border border-border bg-slate-900 p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5 font-medium text-white">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Görsel önizleme · {dosya.tur}
          </span>
          <div className="flex items-center gap-1.5">
            <button type="button" className="rounded border border-slate-600 p-1.5 hover:bg-slate-700" onClick={() => zoomAyarla(zoom - 0.25)} aria-label="Uzaklaştır" title="Uzaklaştır"><ZoomOut className="h-3.5 w-3.5" /></button>
            <button type="button" className="min-w-12 rounded border border-slate-600 px-1.5 py-1 text-center hover:bg-slate-700" onClick={() => zoomAyarla(1)} aria-label="Yüzde 100" title="Yüzde 100">{Math.round(zoom * 100)}%</button>
            <button type="button" className="rounded border border-slate-600 p-1.5 hover:bg-slate-700" onClick={() => zoomAyarla(zoom + 0.25)} aria-label="Yakınlaştır" title="Yakınlaştır"><ZoomIn className="h-3.5 w-3.5" /></button>
            <button type="button" className="rounded border border-slate-600 px-2 py-1 hover:bg-slate-700" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Pencereye sığdır" title="Pencereye sığdır">Sığdır</button>
          </div>
        </div>
        <div
          className={`flex h-[520px] items-center justify-center overflow-hidden rounded-md bg-slate-800 ${surukleniyor ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-default'}`}
          onPointerDown={(event) => {
            if (zoom <= 1) return;
            setSurukleniyor(true);
            baslangic.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!surukleniyor) return;
            setOffset({ x: event.clientX - baslangic.current.x, y: event.clientY - baslangic.current.y });
          }}
          onPointerUp={() => setSurukleniyor(false)}
          onPointerCancel={() => setSurukleniyor(false)}>
          <img
            src={dosya.previewUrl}
            alt={dosya.ad}
            draggable={false}
            className="max-h-full max-w-full select-none rounded-md bg-white object-contain transition-transform"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }} />
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-400">{dosya.ad}</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-center text-[10px] text-slate-400"><Move className="h-3 w-3" aria-hidden="true" /> Görsel büyütüldüğünde sürükleyerek gezebilirsiniz.</p>
      </div>);

  }
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
          Demo ortamında önizleme tarayıcı oturumu içinde gösterilir. Gerçek sistemde dosya güvenli
          storage üzerinde saklanır. Önizleme desteklenmezse demo simülasyon görünümü kullanılır.
        </p>
      </DialogContent>
    </Dialog>);

}