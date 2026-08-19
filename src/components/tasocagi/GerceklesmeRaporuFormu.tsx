import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
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
import { KuralNotu } from '../common/KuralNotu';
import { DosyaKarti } from '../islem/DosyaKarti';
import { useApp } from '../../contexts/AppContext';
import { DekontDosyasi } from '../../types';
import { dosyaSec } from '../../utils/dosya';

export interface GerceklesmeBaslangici {
  isletmeciId: string;
  tasOcagiId: string;
  planKayitNo?: string;
  ajandaId?: string;
  tarih: string;
  saat: string;
  adet: number;
}

interface GerceklesmeRaporuFormuProps {
  acik: boolean;
  kapat: () => void;
  baslangic: GerceklesmeBaslangici | null;
}

const BUGUN = new Date().toISOString().slice(0, 10);

export function GerceklesmeRaporuFormu({
  acik,
  kapat,
  baslangic
}: GerceklesmeRaporuFormuProps) {
  const { isletmeciler, tasOcaklari, krediOzeti, patlatmaGerceklesmeIsle, kullanici } = useApp();

  const [isletmeciId, setIsletmeciId] = useState('');
  const [tasOcagiId, setTasOcagiId] = useState('');
  const [tarih, setTarih] = useState(BUGUN);
  const [saat, setSaat] = useState('10:00');
  const [adet, setAdet] = useState('1');
  const [raporNo, setRaporNo] = useState('');
  const [bildiren, setBildiren] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [dosya, setDosya] = useState<DekontDosyasi | null>(null);

  useEffect(() => {
    if (!acik) return;
    setIsletmeciId(baslangic?.isletmeciId ?? '');
    setTasOcagiId(baslangic?.tasOcagiId ?? '');
    setTarih(baslangic?.tarih || BUGUN);
    setSaat(baslangic?.saat || '10:00');
    setAdet(String(baslangic?.adet ?? 1));
    setRaporNo('');
    setBildiren(kullanici?.birim ?? '');
    setAciklama('');
    setDosya(null);
  }, [acik, baslangic, kullanici]);

  const ozet = isletmeciId ? krediOzeti(isletmeciId) : null;
  const gerceklesenAdet = Number(adet) || 0;
  const ocaklar = tasOcaklari.filter((t) => t.isletmeciId === isletmeciId);
  const yeterli = !!ozet && gerceklesenAdet > 0 && gerceklesenAdet <= ozet.kalan;

  const gecerli =
  !!isletmeciId &&
  !!tasOcagiId &&
  !!tarih &&
  !!saat &&
  gerceklesenAdet > 0 &&
  raporNo.trim() !== '' &&
  bildiren.trim() !== '';

  const kaydet = () => {
    if (!gecerli) return;
    const sonuc = patlatmaGerceklesmeIsle({
      isletmeciId,
      tasOcagiId,
      planKayitNo: baslangic?.planKayitNo,
      ajandaId: baslangic?.ajandaId,
      tarih,
      saat,
      adet: gerceklesenAdet,
      raporNo: raporNo.trim(),
      bildiren: bildiren.trim(),
      aciklama: aciklama.trim(),
      raporDosyasi: dosya
    });

    if (!sonuc.basarili) {
      toast.error('Kredi düşümü yapılamadı', { description: sonuc.mesaj });
      return;
    }

    toast.success('Patlatma gerçekleşme raporu işlendi', {
      description: `${sonuc.kayitNo} · Önceki kredi ${sonuc.oncekiKredi} · Düşülen ${gerceklesenAdet} · Kalan ${sonuc.kalanKredi}`
    });
    kapat();
  };

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Patlatma Gerçekleşme Raporu</DialogTitle>
          <DialogDescription>
            Kredi düşümü yalnızca bu kayıt ile yapılır. Planlama aşamasında kredi düşülmez.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="gr-isletmeci">İşletmeci / sahip</Label>
            <Select
              value={isletmeciId || undefined}
              onValueChange={(v) => {
                setIsletmeciId(v);
                setTasOcagiId('');
              }}>
              
              <SelectTrigger id="gr-isletmeci" className="mt-1.5">
                <SelectValue placeholder="Lütfen işletmeci seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {isletmeciler.map((i) =>
                <SelectItem key={i.id} value={i.id}>
                    {i.ad}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gr-ocak">Taş ocağı</Label>
            <Select
              value={tasOcagiId || undefined}
              onValueChange={setTasOcagiId}
              disabled={!isletmeciId}>
              
              <SelectTrigger id="gr-ocak" className="mt-1.5">
                <SelectValue
                  placeholder={isletmeciId ? 'Lütfen taş ocağı seçiniz' : 'Önce işletmeci seçiniz'} />
                
              </SelectTrigger>
              <SelectContent>
                {ocaklar.map((t) =>
                <SelectItem key={t.id} value={t.id}>
                    {t.ad} · {t.bolge}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="gr-plan">İlgili plan kaydı no</Label>
            <Input
              id="gr-plan"
              value={baslangic?.planKayitNo ?? 'Plan kaydına bağlı değil'}
              readOnly
              className="mt-1.5 bg-muted/50 font-mono text-xs" />
            
          </div>
          <div>
            <Label htmlFor="gr-tarih">Gerçekleşen patlatma tarihi</Label>
            <Input
              id="gr-tarih"
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="gr-saat">Gerçekleşen patlatma saati</Label>
            <Input
              id="gr-saat"
              type="time"
              value={saat}
              onChange={(e) => setSaat(e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="gr-adet">Gerçekleşen patlatma adedi</Label>
            <Input
              id="gr-adet"
              type="number"
              min={1}
              step={1}
              value={adet}
              onChange={(e) => setAdet(e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="gr-rapor-no">Gelen rapor no / belge no</Label>
            <Input
              id="gr-rapor-no"
              value={raporNo}
              onChange={(e) => setRaporNo(e.target.value)}
              placeholder="Örn. PR-2026-00418"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="gr-bildiren">Raporu bildiren kişi / birim</Label>
            <Input
              id="gr-bildiren"
              value={bildiren}
              onChange={(e) => setBildiren(e.target.value)}
              placeholder="Örn. Taş Ocağı Birimi"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="gr-aciklama">Açıklama</Label>
            <Textarea
              id="gr-aciklama"
              rows={2}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn. Patlatma yapıldığına dair saha raporu alındı."
              className="mt-1.5" />
            
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">Rapor dosyası (zorunlu değil)</p>
              <p className="text-xs text-muted-foreground">PDF, JPG veya PNG · En fazla 5 MB</p>
            </div>
            {!dosya &&
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dosyaSec('PERSONEL', setDosya)}>
              
                <Upload className="h-4 w-4" aria-hidden="true" />
                Rapor dosyası yükle
              </Button>
            }
          </div>
          {dosya && <DosyaKarti dosya={dosya} kaldir={() => setDosya(null)} />}
        </div>

        {ozet &&
        <div
          className={`rounded-lg border p-4 text-sm ${
          yeterli ?
          'border-emerald-200 bg-emerald-50 text-emerald-900' :
          'border-rose-200 bg-rose-50 text-rose-900'}`
          }
          role={yeterli ? undefined : 'alert'}>
          
            <p className="font-medium">
              {yeterli ? 'Kredi yeterli — düşüm yapılabilir' : 'Kullanılabilir kredi yetersiz'}
            </p>
            <p className="mt-1">
              Kalan kullanılabilir kredi: {ozet.kalan} · Düşülecek: {gerceklesenAdet} · İşlem sonrası
              kalan: {ozet.kalan - gerceklesenAdet}
            </p>
            {!yeterli &&
          <p className="mt-1">
                Bu patlatma gerçekleşme raporu işlenmeden önce işletmeciye kredi yükleme / ödeme
                doğrulama / makbuz süreci tamamlanmalıdır.
              </p>
          }
          </div>
        }

        <KuralNotu>
          Kredi taş ocağından değil işletmecinin ortak hesabından düşer. Kayıt sonrası kredi
          hareketine “gerçekleşmiş kullanım” olarak işlenir, ajanda kaydı “Görev Tamamlandı” olur ve
          audit log’a yazılır.
        </KuralNotu>

        <DialogFooter>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button onClick={kaydet} disabled={!gecerli || !yeterli}>
            Raporu işle ve krediyi düş
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}