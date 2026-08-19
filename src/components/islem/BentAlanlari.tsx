import React from 'react';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../ui/Select';
import { KuralNotu } from '../common/KuralNotu';
import { sigortaSirketleri } from '../../data/sigortaSirketleri';
import { isletmeciler, tasOcaklari } from '../../data/tasOcagi';
import { BentKodu, EIslemTuru, FAltTur } from '../../types';
import { formatTL } from '../../utils/currency';
import { KrediOzeti } from '../../contexts/AppContext';

export interface IslemFormu {
  bent: BentKodu | '';
  fAltTur: FAltTur | '';
  eIslemTuru: EIslemTuru | '';
  baslik: string;
  talepEden: string;
  manuelTutar: string;
  adet: string;
  polisSayisi: string;
  gorevSuresi: string;
  krediAdedi: string;
  sigortaSirketiId: string;
  isletmeciId: string;
  tasOcagiId: string;
  patlatmaTarihi: string;
  patlatmaSaati: string;
  notlar: string;
}

interface BentAlanlariProps {
  form: IslemFormu;
  guncelle: <K extends keyof IslemFormu>(alan: K, deger: IslemFormu[K]) => void;
  krediOzeti: KrediOzeti | null;
  patlatmaBedeliTutar: number;
}

export function BentAlanlari({ form, guncelle, krediOzeti, patlatmaBedeliTutar }: BentAlanlariProps) {
  const { bent } = form;

  if (!bent) return null;

  if (bent === 'A' || bent === 'B') {
    return (
      <div className="space-y-4">
        <div className="sm:max-w-xs">
          <Label htmlFor="manuel-tutar">Tutar (TL)</Label>
          <Input
            id="manuel-tutar"
            type="number"
            min={0}
            value={form.manuelTutar}
            onChange={(e) => guncelle('manuelTutar', e.target.value)}
            placeholder="0"
            className="mt-1.5" />
          
          <p className="mt-1 text-xs text-muted-foreground">
            Bu bentte yasal sabit oran yoktur, tutar manuel girilir.
          </p>
        </div>
        {bent === 'B' &&
        <KuralNotu baslik="B bendi ek bilgi">
            Bu gelir, ilgili yasal amaç kapsamında Kurum hesabına aktarılır.
          </KuralNotu>
        }
      </div>);

  }

  if (bent === 'C' || bent === 'Ç') {
    return (
      <div className="sm:max-w-xs">
        <Label htmlFor="adet">{bent === 'C' ? 'İşlem adedi' : 'Rapor adedi'}</Label>
        <Input
          id="adet"
          type="number"
          min={1}
          step={1}
          value={form.adet}
          onChange={(e) => guncelle('adet', e.target.value)}
          placeholder="1"
          className="mt-1.5" />
        
      </div>);

  }

  if (bent === 'D') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:max-w-xl">
        <div>
          <Label htmlFor="polis-sayisi">Polis sayısı (tam sayı)</Label>
          <Input
            id="polis-sayisi"
            type="number"
            min={1}
            step={1}
            value={form.polisSayisi}
            onChange={(e) => guncelle('polisSayisi', e.target.value)}
            placeholder="1"
            className="mt-1.5" />
          
        </div>
        <div>
          <Label htmlFor="gorev-suresi">Görev süresi (tam saat)</Label>
          <Input
            id="gorev-suresi"
            type="number"
            min={1}
            step={1}
            value={form.gorevSuresi}
            onChange={(e) => guncelle('gorevSuresi', e.target.value)}
            placeholder="1"
            className="mt-1.5" />
          
        </div>
        <p className="text-xs text-muted-foreground sm:col-span-2">
          Yarım personel ve buçuklu saat girilemez. Sıfır veya negatif değer kabul edilmez.
        </p>
      </div>);

  }

  if (bent === 'F') {
    return (
      <div className="space-y-4">
        <div className="sm:max-w-sm">
          <Label htmlFor="f-alt-tur">F bendi alt türü</Label>
          <Select
            value={form.fAltTur || undefined}
            onValueChange={(v) => guncelle('fAltTur', v as FAltTur)}>
            
            <SelectTrigger id="f-alt-tur" className="mt-1.5">
              <SelectValue placeholder="Lütfen alt tür seçiniz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADLI">F - Adli Polis Raporu</SelectItem>
              <SelectItem value="TRAFIK">F - Trafik Polis Raporu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.fAltTur === 'TRAFIK' &&
        <div className="space-y-4">
            <div className="sm:max-w-sm">
              <Label htmlFor="sigorta-sirketi">Sigorta şirketi</Label>
              <Select
              value={form.sigortaSirketiId || undefined}
              onValueChange={(v) => guncelle('sigortaSirketiId', v)}>
              
                <SelectTrigger id="sigorta-sirketi" className="mt-1.5">
                  <SelectValue placeholder="Lütfen sigorta şirketi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {sigortaSirketleri.
                filter((s) => s.aktif).
                map((s) =>
                <SelectItem key={s.id} value={s.id}>
                        {s.ad}
                      </SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
            <KuralNotu baslik="Trafik raporu kuralı">
              Trafik raporları yalnızca sigorta şirketlerinden alınır. Bireysel, avukat veya serbest
              başvuru türü yoktur. Tekli başvuru bile TTRF ana kayıt mantığıyla açılır ve alt
              başvurular ana kayda bağlanır.
            </KuralNotu>
          </div>
        }

        <div className="sm:max-w-xs">
          <Label htmlFor="adet">
            {form.fAltTur === 'TRAFIK' ? 'Alt başvuru (rapor) adedi' : 'Rapor adedi'}
          </Label>
          <Input
            id="adet"
            type="number"
            min={1}
            step={1}
            value={form.adet}
            onChange={(e) => guncelle('adet', e.target.value)}
            placeholder="1"
            className="mt-1.5" />
          
        </div>
      </div>);

  }

  // E bendi
  const isletmeciTasOcaklari = tasOcaklari.filter((t) => t.isletmeciId === form.isletmeciId && t.aktif);

  return (
    <div className="space-y-4">
      <div className="sm:max-w-sm">
        <Label htmlFor="e-islem-turu">E bendi işlem türü</Label>
        <Select
          value={form.eIslemTuru || undefined}
          onValueChange={(v) => guncelle('eIslemTuru', v as EIslemTuru)}>
          
          <SelectTrigger id="e-islem-turu" className="mt-1.5">
            <SelectValue placeholder="Lütfen işlem türü seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="KREDI_YUKLEME">Patlatma kredisi yükleme / ödeme alma</SelectItem>
            <SelectItem value="KREDI_KULLANIM">Patlatma kullanımı / görev kaydı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="sm:max-w-sm">
        <Label htmlFor="isletmeci">İşletmeci / sahip</Label>
        <Select
          value={form.isletmeciId || undefined}
          onValueChange={(v) => {
            guncelle('isletmeciId', v);
            guncelle('tasOcagiId', '');
          }}>
          
          <SelectTrigger id="isletmeci" className="mt-1.5">
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

      {krediOzeti &&
      <div className="grid gap-3 sm:grid-cols-3 sm:max-w-xl">
          {[
        { etiket: 'Toplam yüklenen', deger: krediOzeti.yuklenen },
        { etiket: 'Kullanılan', deger: krediOzeti.kullanilan },
        { etiket: 'Kalan kredi', deger: krediOzeti.kalan }].
        map((k) =>
        <div key={k.etiket} className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">{k.etiket}</p>
              <p className="mt-1 font-heading text-lg font-semibold">{k.deger} kredi</p>
            </div>
        )}
        </div>
      }

      {form.eIslemTuru === 'KREDI_YUKLEME' &&
      <div className="sm:max-w-xs">
          <Label htmlFor="kredi-adedi">Kaç patlatmalık ödeme yapılacak?</Label>
          <Input
          id="kredi-adedi"
          type="number"
          min={1}
          step={1}
          value={form.krediAdedi}
          onChange={(e) => guncelle('krediAdedi', e.target.value)}
          placeholder="1"
          className="mt-1.5" />
        
          <p className="mt-1 text-xs text-muted-foreground">
            1 patlatma bedeli: {formatTL(patlatmaBedeliTutar)} (BAÜ x %10)
          </p>
        </div>
      }

      {form.eIslemTuru === 'KREDI_KULLANIM' &&
      <div className="space-y-4">
          <div className="sm:max-w-sm">
            <Label htmlFor="tas-ocagi">Taş ocağı</Label>
            <Select
            value={form.tasOcagiId || undefined}
            onValueChange={(v) => guncelle('tasOcagiId', v)}
            disabled={!form.isletmeciId}>
            
              <SelectTrigger id="tas-ocagi" className="mt-1.5">
                <SelectValue
                placeholder={
                form.isletmeciId ? 'Lütfen taş ocağı seçiniz' : 'Önce işletmeci seçiniz'
                } />
              
              </SelectTrigger>
              <SelectContent>
                {isletmeciTasOcaklari.map((t) =>
              <SelectItem key={t.id} value={t.id}>
                    {t.ad} · {t.bolge}
                  </SelectItem>
              )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 sm:max-w-xl">
            <div>
              <Label htmlFor="patlatma-tarihi">Patlatma tarihi</Label>
              <Input
              id="patlatma-tarihi"
              type="date"
              value={form.patlatmaTarihi}
              onChange={(e) => guncelle('patlatmaTarihi', e.target.value)}
              className="mt-1.5" />
            
            </div>
            <div>
              <Label htmlFor="patlatma-saati">Patlatma saati</Label>
              <Input
              id="patlatma-saati"
              type="time"
              value={form.patlatmaSaati}
              onChange={(e) => guncelle('patlatmaSaati', e.target.value)}
              className="mt-1.5" />
            
            </div>
            <div>
              <Label htmlFor="kredi-adedi">Patlatma adedi</Label>
              <Input
              id="kredi-adedi"
              type="number"
              min={1}
              step={1}
              value={form.krediAdedi}
              onChange={(e) => guncelle('krediAdedi', e.target.value)}
              placeholder="1"
              className="mt-1.5" />
            
            </div>
          </div>
          <KuralNotu baslik="Kredi kullanım kuralı">
            Patlatma kullanımında yeniden ödeme alınmaz ve makbuz aranmaz. Sistem işletmecinin
            kalan kredisini kontrol eder; kredi yetersizse kullanım kaydı oluşturulamaz. Kredi taş
            ocağına değil işletmeci hesabına bağlıdır, bağlı tüm ocaklar aynı krediden düşer.
          </KuralNotu>
        </div>
      }
    </div>);

}