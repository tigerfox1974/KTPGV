import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { ParaInput } from '../ui/ParaInput';
import { DosyaKarti } from './DosyaKarti';
import { DosyaOnizlemeModal } from './DosyaOnizlemeModal';
import { QrDekontPaneli } from './QrDekontPaneli';
import { KuralNotu } from '../common/KuralNotu';
import { DekontDosyasi } from '../../types';
import { dosyaSec } from '../../utils/dosya';
import { formatTL } from '../../utils/currency';

export interface DekontFormu {
  dekontNo: string;
  banka: string;
  tarih: string;
  odenenTutar: number | null;
  odemeYapan: string;
}

export const BOS_DEKONT: DekontFormu = {
  dekontNo: '',
  banka: '',
  tarih: '',
  odenenTutar: null,
  odemeYapan: ''
};

interface DekontBolumuProps {
  form: DekontFormu;
  guncelle: <K extends keyof DekontFormu>(alan: K, deger: DekontFormu[K]) => void;
  dosya: DekontDosyasi | null;
  dosyaAta: (dosya: DekontDosyasi | null) => void;
  kaynakEtiketi: string;
  beklenenTutar: number;
  qrOdenecekTutarGoster?: boolean;
  auditEkle: (eylem: string, hedef: string) => void;
}

export function DekontBolumu({
  form,
  guncelle,
  dosya,
  dosyaAta,
  kaynakEtiketi,
  beklenenTutar,
  qrOdenecekTutarGoster = false,
  auditEkle
}: DekontBolumuProps) {
  const [onizleme, setOnizleme] = useState(false);
  const odenen = form.odenenTutar ?? 0;
  const fark = Number((odenen - beklenenTutar).toFixed(2));
  const tutarUyumlu = odenen > 0 && Math.abs(fark) < 0.01;

  return (
    <div className="space-y-6">
      <section className="space-y-4" aria-labelledby="dekont-baslik">
        <div>
          <h2 id="dekont-baslik" className="font-heading text-base font-semibold text-foreground">
            Ödeme / Dekont
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tüm alanlar zorunludur. Ödenen tutar hesaplanan tutarla eşleşmeden ve dekont dosyası
            yüklenmeden işlem kaydedilemez.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="dekont-no">Dekont no</Label>
            <Input
              id="dekont-no"
              value={form.dekontNo}
              onChange={(e) => guncelle('dekontNo', e.target.value)}
              placeholder="Örn. 987654321"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="dekont-banka">Banka</Label>
            <Input
              id="dekont-banka"
              value={form.banka}
              onChange={(e) => guncelle('banka', e.target.value)}
              placeholder="Örn. Kıbrıs Vakıflar Bankası"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="dekont-tarih">Dekont tarihi (mali belge tarihi)</Label>
            <Input
              id="dekont-tarih"
              type="date"
              value={form.tarih}
              onChange={(e) => guncelle('tarih', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="dekont-tutar">Ödenen tutar (TL)</Label>
            <ParaInput
              id="dekont-tutar"
              value={form.odenenTutar}
              onValueChange={(deger) => guncelle('odenenTutar', deger)}
              placeholder="0,00 TL"
              className="mt-1.5"
              aria-invalid={odenen > 0 && !tutarUyumlu} />
            
            <p className="mt-1 text-xs text-muted-foreground">
              Hesaplanan tutar: {formatTL(beklenenTutar)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="dekont-odeyen">Ödeme yapan kişi / kurum</Label>
            <Input
              id="dekont-odeyen"
              value={form.odemeYapan}
              onChange={(e) => guncelle('odemeYapan', e.target.value)}
              placeholder="Örn. Kıbrıs Sigorta Ltd."
              className="mt-1.5" />
            
          </div>
        </div>

        {odenen > 0 && !tutarUyumlu &&
        <div
          role="alert"
          className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          
            <p className="font-medium">
              {fark < 0 ?
            'Eksik ödeme nedeniyle kayıt oluşturulamaz.' :
            'Fazla ödeme tespit edildi.'}
            </p>
            <p>Hesaplanan tutar: {formatTL(beklenenTutar)}</p>
            <p>Ödenen tutar: {formatTL(odenen)}</p>
            <p>
              Fark: {formatTL(Math.abs(fark))}{' '}
              {fark < 0 ?
            '(eksik)' :
            '(fazla) — Ödenen tutar hesaplanan tutardan fazladır. Mali onay/politika gerektirir.'}
            </p>
          </div>
        }

        {tutarUyumlu &&
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
            Ödenen tutar hesaplanan tutarla eşleşiyor: {formatTL(odenen)}
          </p>
        }
      </section>

      <section className="space-y-3 rounded-xl border border-border p-4" aria-labelledby="dosya-baslik">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="dosya-baslik" className="font-heading text-base font-semibold text-foreground">
              Dijital Dosya
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Dijital dekont dosyası · PDF, JPG veya PNG · En fazla 5 MB
            </p>
          </div>
          {!dosya &&
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
            dosyaSec('PERSONEL', (d) => {
              dosyaAta(d);
              auditEkle('Dekont yüklendi', `${d.ad} (Personel ekranı)`);
            })
            }>
            
              <Upload className="h-4 w-4" aria-hidden="true" />
              Yöntem 1 — Personel dosya yükleme
            </Button>
          }
        </div>

        {dosya ?
        <DosyaKarti
          dosya={dosya}
          goruntule={() => {
            setOnizleme(true);
            auditEkle('Dekont dosyası görüntülendi', dosya.ad);
          }}
          kaldir={() => {
            dosyaAta(null);
            auditEkle('Kayıt öncesi dekont kaldırıldı', dosya.ad);
          }} /> :


        <QrDekontPaneli
          kaynakEtiketi={kaynakEtiketi}
          odenecekTutar={qrOdenecekTutarGoster ? formatTL(beklenenTutar) : undefined}
          dosyaAta={(d) => {
            dosyaAta(d);
            auditEkle('Dekont yüklendi', `${d.ad} (QR/link)`);
          }}
          qrOlusturuldu={() => auditEkle('QR/link oluşturuldu', kaynakEtiketi)} />

        }

        <KuralNotu ton="uyari">
          Kayıt öncesinde yanlış dosya “Dosyayı kaldır” ile silinebilir. Kayıt tamamlandıktan sonra
          serbest silme yoktur; silme işlemi yetki ve audit log gerektirir.
        </KuralNotu>

        <DosyaOnizlemeModal dosya={dosya} acik={onizleme} kapat={() => setOnizleme(false)} />
      </section>
    </div>);

}