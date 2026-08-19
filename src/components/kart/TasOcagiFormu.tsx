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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { AktiflikSecimi } from './AktiflikSecimi';
import { KuralNotu } from '../common/KuralNotu';
import { TasOcagi } from '../../types';
import { useApp } from '../../contexts/AppContext';

const BOS: TasOcagi = {
  id: '',
  ad: '',
  isletmeciId: '',
  ruhsatNo: '',
  bolge: '',
  adres: '',
  sorumluKisi: '',
  telefon: '',
  aktif: true,
  notlar: ''
};

interface TasOcagiFormuProps {
  acik: boolean;
  kapat: () => void;
  mevcut: TasOcagi | null;
}

export function TasOcagiFormu({ acik, kapat, mevcut }: TasOcagiFormuProps) {
  const { tasOcagiKaydet, isletmeciler } = useApp();
  const [form, setForm] = useState<TasOcagi>(mevcut ?? BOS);

  useEffect(() => {
    if (acik) setForm(mevcut ?? BOS);
  }, [acik, mevcut]);

  const guncelle = <K extends keyof TasOcagi,>(alan: K, deger: TasOcagi[K]) =>
  setForm((eski) => ({ ...eski, [alan]: deger }));

  const gecerli =
  form.ad.trim() !== '' &&
  form.isletmeciId !== '' &&
  form.ruhsatNo.trim() !== '' &&
  form.bolge.trim() !== '';

  const kaydet = () => {
    if (!gecerli) return;
    const yeniMi = !form.id;
    tasOcagiKaydet({
      ...form,
      id: form.id || `to-${Date.now()}`,
      ad: form.ad.trim(),
      ruhsatNo: form.ruhsatNo.trim()
    });
    toast.success(yeniMi ? 'Taş ocağı kartı oluşturuldu' : 'Taş ocağı kartı güncellendi', {
      description: `${form.ad.trim()} · Bağlı işletmeci: ${
      isletmeciler.find((i) => i.id === form.isletmeciId)?.ad ?? '—'}`

    });
    kapat();
  };

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mevcut ? 'Taş Ocağı Kartını Düzenle' : 'Yeni Taş Ocağı Ekle'}</DialogTitle>
          <DialogDescription>
            Her taş ocağı mutlaka bir işletmeciye bağlıdır. Bağlı işletmeci sonradan değiştirilebilir.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="to-ad">Taş ocağı adı</Label>
            <Input
              id="to-ad"
              value={form.ad}
              onChange={(e) => guncelle('ad', e.target.value)}
              placeholder="Örn. Alfa Taş Ocağı"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="to-isletmeci">Bağlı işletmeci / sahip</Label>
            <Select
              value={form.isletmeciId || undefined}
              onValueChange={(v) => guncelle('isletmeciId', v)}>
              
              <SelectTrigger id="to-isletmeci" className="mt-1.5">
                <SelectValue placeholder="Lütfen işletmeci seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {isletmeciler.map((i) =>
                <SelectItem key={i.id} value={i.id}>
                    {i.ad} · {i.tur === 'SAHIS' ? 'Şahıs' : 'Şirket'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              İşletmeci seçilmeden taş ocağı kartı oluşturulamaz.
            </p>
          </div>
          <div>
            <Label htmlFor="to-ruhsat">Ruhsat no</Label>
            <Input
              id="to-ruhsat"
              value={form.ruhsatNo}
              onChange={(e) => guncelle('ruhsatNo', e.target.value)}
              placeholder="Örn. RUH-2026-0118"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="to-bolge">Bölge</Label>
            <Input
              id="to-bolge"
              value={form.bolge}
              onChange={(e) => guncelle('bolge', e.target.value)}
              placeholder="Örn. Lefkoşa"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="to-adres">Adres / konum</Label>
            <Input
              id="to-adres"
              value={form.adres}
              onChange={(e) => guncelle('adres', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="to-sorumlu">Sorumlu kişi</Label>
            <Input
              id="to-sorumlu"
              value={form.sorumluKisi}
              onChange={(e) => guncelle('sorumluKisi', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="to-telefon">Telefon</Label>
            <Input
              id="to-telefon"
              value={form.telefon}
              onChange={(e) => guncelle('telefon', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <AktiflikSecimi
            id="to-aktif"
            aktif={form.aktif}
            degistir={(a) => guncelle('aktif', a)}
            aciklama="Pasif ocaklar patlatma kullanımında listelenmez." />
          
          <div className="sm:col-span-2">
            <Label htmlFor="to-notlar">Notlar</Label>
            <Textarea
              id="to-notlar"
              rows={2}
              value={form.notlar}
              onChange={(e) => guncelle('notlar', e.target.value)}
              className="mt-1.5" />
            
          </div>
        </div>

        <KuralNotu>
          Patlatma yapıldığında kredi taş ocağından değil, işletmecinin ortak kredisinden düşer.
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