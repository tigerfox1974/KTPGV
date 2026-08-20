import React, { useMemo, useState } from 'react';
import { Copy, QrCode, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
'../ui/Dialog';
import { DekontDosyasi } from '../../types';
import { dosyaSec } from '../../utils/dosya';

function qrDeseni(kaynak: string): boolean[] {
  const boyut = 11;
  const hucreler: boolean[] = [];
  let tohum = 0;
  for (let i = 0; i < kaynak.length; i += 1) tohum = (tohum * 31 + kaynak.charCodeAt(i)) % 100000;
  for (let i = 0; i < boyut * boyut; i += 1) {
    tohum = (tohum * 1103515245 + 12345) % 2147483648;
    hucreler.push((tohum >> 8) % 3 !== 0);
  }
  return hucreler;
}

interface QrDekontPaneliProps {
  kaynakEtiketi: string;
  odenecekTutar?: string;
  dosyaAta: (dosya: DekontDosyasi) => void;
  qrOlusturuldu: () => void;
}

export function QrDekontPaneli({ kaynakEtiketi, odenecekTutar, dosyaAta, qrOlusturuldu }: QrDekontPaneliProps) {
  const [link, setLink] = useState<string | null>(null);
  const [basvuruEkrani, setBasvuruEkrani] = useState(false);
  const desen = useMemo(() => qrDeseni(link ?? ''), [link]);

  const olustur = () => {
    const jeton = Math.random().toString(36).slice(2, 10);
    setLink(`https://dekont.ktpgv.gov.ct.tr/y/${jeton}`);
    qrOlusturuldu();
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Yöntem 2 — Başvuru sahibi QR/link ile yükleme
          </p>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            Başvuru sahibi telefonundan QR’ı okutur veya linke girer, dekontunu yükler. Dosya anında
            bu formdaki Dijital dekont dosyası alanında görünür.
          </p>
        </div>
        {!link &&
        <Button type="button" variant="outline" size="sm" onClick={olustur}>
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Başvuru sahibi için QR/link oluştur
          </Button>
        }
      </div>

      {link &&
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
          className="grid h-28 w-28 shrink-0 grid-cols-11 gap-px rounded-md border border-border bg-white p-1.5"
          role="img"
          aria-label="Dekont yükleme QR kodu simülasyonu">
          
            {desen.map((dolu, i) =>
          <span key={i} className={dolu ? 'bg-primary' : 'bg-white'} />
          )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs text-muted-foreground">Yükleme linki ({kaynakEtiketi})</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="max-w-full truncate rounded border border-border bg-card px-2 py-1 font-mono text-xs">
                {link}
              </code>
              <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard?.writeText(link)}>
              
                <Copy className="h-4 w-4" aria-hidden="true" />
                Kopyala
              </Button>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setBasvuruEkrani(true)}>
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Başvuru sahibi yükleme ekranını aç (simülasyon)
            </Button>
          </div>
        </div>
      }

      <Dialog open={basvuruEkrani} onOpenChange={setBasvuruEkrani}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Dekont Yükleme — Başvuru Sahibi Ekranı</DialogTitle>
            <DialogDescription>
              KTPGV · {kaynakEtiketi} · PDF, JPG veya PNG · En fazla 5 MB
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Bu ekran başvuru sahibinin telefonunda açılan yükleme sayfasını temsil eder. Başvuru
              sahibi yalnızca dosya yükler; kayıt veya makbuz bilgisi göremez.
            </p>
            {odenecekTutar &&
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm font-medium text-foreground">
                Ödenecek tutar: {odenecekTutar}
              </p>
            }
            <Button
              type="button"
              className="w-full"
              onClick={() =>
              dosyaSec('QR_LINK', (dosya) => {
                dosyaAta(dosya);
                setBasvuruEkrani(false);
              })
              }>
              
              Dekont dosyası seç ve yükle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}