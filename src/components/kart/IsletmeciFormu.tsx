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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { AktiflikSecimi } from './AktiflikSecimi';
import { KuralNotu } from '../common/KuralNotu';
import { Isletmeci } from '../../types';
import { useApp } from '../../contexts/AppContext';

const BOS: Isletmeci = {
  id: '',
  ad: '',
  tur: 'SAHIS',
  kimlikNo: '',
  telefon: '',
  adres: '',
  yetkiliKisi: '',
  aktif: true
};

interface IsletmeciFormuProps {
  acik: boolean;
  kapat: () => void;
  mevcut: Isletmeci | null;
}

export function IsletmeciFormu({ acik, kapat, mevcut }: IsletmeciFormuProps) {
  const { isletmeciKaydet } = useApp();
  const [form, setForm] = useState<Isletmeci>(mevcut ?? BOS);

  useEffect(() => {
    if (acik) setForm(mevcut ?? BOS);
  }, [acik, mevcut]);

  const guncelle = <K extends keyof Isletmeci,>(alan: K, deger: Isletmeci[K]) =>
  setForm((eski) => ({ ...eski, [alan]: deger }));

  const gecerli = form.ad.trim() !== '' && form.kimlikNo.trim() !== '' && form.telefon.trim() !== '';

  const kaydet = () => {
    if (!gecerli) return;
    const yeniMi = !form.id;
    isletmeciKaydet({
      ...form,
      id: form.id || `im-${Date.now()}`,
      ad: form.ad.trim(),
      kimlikNo: form.kimlikNo.trim(),
      yetkiliKisi: form.yetkiliKisi.trim() || form.ad.trim()
    });
    toast.success(yeniMi ? 'İşletmeci kartı oluşturuldu' : 'İşletmeci kartı güncellendi', {
      description: `${form.ad.trim()} · Patlatma kredisi bu hesapta tutulur.`
    });
    kapat();
  };

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mevcut ? 'İşletmeci / Sahip Kartını Düzenle' : 'Yeni İşletmeci / Sahip Ekle'}
          </DialogTitle>
          <DialogDescription>
            Patlatma kredisi taş ocağına değil, işletmeci / sahip hesabına bağlı tutulur.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="im-ad">İşletmeci / sahip adı</Label>
            <Input
              id="im-ad"
              value={form.ad}
              onChange={(e) => guncelle('ad', e.target.value)}
              placeholder="Örn. Ahmet Mehmet veya Beyaz Taş Madencilik Ltd."
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="im-tur">Tür</Label>
            <Select
              value={form.tur}
              onValueChange={(v) => guncelle('tur', v as Isletmeci['tur'])}>
              
              <SelectTrigger id="im-tur" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAHIS">Şahıs</SelectItem>
                <SelectItem value="SIRKET">Şirket</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="im-kimlik">Kimlik / vergi / şirket no</Label>
            <Input
              id="im-kimlik"
              value={form.kimlikNo}
              onChange={(e) => guncelle('kimlikNo', e.target.value)}
              placeholder="Örn. 11223344556 veya KKTC-5590231"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="im-telefon">Telefon</Label>
            <Input
              id="im-telefon"
              value={form.telefon}
              onChange={(e) => guncelle('telefon', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="im-yetkili">Yetkili kişi</Label>
            <Input
              id="im-yetkili"
              value={form.yetkiliKisi}
              onChange={(e) => guncelle('yetkiliKisi', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="im-adres">Adres</Label>
            <Input
              id="im-adres"
              value={form.adres}
              onChange={(e) => guncelle('adres', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <AktiflikSecimi
            id="im-aktif"
            aktif={form.aktif}
            degistir={(a) => guncelle('aktif', a)}
            aciklama="Pasif işletmeciler yeni işlemde listelenmez." />
          
        </div>

        <KuralNotu>
          Aynı işletmeciye birden fazla taş ocağı bağlanabilir ve bu ocakların tamamı işletmecinin
          ortak kredisinden düşer.
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