import { useEffect, useState } from 'react';
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
import { AktiflikSecimi } from '../kart/AktiflikSecimi';
import { CokluSecim, YetkiAnahtari } from './CokluSecim';
import { bentler } from '../../data/bentler';
import { birimTurleri } from '../../data/birimler';
import { useApp } from '../../contexts/AppContext';
import { BentKodu, Birim, BirimTuru } from '../../types';

interface BirimFormuProps {
  acik: boolean;
  kapat: () => void;
  mevcut: Birim | null;
}

function bosBirim(): Birim {
  return {
    id: `br-${Date.now()}`,
    ad: '',
    kod: '',
    tur: 'SUBE',
    ustBirimId: 'br-merkez',
    bentler: [],
    makbuzUretebilir: false,
    raporGorebilir: true,
    ajandaKullanabilir: true,
    aktif: true,
    aciklama: ''
  };
}

export function BirimFormu({ acik, kapat, mevcut }: BirimFormuProps) {
  const { birimler, birimKaydet, birimKullanicilari } = useApp();
  const [form, setForm] = useState<Birim>(bosBirim());

  useEffect(() => {
    if (acik) setForm(mevcut ? { ...mevcut } : bosBirim());
  }, [acik, mevcut]);

  const guncelle = <K extends keyof Birim,>(alan: K, deger: Birim[K]) =>
  setForm((eski) => ({ ...eski, [alan]: deger }));

  const bagliKullanici = mevcut ? birimKullanicilari(mevcut.id).length : 0;
  const pasifeAliniyor = !!mevcut && mevcut.aktif && !form.aktif && bagliKullanici > 0;

  const kaydet = () => {
    const sonuc = birimKaydet(form);
    if (!sonuc.basarili) {
      toast.error('Birim kaydedilemedi', { description: sonuc.mesaj });
      return;
    }
    toast.success(mevcut ? 'Birim güncellendi' : 'Birim oluşturuldu', {
      description: `${form.ad} (${form.kod.toUpperCase()})`
    });
    kapat();
  };

  const ustBirimAdaylari = birimler.filter((b) => b.id !== form.id);

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mevcut ? 'Birimi düzenle' : 'Yeni birim ekle'}</DialogTitle>
          <DialogDescription>
            Birim silinmez, pasife alınır. Pasif birimler listede görünmeye devam eder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="by-ad">Birim adı</Label>
              <Input
                id="by-ad"
                value={form.ad}
                onChange={(e) => guncelle('ad', e.target.value)}
                placeholder="Örn. Girne İlçe Karakolu"
                className="mt-1.5" />
              
            </div>
            <div>
              <Label htmlFor="by-kod">Birim kodu</Label>
              <Input
                id="by-kod"
                value={form.kod}
                onChange={(e) => guncelle('kod', e.target.value)}
                placeholder="Örn. GRN"
                className="mt-1.5 font-mono" />
              
            </div>
            <div>
              <Label htmlFor="by-tur">Birim türü</Label>
              <Select value={form.tur} onValueChange={(v) => guncelle('tur', v as BirimTuru)}>
                <SelectTrigger id="by-tur" className="mt-1.5">
                  <SelectValue placeholder="Lütfen birim türü seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {birimTurleri.map((t) =>
                  <SelectItem key={t.deger} value={t.deger}>
                      {t.etiket}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="by-ust">Üst birim</Label>
              <Select
                value={form.ustBirimId || 'YOK'}
                onValueChange={(v) => guncelle('ustBirimId', v === 'YOK' ? undefined : v)}>
                
                <SelectTrigger id="by-ust" className="mt-1.5">
                  <SelectValue placeholder="Lütfen üst birim seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YOK">Üst birim yok (kök birim)</SelectItem>
                  {ustBirimAdaylari.map((b) =>
                  <SelectItem key={b.id} value={b.id}>
                      {b.ad} ({b.kod})
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <AktiflikSecimi
              id="by-durum"
              aktif={form.aktif}
              degistir={(a) => guncelle('aktif', a)}
              aciklama="Pasif birim yeni kullanıcı atamalarında seçilemez." />
            
          </div>

          {pasifeAliniyor &&
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            
              Bu birime atanmış kullanıcılar var. Birimi pasife almak kullanıcıların yetki durumunu
              etkileyebilir. ({bagliKullanici} kullanıcı)
            </p>
          }

          <CokluSecim
            baslik="Birimin yetkili olduğu bentler"
            sutun={3}
            secenekler={bentler.map((b) => ({ deger: b.kod, etiket: `${b.kod} - ${b.baslik}` }))}
            secili={form.bentler}
            degistir={(s) => guncelle('bentler', s as BentKodu[])} />
          

          <div>
            <p className="text-sm font-medium text-foreground">Birim yetkileri</p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
              <YetkiAnahtari
                id="by-makbuz"
                etiket="Makbuz üretebilir"
                deger={form.makbuzUretebilir}
                degistir={(d) => guncelle('makbuzUretebilir', d)} />
              
              <YetkiAnahtari
                id="by-rapor"
                etiket="Rapor görüntüleyebilir"
                deger={form.raporGorebilir}
                degistir={(d) => guncelle('raporGorebilir', d)} />
              
              <YetkiAnahtari
                id="by-ajanda"
                etiket="Ajanda kullanabilir"
                deger={form.ajandaKullanabilir}
                degistir={(d) => guncelle('ajandaKullanabilir', d)} />
              
            </div>
          </div>

          <div>
            <Label htmlFor="by-aciklama">Açıklama / not</Label>
            <Textarea
              id="by-aciklama"
              rows={2}
              value={form.aciklama}
              onChange={(e) => guncelle('aciklama', e.target.value)}
              className="mt-1.5" />
            
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button onClick={kaydet}>{mevcut ? 'Değişiklikleri kaydet' : 'Birimi oluştur'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}