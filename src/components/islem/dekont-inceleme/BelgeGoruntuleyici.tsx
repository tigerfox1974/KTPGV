import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  ScanSearch,
  Search,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import type { DekontAlanAdi, DekontDosyasi, DekontKonumluAlan, DekontNormalizedBbox } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { OcrAlanKatmani } from './OcrAlanKatmani';
import { normalizeBboxForRotation, normalizeBboxFromDisplay } from './helpers';

interface BelgeGoruntuleyiciProps {
  dosya: Pick<DekontDosyasi, 'ad' | 'previewUrl' | 'tur' | 'kaynakVeri'>;
  alanlar?: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>;
  seciliAlan?: DekontAlanAdi;
  katmanGorunur?: boolean;
  yalnizSeciliAlan?: boolean;
  sayfa?: number;
  onSayfaChange?: (sayfa: number) => void;
  onAlanSec?: (alan: DekontAlanAdi) => void;
  odakIstegi?: { alan: DekontAlanAdi; nonce: number } | null;
  bolgeSecimModu?: boolean;
  seciliBolge?: { sayfa: number; bbox: DekontNormalizedBbox } | null;
  onBolgeSecildi?: (bbox: DekontNormalizedBbox, sayfa: number) => void;
  compact?: boolean;
}

type FitModu = 'PAGE' | 'WIDTH' | 'ACTUAL';
type Rotation = 0 | 90 | 180 | 270;

interface Boyut {
  width: number;
  height: number;
}

interface SecimDurumu {
  aktif: boolean;
  baslangicX: number;
  baslangicY: number;
  bitisX: number;
  bitisY: number;
}

function clamp(deger: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, deger));
}

function roundZoom(deger: number): number {
  return Math.round(clamp(deger, 50, 300) / 5) * 5;
}

function pointerToNormalized(
  event: React.PointerEvent<HTMLDivElement>,
  left: number,
  top: number,
  scale: number,
  boyut: Boyut
): { x: number; y: number } {
  return {
    x: clamp((event.clientX - left) / scale / boyut.width, 0, 1),
    y: clamp((event.clientY - top) / scale / boyut.height, 0, 1)
  };
}

function rectFromSelection(secim: SecimDurumu): DekontNormalizedBbox {
  const x0 = Math.min(secim.baslangicX, secim.bitisX);
  const y0 = Math.min(secim.baslangicY, secim.bitisY);
  const x1 = Math.max(secim.baslangicX, secim.bitisX);
  const y1 = Math.max(secim.baslangicY, secim.bitisY);
  return {
    x: x0,
    y: y0,
    width: x1 - x0,
    height: y1 - y0
  };
}

function drawRotatedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  rotation: Rotation
): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const dikey = rotation === 90 || rotation === 270;
  canvas.width = dikey ? image.naturalHeight : image.naturalWidth;
  canvas.height = dikey ? image.naturalWidth : image.naturalHeight;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  if (rotation === 90) {
    context.translate(canvas.width, 0);
    context.rotate(Math.PI / 2);
  } else if (rotation === 180) {
    context.translate(canvas.width, canvas.height);
    context.rotate(Math.PI);
  } else if (rotation === 270) {
    context.translate(0, canvas.height);
    context.rotate((Math.PI * 3) / 2);
  }
  context.drawImage(image, 0, 0);
  context.restore();
}

function nextRotation(rotation: Rotation, delta: 90 | -90): Rotation {
  const dizi: Rotation[] = [0, 90, 180, 270];
  const index = dizi.indexOf(rotation);
  return dizi[(index + (delta === 90 ? 1 : 3)) % dizi.length];
}

export function BelgeGoruntuleyici({
  dosya,
  alanlar = {},
  seciliAlan,
  katmanGorunur = false,
  yalnizSeciliAlan = false,
  sayfa,
  onSayfaChange,
  onAlanSec,
  odakIstegi,
  bolgeSecimModu = false,
  seciliBolge,
  onBolgeSecildi,
  compact = false
}: BelgeGoruntuleyiciProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [fitModu, setFitModu] = useState<FitModu>('PAGE');
  const [zoomYuzdesi, setZoomYuzdesi] = useState(100);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [surukleme, setSurukleme] = useState<{ aktif: boolean; x: number; y: number; offsetX: number; offsetY: number }>({
    aktif: false,
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0
  });
  const [sayfaSayisi, setSayfaSayisi] = useState(1);
  const [icSayfa, setIcSayfa] = useState(sayfa ?? 1);
  const [belgeBoyutu, setBelgeBoyutu] = useState<Boyut>({ width: 1, height: 1 });
  const [viewportBoyutu, setViewportBoyutu] = useState<Boyut>({ width: 1, height: compact ? 420 : 640 });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [secim, setSecim] = useState<SecimDurumu | null>(null);

  const aktifSayfa = sayfa ?? icSayfa;

  useEffect(() => {
    if (sayfa !== undefined) setIcSayfa(sayfa);
  }, [sayfa]);

  useEffect(() => {
    if (!viewportRef.current || typeof ResizeObserver === 'undefined') return;
    const gozlemci = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setViewportBoyutu({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });
    gozlemci.observe(viewportRef.current);
    return () => gozlemci.disconnect();
  }, []);

  useEffect(() => {
    let iptal = false;
    async function yukle() {
      if (!dosya.previewUrl || !canvasRef.current) return;
      setYukleniyor(true);
      setHata('');
      try {
        if (dosya.tur === 'PDF' && dosya.kaynakVeri) {
          const { getDocument, GlobalWorkerOptions, version: pdfVersion } = await import('pdfjs-dist');
          GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.mjs`;
          const pdf = await getDocument({ data: dosya.kaynakVeri }).promise;
          const hedefSayfa = clamp(aktifSayfa, 1, pdf.numPages);
          if (!iptal) setSayfaSayisi(pdf.numPages);
          if (hedefSayfa !== aktifSayfa) {
            if (sayfa === undefined) setIcSayfa(hedefSayfa);
            onSayfaChange?.(hedefSayfa);
          }
          const page = await pdf.getPage(hedefSayfa);
          const viewport = page.getViewport({ scale: 2, rotation });
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (!canvas || !context) return;
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          context.clearRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport }).promise;
          if (!iptal) setBelgeBoyutu({ width: canvas.width, height: canvas.height });
        } else {
          const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
            img.src = dosya.previewUrl;
          });
          const canvas = canvasRef.current;
          if (!canvas) return;
          drawRotatedImage(canvas, image, rotation);
          if (!iptal) {
            setSayfaSayisi(1);
            setBelgeBoyutu({ width: canvas.width, height: canvas.height });
          }
        }
      } catch (error) {
        if (!iptal) {
          setHata(error instanceof Error ? error.message : 'Belge yüklenemedi.');
        }
      } finally {
        if (!iptal) setYukleniyor(false);
      }
    }
    void yukle();
    return () => {
      iptal = true;
    };
  }, [aktifSayfa, dosya.kaynakVeri, dosya.previewUrl, dosya.tur, onSayfaChange, rotation, sayfa]);

  const fitScale = useMemo(() => {
    const yatay = viewportBoyutu.width / belgeBoyutu.width;
    const dikey = viewportBoyutu.height / belgeBoyutu.height;
    if (!Number.isFinite(yatay) || !Number.isFinite(dikey)) return 1;
    if (fitModu === 'WIDTH') return yatay;
    if (fitModu === 'ACTUAL') return 1;
    return Math.min(yatay, dikey);
  }, [belgeBoyutu.height, belgeBoyutu.width, fitModu, viewportBoyutu.height, viewportBoyutu.width]);

  const effectiveScale = fitScale * (zoomYuzdesi / 100);
  const gosterimGenisligi = belgeBoyutu.width * effectiveScale;
  const gosterimYuksekligi = belgeBoyutu.height * effectiveScale;
  const merkezX = (viewportBoyutu.width - gosterimGenisligi) / 2;
  const merkezY = (viewportBoyutu.height - gosterimYuksekligi) / 2;

  const offsetSinirlari = useMemo(() => {
    const farkX = (gosterimGenisligi - viewportBoyutu.width) / 2;
    const farkY = Math.max(0, (gosterimYuksekligi - viewportBoyutu.height) / 2);
    return {
      minX: gosterimGenisligi <= viewportBoyutu.width ? 0 : -farkX,
      maxX: gosterimGenisligi <= viewportBoyutu.width ? 0 : farkX,
      minY: -farkY,
      maxY: farkY
    };
  }, [gosterimGenisligi, gosterimYuksekligi, viewportBoyutu.height, viewportBoyutu.width]);

  useEffect(() => {
    setOffset((mevcut) => ({
      x: clamp(mevcut.x, offsetSinirlari.minX, offsetSinirlari.maxX),
      y: clamp(mevcut.y, offsetSinirlari.minY, offsetSinirlari.maxY)
    }));
  }, [offsetSinirlari.maxX, offsetSinirlari.maxY, offsetSinirlari.minX, offsetSinirlari.minY]);

  const belgeSol = merkezX + offset.x;
  const belgeUst = merkezY + offset.y;

  const zoomAyarla = (hedef: number, clientX?: number, clientY?: number) => {
    const yeniZoom = roundZoom(hedef);
    const yeniScale = fitScale * (yeniZoom / 100);
    const isaretX = clientX ?? viewportBoyutu.width / 2;
    const isaretY = clientY ?? viewportBoyutu.height / 2;
    const docX = (isaretX - belgeSol) / effectiveScale;
    const docY = (isaretY - belgeUst) / effectiveScale;
    const yeniMerkezX = (viewportBoyutu.width - belgeBoyutu.width * yeniScale) / 2;
    const yeniMerkezY = (viewportBoyutu.height - belgeBoyutu.height * yeniScale) / 2;
    const yeniOffset = {
      x: isaretX - docX * yeniScale - yeniMerkezX,
      y: isaretY - docY * yeniScale - yeniMerkezY
    };
    const farkX = Math.max(0, (belgeBoyutu.width * yeniScale - viewportBoyutu.width) / 2);
    const farkY = Math.max(0, (belgeBoyutu.height * yeniScale - viewportBoyutu.height) / 2);
    setZoomYuzdesi(yeniZoom);
    setOffset({
      x: clamp(yeniOffset.x, -farkX, farkX),
      y: clamp(yeniOffset.y, -farkY, farkY)
    });
  };

  const belgeyeOdaklan = (alanAdi: DekontAlanAdi) => {
    const alan = alanlar[alanAdi];
    if (!alan?.bbox) return;
    if (alan.sayfa && alan.sayfa !== aktifSayfa) {
      if (sayfa === undefined) setIcSayfa(alan.sayfa);
      onSayfaChange?.(alan.sayfa);
    }
    const gorunenKutu = normalizeBboxForRotation(alan.bbox, rotation);
    const kutuMerkeziX = (gorunenKutu.x + gorunenKutu.width / 2) * belgeBoyutu.width;
    const kutuMerkeziY = (gorunenKutu.y + gorunenKutu.height / 2) * belgeBoyutu.height;
    const hedefX = viewportBoyutu.width / 2 - kutuMerkeziX * effectiveScale;
    const hedefY = viewportBoyutu.height / 2 - kutuMerkeziY * effectiveScale;
    setOffset({
      x: clamp(hedefX - merkezX, offsetSinirlari.minX, offsetSinirlari.maxX),
      y: clamp(hedefY - merkezY, offsetSinirlari.minY, offsetSinirlari.maxY)
    });
  };

  useEffect(() => {
    if (!odakIstegi) return;
    belgeyeOdaklan(odakIstegi.alan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [belgeBoyutu.height, belgeBoyutu.width, effectiveScale, odakIstegi, rotation]);

  const secimKutusu = secim ? rectFromSelection(secim) : null;
  const kaliciSecimKutusu =
    seciliBolge && seciliBolge.sayfa === aktifSayfa
      ? normalizeBboxForRotation(seciliBolge.bbox, rotation)
      : null;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-white">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="icon-sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => zoomAyarla(zoomYuzdesi - 10)}>
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1">
            <Search className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
            <Input
              value={String(zoomYuzdesi)}
              onChange={(event) => {
                const sayi = Number(event.target.value);
                if (Number.isFinite(sayi)) setZoomYuzdesi(roundZoom(sayi));
              }}
              onBlur={() => zoomAyarla(zoomYuzdesi)}
              className="h-6 w-12 border-0 bg-transparent px-0 py-0 text-right text-xs text-white focus-visible:ring-0"
              inputMode="numeric"
              aria-label="Yakınlaştırma yüzdesi"
            />
            <span className="text-xs text-slate-300">%</span>
          </div>
          <Button size="icon-sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => zoomAyarla(zoomYuzdesi + 10)}>
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => { setFitModu('ACTUAL'); setZoomYuzdesi(100); setOffset({ x: 0, y: 0 }); }}>
            100%
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => { setFitModu('PAGE'); setZoomYuzdesi(100); setOffset({ x: 0, y: 0 }); }}>
            Sayfaya sığdır
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => { setFitModu('WIDTH'); setZoomYuzdesi(100); setOffset({ x: 0, y: 0 }); }}>
            Genişliğe sığdır
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {dosya.tur === 'PDF' && (
            <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1 py-1">
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                disabled={aktifSayfa <= 1}
                onClick={() => {
                  const yeni = clamp(aktifSayfa - 1, 1, sayfaSayisi);
                  if (sayfa === undefined) setIcSayfa(yeni);
                  onSayfaChange?.(yeni);
                }}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="min-w-20 text-center text-xs text-slate-200">
                Sayfa {aktifSayfa} / {sayfaSayisi}
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                disabled={aktifSayfa >= sayfaSayisi}
                onClick={() => {
                  const yeni = clamp(aktifSayfa + 1, 1, sayfaSayisi);
                  if (sayfa === undefined) setIcSayfa(yeni);
                  onSayfaChange?.(yeni);
                }}>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setRotation((mevcut) => nextRotation(mevcut, -90))}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setRotation((mevcut) => nextRotation(mevcut, 90))}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => {
              setRotation(0);
              setFitModu('PAGE');
              setZoomYuzdesi(100);
              setOffset({ x: 0, y: 0 });
            }}>
            Sıfırla
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className={`relative flex-1 overflow-hidden ${compact ? 'min-h-[420px]' : 'min-h-[560px]'}`}
        onWheel={(event) => {
          event.preventDefault();
          zoomAyarla(zoomYuzdesi + (event.deltaY < 0 ? 10 : -10), event.clientX, event.clientY);
        }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
        {hata && <div className="absolute left-4 top-4 z-30 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{hata}</div>}
        {yukleniyor && (
          <div className="absolute left-4 top-4 z-30 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm text-sky-900">
            Belge yükleniyor…
          </div>
        )}
        {bolgeSecimModu && (
          <div className="absolute right-4 top-4 z-30 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <div className="flex items-center gap-2">
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Belgede bir dikdörtgen sürükleyerek OCR bölgesi seçin.
            </div>
          </div>
        )}

        <div
          className={`absolute origin-top-left ${surukleme.aktif ? 'cursor-grabbing' : effectiveScale > fitScale ? 'cursor-grab' : 'cursor-default'}`}
          style={{
            left: `${belgeSol}px`,
            top: `${belgeUst}px`,
            width: `${belgeBoyutu.width}px`,
            height: `${belgeBoyutu.height}px`,
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top left'
          }}
          onPointerDown={(event) => {
            if (bolgeSecimModu) {
              const nokta = pointerToNormalized(event, belgeSol, belgeUst, effectiveScale, belgeBoyutu);
              setSecim({
                aktif: true,
                baslangicX: nokta.x,
                baslangicY: nokta.y,
                bitisX: nokta.x,
                bitisY: nokta.y
              });
              event.currentTarget.setPointerCapture(event.pointerId);
              return;
            }
            if (gosterimGenisligi <= viewportBoyutu.width && gosterimYuksekligi <= viewportBoyutu.height) return;
            setSurukleme({
              aktif: true,
              x: event.clientX,
              y: event.clientY,
              offsetX: offset.x,
              offsetY: offset.y
            });
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (secim?.aktif) {
              const nokta = pointerToNormalized(event, belgeSol, belgeUst, effectiveScale, belgeBoyutu);
              setSecim((mevcut) =>
                mevcut
                  ? {
                      ...mevcut,
                      bitisX: nokta.x,
                      bitisY: nokta.y
                    }
                  : mevcut
              );
              return;
            }
            if (!surukleme.aktif) return;
            setOffset({
              x: clamp(
                surukleme.offsetX + (event.clientX - surukleme.x),
                offsetSinirlari.minX,
                offsetSinirlari.maxX
              ),
              y: clamp(
                surukleme.offsetY + (event.clientY - surukleme.y),
                offsetSinirlari.minY,
                offsetSinirlari.maxY
              )
            });
          }}
          onPointerUp={(event) => {
            if (secim?.aktif) {
              const kutu = rectFromSelection(secim);
              if (kutu.width > 0.01 && kutu.height > 0.01) {
                onBolgeSecildi?.(normalizeBboxFromDisplay(kutu, rotation), aktifSayfa);
              }
              setSecim(null);
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              return;
            }
            if (surukleme.aktif) setSurukleme((mevcut) => ({ ...mevcut, aktif: false }));
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onPointerCancel={() => {
            setSurukleme((mevcut) => ({ ...mevcut, aktif: false }));
            setSecim(null);
          }}>
          <canvas ref={canvasRef} className="block rounded-md bg-white shadow-2xl" />
          <OcrAlanKatmani
            alanlar={alanlar}
            sayfa={aktifSayfa}
            rotation={rotation}
            gorunur={katmanGorunur}
            yalnizSeciliAlan={yalnizSeciliAlan}
            seciliAlan={seciliAlan}
            onAlanSec={(alan) => {
              onAlanSec?.(alan);
              if (alan !== seciliAlan) return;
              belgeyeOdaklan(alan);
            }}
          />
          {secimKutusu && (
            <div
              className="pointer-events-none absolute z-30 border-2 border-amber-400 bg-amber-300/20"
              style={{
                left: `${secimKutusu.x * 100}%`,
                top: `${secimKutusu.y * 100}%`,
                width: `${secimKutusu.width * 100}%`,
                height: `${secimKutusu.height * 100}%`
              }}
            />
          )}
          {!secimKutusu && kaliciSecimKutusu && (
            <div
              className="pointer-events-none absolute z-30 border-2 border-dashed border-amber-300 bg-amber-200/10"
              style={{
                left: `${kaliciSecimKutusu.x * 100}%`,
                top: `${kaliciSecimKutusu.y * 100}%`,
                width: `${kaliciSecimKutusu.width * 100}%`,
                height: `${kaliciSecimKutusu.height * 100}%`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
