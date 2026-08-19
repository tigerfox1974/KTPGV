import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
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
  odenenTutar: string;
  odemeYapan: string;
}

export const BOS_DEKONT: DekontFormu = {
  dekontNo: '',
  banka: '',
  tarih: '',
  odenenTutar: '',
  odemeYapan: ''
};

interface DekontBolumuProps {
  form: DekontFormu;
  guncelle: (alan: keyof DekontFormu, deger: string) => void;
  dosya: DekontDosyasi | null;
  dosyaAta: (dosya: DekontDosyasi | null) => void;
  kaynakEtiketi: string;
  beklenenTutar: number;
  auditEkle: (eylem: string, hedef: string) => void;
}

export function DekontBolumu({
  form,
  guncelle,
  dosya,
  dosyaAta,
  kaynakEtiketi,
  beklenenTutar,
  auditEkle
}: DekontBolumuProps) {
  const [onizleme, setOnizleme] = useState(false);

  return (
    <section className="space-y-4" aria-labelledby="dekont-baslik">
      <div>
        <h2 id="dekont-baslik" className="font-heading text-base font-semibold text-foreground">
          Dekont / Ödeme Bilgisi
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tüm alanlar zorunludur. Dekont dosyası yüklenmeden işlem kaydedilemez.
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
          <Label htmlFor="dekont-tarih">Dekont tarihi</Label>
          <Input
            id="dekont-tarih"
            type="date"
            value={form.tarih}
            onChange={(e) => guncelle('tarih', e.target.value)}
            className="mt-1.5" />
          
        </div>
        <div>
          <Label htmlFor="dekont-tutar">Ödenen tutar (TL)</Label>
          <Input
            id="dekont-tutar"
            type="number"
            min={0}
            value={form.odenenTutar}
            onChange={(e) => guncelle('odenenTutar', e.target.value)}
            placeholder="0"
            className="mt-1.5" />
          
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

      <div className="space-y-3 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Dijital Dekont Dosyası</p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, JPG veya PNG · En fazla 5 MB
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
      </div>

      <DosyaOnizlemeModal dosya={dosya} acik={onizleme} kapat={() => setOnizleme(false)} />
    </section>);

}