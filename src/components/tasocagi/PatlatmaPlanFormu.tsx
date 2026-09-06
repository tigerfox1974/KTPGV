import { useEffect, useState } from 'react';
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
import { BilgiKaynagiSecimi } from './BilgiKaynagiSecimi';
import { DosyaKarti } from '../islem/DosyaKarti';
import { useApp } from '../../contexts/AppContext';
import { BilgiKaynagi, DekontDosyasi } from '../../types';
import { dosyaSec } from '../../utils/dosya';

const BUGUN = new Date().toISOString().slice(0, 10);

/** Hızlı patlatma planlama. Kredi bu aşamada düşülmez. */
export function PatlatmaPlanFormu({ acik, kapat }: {acik: boolean;kapat: () => void;}) {
  const { isletmeciler, tasOcaklari, krediOzeti, patlatmaPlanla } = useApp();

  const [isletmeciId, setIsletmeciId] = useState('');
  const [tasOcagiId, setTasOcagiId] = useState('');
  const [tarih, setTarih] = useState(BUGUN);
  const [saat, setSaat] = useState('10:00');
  const [adet, setAdet] = useState('1');
  const [bilgiKaynagi, setBilgiKaynagi] = useState<BilgiKaynagi | ''>('SOZLU');
  const [belgeNo, setBelgeNo] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [dosya, setDosya] = useState<DekontDosyasi | null>(null);

  useEffect(() => {
    if (!acik) return;
    setIsletmeciId('');
    setTasOcagiId('');
    setTarih(BUGUN);
    setSaat('10:00');
    setAdet('1');
    setBilgiKaynagi('SOZLU');
    setBelgeNo('');
    setAciklama('');
    setDosya(null);
  }, [acik]);

  const ozet = isletmeciId ? krediOzeti(isletmeciId) : null;
  const planlananAdet = Number(adet) || 0;
  const ocaklar = tasOcaklari.filter((t) => t.isletmeciId === isletmeciId && t.aktif);
  const krediYetersiz = !!ozet && planlananAdet > ozet.kalan;

  const gecerli =
  !!isletmeciId && !!tasOcagiId && !!tarih && !!saat && planlananAdet > 0 && !!bilgiKaynagi;

  const kaydet = () => {
    if (!gecerli || !bilgiKaynagi) return;
    const sonuc = patlatmaPlanla({
      isletmeciId,
      tasOcagiId,
      tarih,
      saat,
      adet: planlananAdet,
      bilgiKaynagi,
      belgeNo: belgeNo.trim(),
      aciklama: aciklama.trim(),
      dosya
    });
    if (!sonuc.basarili) {
      toast.error('Patlatma planlanamadı', { description: sonuc.mesaj });
      return;
    }
    if (sonuc.krediYetersiz) {
      toast.warning('Plan oluşturuldu — kredi yetersiz', {
        description:
        'Patlatma “Yapıldı” olarak işlenmeden önce kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.'
      });
    } else {
      toast.success('Patlatma takvime eklendi', {
        description: `Durum: Sonuç Bekliyor · Kredi bu aşamada düşülmedi.`
      });
    }
    kapat();
  };

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Patlatma Planla</DialogTitle>
          <DialogDescription>
            Kredi planlama aşamasında düşülmez. Kredi yalnızca patlatma “Yapıldı” olarak
            işlendiğinde düşer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pp-isletmeci">İşletmeci / sahip</Label>
            <Select
              value={isletmeciId || undefined}
              onValueChange={(v) => {
                setIsletmeciId(v);
                setTasOcagiId('');
              }}>
              
              <SelectTrigger id="pp-isletmeci" className="mt-1.5">
                <SelectValue placeholder="Lütfen işletmeci seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {isletmeciler.
                filter((i) => i.aktif).
                map((i) =>
                <SelectItem key={i.id} value={i.id}>
                      {i.ad}
                    </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pp-ocak">Taş ocağı</Label>
            <Select value={tasOcagiId || undefined} onValueChange={setTasOcagiId} disabled={!isletmeciId}>
              <SelectTrigger id="pp-ocak" className="mt-1.5">
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
            <Label htmlFor="pp-tarih">Planlanan tarih</Label>
            <Input
              id="pp-tarih"
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="pp-saat">Planlanan saat</Label>
            <Input
              id="pp-saat"
              type="time"
              value={saat}
              onChange={(e) => setSaat(e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="pp-adet">Patlatma adedi</Label>
            <Input
              id="pp-adet"
              type="number"
              min={1}
              step={1}
              value={adet}
              onChange={(e) => setAdet(e.target.value)}
              className="mt-1.5" />
            
          </div>
          <BilgiKaynagiSecimi id="pp-kaynak" deger={bilgiKaynagi} degistir={setBilgiKaynagi} />
          <div className="sm:col-span-2">
            <Label htmlFor="pp-belge">Varsa belge / bildirim no</Label>
            <Input
              id="pp-belge"
              value={belgeNo}
              onChange={(e) => setBelgeNo(e.target.value)}
              placeholder="Zorunlu değil"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pp-aciklama">Açıklama / not</Label>
            <Textarea
              id="pp-aciklama"
              rows={2}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Örn. Sabah vardiyası, güney sahada planlanan patlatma."
              className="mt-1.5" />
            
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Varsa belge / rapor dosyası ekle
            </p>
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
          krediYetersiz ?
          'border-amber-200 bg-amber-50 text-amber-900' :
          'border-slate-200 bg-muted/40 text-foreground'}`
          }
          role={krediYetersiz ? 'alert' : undefined}>
          
            <p className="font-medium">
              Kullanılabilir kredi: {ozet.kalan} · Sonuç bekleyen planlı kredi: {ozet.planlanan}
            </p>
            {krediYetersiz &&
          <p className="mt-1">
                Bu işletmecinin kullanılabilir kredisi planlanan patlatma adedinden düşük. Plan
                kaydı oluşturulabilir; ancak patlatma “Yapıldı” olarak işlenmeden önce kredi yükleme
                / ödeme doğrulama / makbuz süreci tamamlanmalıdır.
              </p>
          }
          </div>
        }

        <DialogFooter>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button onClick={kaydet} disabled={!gecerli}>
            Planla ve takvime ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}