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
import { KuralNotu } from '../common/KuralNotu';
import { BilgiKaynagiSecimi } from './BilgiKaynagiSecimi';
import { useApp } from '../../contexts/AppContext';
import { AjandaKaydi, BilgiKaynagi } from '../../types';
import { formatTarihSaat } from '../../utils/currency';

export type SonucTuru = 'YAPILMADI' | 'ERTELENDI' | 'IPTAL';

const BASLIKLAR: Record<SonucTuru, {baslik: string;aciklama: string;buton: string;}> = {
  YAPILMADI: {
    baslik: 'Patlatma Yapılmadı',
    aciklama: 'Kredi düşülmez. Kart “Yapılmadı” olarak sonuçlanır.',
    buton: 'Yapılmadı olarak işle'
  },
  ERTELENDI: {
    baslik: 'Patlatma Ertelendi',
    aciklama: 'Kredi düşülmez. Kart yeni tarih ve saat ile takvimde güncellenir.',
    buton: 'Ertele ve takvimi güncelle'
  },
  IPTAL: {
    baslik: 'Patlatma İptal Edildi',
    aciklama: 'Kredi düşülmez. Kart “İptal Edildi” olarak kapanır.',
    buton: 'İptal olarak işle'
  }
};

const TOAST_METINLERI: Record<SonucTuru, string> = {
  YAPILMADI: 'Patlatma yapılmadı',
  ERTELENDI: 'Patlatma ertelendi',
  IPTAL: 'Patlatma iptal edildi'
};

export function PatlatmaSonucModali({
  acik,
  kapat,
  tur,
  kayit





}: {acik: boolean;kapat: () => void;tur: SonucTuru;kayit: AjandaKaydi | null;}) {
  const { patlatmaSonucIsle } = useApp();
  const [bilgiKaynagi, setBilgiKaynagi] = useState<BilgiKaynagi | ''>('SOZLU');
  const [neden, setNeden] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [belgeNo, setBelgeNo] = useState('');
  const [yeniTarih, setYeniTarih] = useState('');
  const [yeniSaat, setYeniSaat] = useState('');

  useEffect(() => {
    if (!acik) return;
    setBilgiKaynagi('SOZLU');
    setNeden('');
    setAciklama('');
    setBelgeNo('');
    setYeniTarih(kayit?.tarih ?? '');
    setYeniSaat(kayit?.saat ?? '');
  }, [acik, kayit]);

  if (!kayit) return null;

  const metin = BASLIKLAR[tur];
  const gecerli =
  !!bilgiKaynagi && (tur !== 'ERTELENDI' || !!yeniTarih && !!yeniSaat) && neden.trim() !== '';

  const kaydet = () => {
    if (!gecerli || !bilgiKaynagi) return;
    const sonuc = patlatmaSonucIsle({
      ajandaId: kayit.id,
      sonuc: tur,
      bilgiKaynagi,
      neden: neden.trim(),
      aciklama: aciklama.trim(),
      belgeNo: belgeNo.trim(),
      yeniTarih: tur === 'ERTELENDI' ? yeniTarih : undefined,
      yeniSaat: tur === 'ERTELENDI' ? yeniSaat : undefined
    });
    if (!sonuc.basarili) {
      toast.error('İşlem tamamlanamadı', { description: sonuc.mesaj });
      return;
    }
    toast.success(TOAST_METINLERI[tur], { description: 'Kredi düşülmedi.' });
    kapat();
  };

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{metin.baslik}</DialogTitle>
          <DialogDescription>{metin.aciklama}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <p className="font-medium text-foreground">{kayit.yer}</p>
          <p className="text-muted-foreground">
            {kayit.talepEden} · {formatTarihSaat(kayit.tarih, kayit.saat)} · Planlanan patlatma:{' '}
            {kayit.planlananAdet ?? 1}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {tur === 'ERTELENDI' &&
          <>
              <div>
                <Label htmlFor="ps-tarih">Yeni tarih</Label>
                <Input
                id="ps-tarih"
                type="date"
                value={yeniTarih}
                onChange={(e) => setYeniTarih(e.target.value)}
                className="mt-1.5" />
              
              </div>
              <div>
                <Label htmlFor="ps-saat">Yeni saat</Label>
                <Input
                id="ps-saat"
                type="time"
                value={yeniSaat}
                onChange={(e) => setYeniSaat(e.target.value)}
                className="mt-1.5" />
              
              </div>
            </>
          }
          <div className={tur === 'ERTELENDI' ? 'sm:col-span-2' : ''}>
            <Label htmlFor="ps-neden">
              {tur === 'ERTELENDI' ? 'Erteleme nedeni' : tur === 'IPTAL' ? 'İptal nedeni' : 'Neden'}
            </Label>
            <Input
              id="ps-neden"
              value={neden}
              onChange={(e) => setNeden(e.target.value)}
              placeholder="Örn. Hava koşulları"
              className="mt-1.5" />
            
          </div>
          <BilgiKaynagiSecimi id="ps-kaynak" deger={bilgiKaynagi} degistir={setBilgiKaynagi} />
          <div>
            <Label htmlFor="ps-belge">Varsa belge / bildirim no</Label>
            <Input
              id="ps-belge"
              value={belgeNo}
              onChange={(e) => setBelgeNo(e.target.value)}
              placeholder="Zorunlu değil"
              className="mt-1.5" />
            
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ps-aciklama">Açıklama</Label>
            <Textarea
              id="ps-aciklama"
              rows={2}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              className="mt-1.5" />
            
          </div>
        </div>

        <KuralNotu>
          Bu sonuçlarda kredi hareketine kullanım düşümü yazılmaz. Kredi yalnızca patlatma “Yapıldı”
          olarak işlendiğinde düşer.
        </KuralNotu>

        <DialogFooter>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button onClick={kaydet} disabled={!gecerli}>
            {metin.buton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}