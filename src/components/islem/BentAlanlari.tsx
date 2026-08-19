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
import { BilgiRozeti } from '../common/DurumRozeti';
import { TrafikAltBasvurular } from './TrafikAltBasvurular';
import { sigortaSirketleri } from '../../data/sigortaSirketleri';
import { isletmeciler, tasOcaklari } from '../../data/tasOcagi';
import { BentKodu, EIslemTuru, FAltTur, TrafikAltBasvuru } from '../../types';
import { formatTL } from '../../utils/currency';
import { KrediOzeti } from '../../contexts/AppContext';

export interface IslemFormu {
  bent: BentKodu | '';
  fAltTur: FAltTur | '';
  eIslemTuru: EIslemTuru | '';
  baslik: string;
  talepEden: string;
  etkinlikAdi: string;
  /** Operasyon tarihi — dekont tarihinden bağımsızdır, ajanda bundan beslenir. */
  operasyonTarihi: string;
  operasyonSaati: string;
  yer: string;
  manuelTutar: string;
  adet: string;
  polisSayisi: string;
  gorevSuresi: string;
  krediAdedi: string;
  sigortaSirketiId: string;
  isletmeciId: string;
  tasOcagiId: string;
  notlar: string;
}

interface BentAlanlariProps {
  form: IslemFormu;
  guncelle: <K extends keyof IslemFormu>(alan: K, deger: IslemFormu[K]) => void;
  krediOzeti: KrediOzeti | null;
  patlatmaBedeliTutar: number;
  raporBedeliTutar: number;
  altBasvurular: TrafikAltBasvuru[];
  altGuncelle: (sira: number, alan: keyof TrafikAltBasvuru, deger: string) => void;
}

function OperasyonAlanlari({
  form,
  guncelle,
  tarihEtiketi,
  saatEtiketi,
  yerEtiketi,
  saatVar = true,
  yerVar = true








}: {form: IslemFormu;guncelle: BentAlanlariProps['guncelle'];tarihEtiketi: string;saatEtiketi?: string;yerEtiketi?: string;saatVar?: boolean;yerVar?: boolean;}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-foreground">Operasyon Bilgisi</p>
        <BilgiRozeti metin="Ajanda bu tarihten beslenir" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="operasyon-tarihi">{tarihEtiketi}</Label>
          <Input
            id="operasyon-tarihi"
            type="date"
            value={form.operasyonTarihi}
            onChange={(e) => guncelle('operasyonTarihi', e.target.value)}
            className="mt-1.5" />
          
        </div>
        {saatVar &&
        <div>
            <Label htmlFor="operasyon-saati">{saatEtiketi}</Label>
            <Input
            id="operasyon-saati"
            type="time"
            value={form.operasyonSaati}
            onChange={(e) => guncelle('operasyonSaati', e.target.value)}
            className="mt-1.5" />
          
          </div>
        }
        {yerVar &&
        <div>
            <Label htmlFor="operasyon-yeri">{yerEtiketi}</Label>
            <Input
            id="operasyon-yeri"
            value={form.yer}
            onChange={(e) => guncelle('yer', e.target.value)}
            placeholder="Örn. Palm Beach Otel — Gazimağusa"
            className="mt-1.5" />
          
          </div>
        }
      </div>
      <p className="text-xs text-muted-foreground">
        Dekont tarihi mali belge tarihidir ve bu alandan bağımsızdır.
      </p>
    </div>);

}

export function BentAlanlari({
  form,
  guncelle,
  krediOzeti,
  patlatmaBedeliTutar,
  raporBedeliTutar,
  altBasvurular,
  altGuncelle
}: BentAlanlariProps) {
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
        <KuralNotu>
          A ve B bentleri mali işlemdir; ajandaya otomatik düşmez.
        </KuralNotu>
      </div>);

  }

  if (bent === 'C' || bent === 'Ç') {
    return (
      <div className="space-y-4">
        <OperasyonAlanlari
          form={form}
          guncelle={guncelle}
          tarihEtiketi={bent === 'C' ? 'İşlem / denetim tarihi' : 'Rapor / denetim tarihi'}
          saatEtiketi={bent === 'C' ? 'İşlem / denetim saati' : 'Rapor / denetim saati'}
          yerEtiketi="Yer / adres" />
        
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
          
        </div>
      </div>);

  }

  if (bent === 'D') {
    return (
      <div className="space-y-4">
        <div className="sm:max-w-md">
          <Label htmlFor="etkinlik-adi">Etkinlik / faaliyet adı</Label>
          <Input
            id="etkinlik-adi"
            value={form.etkinlikAdi}
            onChange={(e) => guncelle('etkinlikAdi', e.target.value)}
            placeholder="Örn. Girne Zeytin Festivali kortej yürüyüşü"
            className="mt-1.5" />
          
        </div>

        <OperasyonAlanlari
          form={form}
          guncelle={guncelle}
          tarihEtiketi="Görev tarihi"
          saatEtiketi="Başlama saati"
          yerEtiketi="Görev yeri" />
        

        <div className="grid gap-4 sm:grid-cols-2 sm:max-w-xl">
          <div>
            <Label htmlFor="polis-sayisi">Polis sayısı (pozitif tam sayı)</Label>
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
        </div>
        <p className="text-xs text-muted-foreground">
          Yarım personel ve buçuklu saat girilemez. Görev tarihi ve görev yeri zorunludur.
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

        <OperasyonAlanlari
          form={form}
          guncelle={guncelle}
          tarihEtiketi="Rapor / işlem tarihi"
          saatEtiketi="Rapor / işlem saati"
          yerEtiketi="Birim / yer" />
        

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
              başvuru türü yoktur. Tekli başvuru bile TTRF ana kayıt mantığıyla açılır; alt
              başvurular ana kayda bağlanır ve ayrı makbuz kesilmez.
            </KuralNotu>
          </div>
        }

        <div className="sm:max-w-xs">
          <Label htmlFor="adet">
            {form.fAltTur === 'TRAFIK' ? 'Alt başvuru adedi' : 'Rapor adedi'}
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

        {form.fAltTur === 'TRAFIK' &&
        <TrafikAltBasvurular
          satirlar={altBasvurular}
          guncelle={altGuncelle}
          raporBedeliTutar={raporBedeliTutar} />

        }
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
        { etiket: 'Ödeme alınan kredi', deger: krediOzeti.yuklenen, vurgu: false },
        { etiket: 'Doğrulama bekleyen', deger: krediOzeti.dogrulamaBekleyen, vurgu: false },
        { etiket: 'Kullanılmış kredi', deger: krediOzeti.kullanilan, vurgu: false },
        { etiket: 'Kalan kullanılabilir', deger: krediOzeti.kalan, vurgu: true }].
        map((k) =>
        <div
          key={k.etiket}
          className={`rounded-lg border p-3 ${
          k.vurgu ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'}`
          }>
          
              <p className="text-xs text-muted-foreground">{k.etiket}</p>
              <p
            className={`mt-1 font-heading text-lg font-semibold ${
            k.vurgu ? 'text-primary' : 'text-foreground'}`
            }>
            
                {k.deger} kredi
              </p>
            </div>
        )}
        </div>
      }

      {form.eIslemTuru === 'KREDI_YUKLEME' &&
      <div className="space-y-3">
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
          <KuralNotu baslik="Kredi kullanılabilirliği">
            Kredi yükleme kaydı “Ödeme Doğrulama Bekliyor” durumunda başlar. Ödeme doğrulandığında
            veya makbuz üretildiğinde kredi kullanılabilir hale gelir. Kredi yükleme mali işlemdir,
            ajandaya düşmez.
          </KuralNotu>
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

          <OperasyonAlanlari
          form={form}
          guncelle={guncelle}
          tarihEtiketi="Patlatma tarihi"
          saatEtiketi="Patlatma saati"
          yerVar={false} />
        

          <div className="sm:max-w-xs">
            <Label htmlFor="kredi-adedi">Patlatma adedi / kullanılacak kredi</Label>
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

          <KuralNotu baslik="Kredi kullanım kuralı">
            Patlatma kullanımında yeniden ödeme alınmaz, dekont ve makbuz aranmaz. Sistem yalnızca
            kullanılabilir krediyi düşer; kredi taş ocağına değil işletmeci hesabına bağlıdır ve
            bağlı tüm ocaklar aynı ortak krediyi kullanır.
          </KuralNotu>
        </div>
      }
    </div>);

}