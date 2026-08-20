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
import { BilgiKaynagiSecimi } from './BilgiKaynagiSecimi';
import { DosyaKarti } from '../islem/DosyaKarti';
import { useApp } from '../../contexts/AppContext';
import { BilgiKaynagi, DekontDosyasi } from '../../types';
import { dosyaSec } from '../../utils/dosya';

export interface PatlatmaBaslangici {
  isletmeciId: string;
  tasOcagiId: string;
  planKayitNo?: string;
  ajandaId?: string;
  tarih: string;
  saat: string;
  adet: number;
}

interface PatlatmaYapildiModaliProps {
  acik: boolean;
  kapat: () => void;
  baslangic: PatlatmaBaslangici | null;
}

const BUGUN = new Date().toISOString().slice(0, 10);

/**
 * “Patlatma Yapıldı mı?” onay modalı — kredi düşümü YALNIZCA burada yapılır.
 * Belge/dosya zorunlu değildir; bilgi sözlü ya da telefonla da gelebilir.
 */
export function PatlatmaYapildiModali({ acik, kapat, baslangic }: PatlatmaYapildiModaliProps) {
  const { isletmeciler, tasOcaklari, krediOzeti, patlatmaGerceklesmeIsle, kullanici } = useApp();

  const [isletmeciId, setIsletmeciId] = useState('');
  const [tasOcagiId, setTasOcagiId] = useState('');
  const [tarih, setTarih] = useState(BUGUN);
  const [saat, setSaat] = useState('10:00');
  const [adet, setAdet] = useState('1');
  const [bilgiKaynagi, setBilgiKaynagi] = useState<BilgiKaynagi | ''>('SOZLU');
  const [belgeNo, setBelgeNo] = useState('');
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
    setBilgiKaynagi('SOZLU');
    setBelgeNo('');
    setBildiren(kullanici?.birim ?? '');
    setAciklama('');
    setDosya(null);
  }, [acik, baslangic, kullanici]);

  const karttanAcildi = !!baslangic?.ajandaId;
  const ozet = isletmeciId ? krediOzeti(isletmeciId) : null;
  const dusulecek = Number(adet) || 0;
  const ocaklar = tasOcaklari.filter((t) => t.isletmeciId === isletmeciId);
  const isletmeciAdi = isletmeciler.find((i) => i.id === isletmeciId)?.ad ?? '—';
  const ocakAdi = tasOcaklari.find((t) => t.id === tasOcagiId)?.ad ?? '—';
  const yeterli = !!ozet && dusulecek > 0 && dusulecek <= ozet.kalan;

  const gecerli = !!isletmeciId && !!tasOcagiId && !!tarih && !!saat && dusulecek > 0 && !!bilgiKaynagi;

  const kaydet = () => {
    if (!gecerli || !bilgiKaynagi) return;
    const sonuc = patlatmaGerceklesmeIsle({
      isletmeciId,
      tasOcagiId,
      planKayitNo: baslangic?.planKayitNo,
      ajandaId: baslangic?.ajandaId,
      tarih,
      saat,
      adet: dusulecek,
      bilgiKaynagi,
      raporNo: belgeNo.trim(),
      bildiren: bildiren.trim(),
      aciklama: aciklama.trim(),
      raporDosyasi: dosya
    });

    if (!sonuc.basarili) {
      toast.error('Kredi düşümü yapılamadı', { description: sonuc.mesaj });
      return;
    }

    toast.success('Patlatma yapıldı olarak işlendi', {
      description: `${dusulecek} kredi düşüldü. Kalan kredi: ${sonuc.kalanKredi}.`
    });
    kapat();
  };

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Patlatma Yapıldı mı?</DialogTitle>
          <DialogDescription>
            Onaylandığında kredi işletmecinin ortak hesabından düşülür.
          </DialogDescription>
        </DialogHeader>

        {karttanAcildi ?
        <dl className="grid gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 sm:block">
              <dt className="text-muted-foreground">İşletmeci</dt>
              <dd className="font-medium text-foreground">{isletmeciAdi}</dd>
            </div>
            <div className="flex justify-between gap-3 sm:block">
              <dt className="text-muted-foreground">Taş ocağı</dt>
              <dd className="font-medium text-foreground">{ocakAdi}</dd>
            </div>
            <div className="flex justify-between gap-3 sm:block">
              <dt className="text-muted-foreground">Planlanan tarih / saat</dt>
              <dd className="font-medium text-foreground">
                {tarih} · {saat}
              </dd>
            </div>
            <div className="flex justify-between gap-3 sm:block">
              <dt className="text-muted-foreground">Düşülecek kredi</dt>
              <dd className="font-medium text-foreground">{dusulecek}</dd>
            </div>
            <div className="flex justify-between gap-3 sm:block">
              <dt className="text-muted-foreground">Mevcut kalan kredi</dt>
              <dd className="font-medium text-foreground">{ozet?.kalan ?? 0}</dd>
            </div>
            <div className="flex justify-between gap-3 sm:block">
              <dt className="text-muted-foreground">İşlem sonrası kalan kredi</dt>
              <dd className="font-medium text-foreground">{(ozet?.kalan ?? 0) - dusulecek}</dd>
            </div>
          </dl> :

        <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="py-isletmeci">İşletmeci / sahip</Label>
              <Select
              value={isletmeciId || undefined}
              onValueChange={(v) => {
                setIsletmeciId(v);
                setTasOcagiId('');
              }}>
              
                <SelectTrigger id="py-isletmeci" className="mt-1.5">
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
              <Label htmlFor="py-ocak">Taş ocağı</Label>
              <Select value={tasOcagiId || undefined} onValueChange={setTasOcagiId} disabled={!isletmeciId}>
                <SelectTrigger id="py-ocak" className="mt-1.5">
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
            <div>
              <Label htmlFor="py-tarih">Patlatma tarihi</Label>
              <Input
              id="py-tarih"
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              className="mt-1.5" />
            
            </div>
            <div>
              <Label htmlFor="py-saat">Patlatma saati</Label>
              <Input
              id="py-saat"
              type="time"
              value={saat}
              onChange={(e) => setSaat(e.target.value)}
              className="mt-1.5" />
            
            </div>
            <div>
              <Label htmlFor="py-adet">Patlatma adedi</Label>
              <Input
              id="py-adet"
              type="number"
              min={1}
              step={1}
              value={adet}
              onChange={(e) => setAdet(e.target.value)}
              className="mt-1.5" />
            
            </div>
          </div>
        }

        <div className="grid gap-4 sm:grid-cols-2">
          <BilgiKaynagiSecimi id="py-kaynak" deger={bilgiKaynagi} degistir={setBilgiKaynagi} />
          <div>
            <Label htmlFor="py-belge">Varsa belge / bildirim no</Label>
            <Input
              id="py-belge"
              value={belgeNo}
              onChange={(e) => setBelgeNo(e.target.value)}
              placeholder="Zorunlu değil"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="py-bildiren">Bilgiyi bildiren kişi / birim</Label>
            <Input
              id="py-bildiren"
              value={bildiren}
              onChange={(e) => setBildiren(e.target.value)}
              placeholder="Örn. Taş Ocağı Birimi"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="py-aciklama">Açıklama</Label>
            <Textarea
              id="py-aciklama"
              rows={2}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn. Patlatmanın yapıldığı saha sorumlusu tarafından telefonla bildirildi."
              className="mt-1.5" />
            
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Varsa belge / rapor dosyası ekle</p>
            <p className="text-xs text-muted-foreground">Zorunlu değil · PDF, JPG veya PNG</p>
          </div>
          {!dosya &&
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => dosyaSec('PERSONEL', setDosya)}>
            
              <Upload className="h-4 w-4" aria-hidden="true" />
              Dosya ekle
            </Button>
          }
        </div>
        {dosya && <DosyaKarti dosya={dosya} kaldir={() => setDosya(null)} />}

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
              Kalan kullanılabilir kredi: {ozet.kalan} · Düşülecek: {dusulecek} · İşlem sonrası
              kalan: {ozet.kalan - dusulecek}
            </p>
            {!yeterli &&
          <p className="mt-1">
                Bu patlatma yapıldı olarak işlenmeden önce işletmeciye kredi yükleme / ödeme
                doğrulama / makbuz süreci tamamlanmalıdır.
              </p>
          }
          </div>
        }

        <KuralNotu>
          Kredi taş ocağından değil işletmecinin ortak hesabından düşer. Onay sonrası kredi hareketi
          oluşur, kart “Yapıldı” durumuna geçer ve audit log’a yazılır.
        </KuralNotu>

        <DialogFooter>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button onClick={kaydet} disabled={!gecerli || !yeterli}>
            Onayla ve krediyi düş
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}