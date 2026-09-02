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
import { BagisMakbuzu, Islem } from '../../types';
import { formatTL, formatTarih } from '../../utils/currency';
import { useApp } from '../../contexts/AppContext';
import { patlatmaBedeli } from '../../utils/hesaplama';
import { bagisMakbuzTuruEtiketi, islemBagisMakbuzlariniOku, islemDekontlariniOku } from '../../utils/krediYukleme';

interface MakbuzModalProps {
  islem: Islem | null;
  acik: boolean;
  kapat: () => void;
}

function KrediYuklemeMakbuzNushasi({
  islem,
  makbuz,
  nusha
}: {
  islem: Islem;
  makbuz: BagisMakbuzu;
  nusha: 1 | 2;
}) {
  const { isletmeciBul, tasOcaklari } = useApp();
  const isletmeci = isletmeciBul(islem.isletmeciId);
  const bagliOcaklar = isletmeci ?
  tasOcaklari.filter((t) => t.isletmeciId === isletmeci.id).map((t) => t.ad) :
  [];
  const bagliDekont =
  islemDekontlariniOku(islem).find(
    (dekont) =>
    (makbuz.bagliDekontId && dekont.id === makbuz.bagliDekontId) ||
    (!!makbuz.bagliDekontReferansi && dekont.bankaReferansNo === makbuz.bagliDekontReferansi) ||
    dekont.dekontNo === makbuz.bagliDekontNo
  ) ??
  islem.dekont;

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="font-heading text-sm font-semibold">KTPGV Bağış / Gelir Makbuzu</p>
          <p className="text-xs text-muted-foreground">
            {bagisMakbuzTuruEtiketi(makbuz.tur)} · Yasa 57/2026 Madde 6
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold">{makbuz.makbuzNo}</p>
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
        <dt className="text-muted-foreground">Amaç</dt>
        <dd className="text-foreground">{bagisMakbuzTuruEtiketi(makbuz.tur)}</dd>
        <dt className="text-muted-foreground">Ödeme yapan</dt>
        <dd className="text-foreground">{makbuz.odemeYapan ?? bagliDekont?.odemeYapan ?? islem.dekont.odemeYapan}</dd>
        <dt className="text-muted-foreground">Bağlı dekont no</dt>
        <dd className="font-mono text-foreground">{makbuz.bagliDekontNo ?? bagliDekont?.dekontNo ?? '—'}</dd>
        <dt className="text-muted-foreground">Banka</dt>
        <dd className="text-foreground">{bagliDekont?.banka ?? '—'}</dd>
        <dt className="text-muted-foreground">Dekont tarihi</dt>
        <dd className="text-foreground">
          {makbuz.bagliDekontTarihi ? formatTarih(makbuz.bagliDekontTarihi) : bagliDekont?.tarih ? formatTarih(bagliDekont.tarih) : '—'}
        </dd>
        <dt className="text-muted-foreground">Makbuz tarihi</dt>
        <dd className="text-foreground">{makbuz.olusturmaTarihi ? formatTarih(makbuz.olusturmaTarihi) : formatTarih(islem.olusturmaTarihi)}</dd>
        <dt className="text-muted-foreground">Üreten</dt>
        <dd className="text-foreground">{islem.makbuzUreten ?? '—'}</dd>
      </dl>

      {makbuz.tur === 'TAS_OCAGI_PATLATMASI' && bagliOcaklar.length > 0 &&
      <p className="mt-3 text-xs text-muted-foreground">
          Kredinin kullanılabileceği taş ocakları: {bagliOcaklar.join(', ')}
        </p>
      }

      <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">Toplam</span>
        <span className="font-heading text-lg font-semibold">{formatTL(makbuz.tutar)}</span>
      </div>
    </div>);
}

function TekNusha({ islem, nusha }: {islem: Islem;nusha: 1 | 2;}) {
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
  const { bau } = useApp();
  if (!islem) return null;

  const bagisMakbuzlari =
  islem.eIslemTuru === 'KREDI_YUKLEME' ?
  islemBagisMakbuzlariniOku(islem, patlatmaBedeli(bau)) :
  [];

  if (!islem.makbuzNo && !bagisMakbuzlari.length) return null;

  const baslik =
  bagisMakbuzlari.length > 0 ?
  `${bagisMakbuzlari.length} bağış makbuzu` :
  `Makbuz ${islem.makbuzNo}`;

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{baslik}</DialogTitle>
          <DialogDescription>
            {bagisMakbuzlari.length > 0 ?
            'Doğrulanmış dekontlara bağlı bağış makbuzları iki nüsha olarak üretilir. Aynı dağılıma ikinci kez makbuz kesilmez.' :
            'Makbuz iki nüsha olarak üretilir. Aynı kayda ikinci makbuz üretilemez.'}
          </DialogDescription>
        </DialogHeader>

        {bagisMakbuzlari.length > 0 ? (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            {bagisMakbuzlari.map((makbuz) =>
            <section key={makbuz.makbuzNo ?? `${makbuz.tur}-${makbuz.bagliDekontNo}`} className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">
                      {bagisMakbuzTuruEtiketi(makbuz.tur)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {makbuz.bagliDekontNo ?? '—'} · {formatTL(makbuz.tutar)}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{makbuz.makbuzNo}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <KrediYuklemeMakbuzNushasi islem={islem} makbuz={makbuz} nusha={1} />
                  <KrediYuklemeMakbuzNushasi islem={islem} makbuz={makbuz} nusha={2} />
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto md:grid-cols-2">
            <TekNusha islem={islem} nusha={1} />
            <TekNusha islem={islem} nusha={2} />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Yazdır
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
