import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { AktiflikSecimi } from './AktiflikSecimi';
import { KuralNotu } from '../common/KuralNotu';
import { SigortaSirketi } from '../../types';
import { useApp } from '../../contexts/AppContext';

const BOS: SigortaSirketi = {
  id: '',
  ad: '',
  vergiNo: '',
  adres: '',
  telefon: '',
  eposta: '',
  yetkiliKisi: '',
  yetkiliTelefon: '',
  aktif: true,
  notlar: ''
};

interface SigortaSirketiFormuProps {
  acik: boolean;
  kapat: () => void;
  /** Düzenlenecek kart; yeni kayıt için null. */
  mevcut: SigortaSirketi | null;
}

export function SigortaSirketiFormu({ acik, kapat, mevcut }: SigortaSirketiFormuProps) {
  const { sigortaKaydet } = useApp();
  const [form, setForm] = useState<SigortaSirketi>(mevcut ?? BOS);

  useEffect(() => {
    if (acik) setForm(mevcut ?? BOS);
  }, [acik, mevcut]);

  const guncelle = <K extends keyof SigortaSirketi,>(alan: K, deger: SigortaSirketi[K]) =>
  setForm((eski) => ({ ...eski, [alan]: deger }));

  const gecerli = form.ad.trim() !== '' && form.vergiNo.trim() !== '' && form.telefon.trim() !== '';

  const kaydet = () => {
    if (!gecerli) return;
    const yeniMi = !form.id;
    sigortaKaydet({
      ...form,
      id: form.id || `sg-${Date.now()}`,
      ad: form.ad.trim(),
      vergiNo: form.vergiNo.trim()
    });
    toast.success(yeniMi ? 'Sigorta şirketi kartı oluşturuldu' : 'Sigorta şirketi kartı güncellendi', {
      description: `${form.ad.trim()} · Trafik başvurularında seçilebilir.`
    });
    kapat();
  };

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mevcut ? 'Sigorta Şirketi Kartını Düzenle' : 'Yeni Sigorta Şirketi Ekle'}
          </DialogTitle>
          <DialogDescription>
            Trafik raporu başvuruları yalnızca bu kart listesinden seçilerek açılır.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="sg-ad">Şirket adı</Label>
            <Input
              id="sg-ad"
              value={form.ad}
              onChange={(e) => guncelle('ad', e.target.value)}
              placeholder="Örn. Kıbrıs Sigorta Ltd."
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="sg-vergi">Vergi / kayıt no</Label>
            <Input
              id="sg-vergi"
              value={form.vergiNo}
              onChange={(e) => guncelle('vergiNo', e.target.value)}
              placeholder="Örn. KKTC-1120045"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="sg-telefon">Telefon</Label>
            <Input
              id="sg-telefon"
              value={form.telefon}
              onChange={(e) => guncelle('telefon', e.target.value)}
              placeholder="Örn. 0392 227 11 20"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="sg-adres">Adres</Label>
            <Input
              id="sg-adres"
              value={form.adres}
              onChange={(e) => guncelle('adres', e.target.value)}
              placeholder="Örn. Şehit Ecvet Yusuf Cad. No:12, Lefkoşa"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="sg-eposta">E-posta</Label>
            <Input
              id="sg-eposta"
              type="email"
              value={form.eposta}
              onChange={(e) => guncelle('eposta', e.target.value)}
              placeholder="ornek@sigorta.com"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="sg-yetkili">Yetkili kişi</Label>
            <Input
              id="sg-yetkili"
              value={form.yetkiliKisi}
              onChange={(e) => guncelle('yetkiliKisi', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="sg-yetkili-tel">Yetkili telefon</Label>
            <Input
              id="sg-yetkili-tel"
              value={form.yetkiliTelefon}
              onChange={(e) => guncelle('yetkiliTelefon', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <AktiflikSecimi
            id="sg-aktif"
            aktif={form.aktif}
            degistir={(a) => guncelle('aktif', a)}
            aciklama="Pasif kartlar trafik başvurusunda listelenmez." />
          
          <div className="sm:col-span-2">
            <Label htmlFor="sg-notlar">Notlar</Label>
            <Textarea
              id="sg-notlar"
              rows={2}
              value={form.notlar}
              onChange={(e) => guncelle('notlar', e.target.value)}
              className="mt-1.5" />
            
          </div>
        </div>

        <KuralNotu>
          Bireysel, avukat, başka kurum veya serbest trafik başvurusu yoktur. Sigorta şirketi
          seçilmeden trafik raporu kaydı oluşturulamaz.
        </KuralNotu>

        <DialogFooter>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button onClick={kaydet} disabled={!gecerli}>
            {mevcut ? 'Değişiklikleri kaydet' : 'Kartı oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}