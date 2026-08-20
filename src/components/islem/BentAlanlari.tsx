import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { ParaInput } from '../ui/ParaInput';
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
import { AdliRaporlar } from './AdliRaporlar';
import { KrediOzeti, useApp } from '../../contexts/AppContext';
import { AdliRapor, BentKodu, EIslemTuru, FAltTur, TrafikAltBasvuru } from '../../types';
import { formatTL } from '../../utils/currency';

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
  manuelTutar: number | null;
  adet: string;
  polisSayisi: string;
  gorevSuresi: string;
  krediAdedi: string;
  sigortaSirketiId: string;
  isletmeciId: string;
  tasOcagiId: string;
  notlar: string;
}

export type BentBolumu = 'kaynak' | 'rapor' | 'operasyon' | 'hesaplama';

interface BentAlanlariProps {
  bolum: BentBolumu;
  form: IslemFormu;
  guncelle: <K extends keyof IslemFormu>(alan: K, deger: IslemFormu[K]) => void;
  krediYuklemeYontemi?: 'ADET' | 'TUTAR';
  krediYuklemeYontemiDegistir?: (yontem: 'ADET' | 'TUTAR') => void;
  krediDekontTutari?: number | null;
  krediDekontTutariDegistir?: (tutar: number | null) => void;
  fazlaOdemeDurumu?: 'KARAR_BEKLIYOR' | 'IADE_BEKLIYOR' | 'MAHSUP_BAKIYESI';
  fazlaOdemeDurumuDegistir?: (durum: 'KARAR_BEKLIYOR' | 'IADE_BEKLIYOR' | 'MAHSUP_BAKIYESI') => void;
  mahsupKullan?: boolean;
  mahsupKullanDegistir?: (kullan: boolean) => void;
  krediOzeti: KrediOzeti | null;
  patlatmaBedeliTutar: number;
  raporBedeliTutar: number;
  trafikSatirlari: TrafikAltBasvuru[];
  trafikGuncelle: (sira: number, alan: keyof TrafikAltBasvuru, deger: string) => void;
  trafikEkle: () => void;
  trafikKaldir: (sira: number) => void;
  adliSatirlari: AdliRapor[];
  adliGuncelle: (sira: number, alan: keyof AdliRapor, deger: string) => void;
  adliEkle: () => void;
  adliKaldir: (sira: number) => void;
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
    <div className="space-y-3">
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
        Bu tarih ajandayı besler. Dekont tarihi mali belge tarihidir ve bu alandan bağımsızdır.
      </p>
    </div>);

}

function KrediOzetKutusu({ ozet }: {ozet: KrediOzeti;}) {
  const kalemler = [
  { etiket: 'Yüklenen kredi', deger: ozet.yuklenen, ton: 'notr' as const },
  { etiket: 'Doğrulama bekleyen', deger: ozet.dogrulamaBekleyen, ton: 'uyari' as const },
  { etiket: 'Planlanan / sonuç bekleyen', deger: ozet.planlanan, ton: 'uyari' as const },
  { etiket: 'Gerçekleşmiş kullanılan', deger: ozet.kullanilan, ton: 'notr' as const },
  { etiket: 'Kalan kullanılabilir', deger: ozet.kalan, ton: 'vurgu' as const }];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {kalemler.map((k) =>
      <div
        key={k.etiket}
        className={`rounded-lg border p-3 ${
        k.ton === 'vurgu' ?
        'border-primary/30 bg-primary/5' :
        k.ton === 'uyari' ?
        'border-amber-200 bg-amber-50' :
        'border-border bg-muted/30'}`
        }>
        
          <p className="text-xs text-muted-foreground">{k.etiket}</p>
          <p
          className={`mt-1 font-heading text-lg font-semibold ${
          k.ton === 'vurgu' ?
          'text-primary' :
          k.ton === 'uyari' ?
          'text-amber-700' :
          'text-foreground'}`
          }>
          
            {k.deger} kredi
          </p>
        </div>
      )}
    </div>);

}

function pozitifTamSayiMi(deger: string): boolean {
  return /^\d+$/.test(deger) && Number(deger) > 0;
}

export function BentAlanlari({
  bolum,
  form,
  guncelle,
  krediYuklemeYontemi = 'ADET',
  krediYuklemeYontemiDegistir,
  krediDekontTutari = null,
  krediDekontTutariDegistir,
  fazlaOdemeDurumu = 'KARAR_BEKLIYOR',
  fazlaOdemeDurumuDegistir,
  mahsupKullan = false,
  mahsupKullanDegistir,
  krediOzeti,
  patlatmaBedeliTutar,
  raporBedeliTutar,
  trafikSatirlari,
  trafikGuncelle,
  trafikEkle,
  trafikKaldir,
  adliSatirlari,
  adliGuncelle,
  adliEkle,
  adliKaldir
}: BentAlanlariProps) {
  const { sigortalar, isletmeciler, tasOcaklari } = useApp();
  const { bent } = form;

  if (!bent) return null;

  const trafik = bent === 'F' && form.fAltTur === 'TRAFIK';
  const adli = bent === 'F' && form.fAltTur === 'ADLI';
  const krediYukleme = bent === 'E' && form.eIslemTuru === 'KREDI_YUKLEME';
  const krediPlanlama = bent === 'E' && form.eIslemTuru === 'KREDI_PLANLAMA';

  /* ---------------------------- İŞLEM KAYNAĞI ---------------------------- */
  if (bolum === 'kaynak') {
    return (
      <div className="space-y-4">
        {bent === 'F' &&
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
        }

        {bent === 'E' &&
        <div className="sm:max-w-md">
            <Label htmlFor="e-islem-turu">E bendi işlem türü</Label>
            <Select
            value={form.eIslemTuru || undefined}
            onValueChange={(v) => guncelle('eIslemTuru', v as EIslemTuru)}>
            
              <SelectTrigger id="e-islem-turu" className="mt-1.5">
                <SelectValue placeholder="Lütfen işlem türü seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KREDI_YUKLEME">Kredi Yükle</SelectItem>
                <SelectItem value="KREDI_PLANLAMA">Patlatma Planla</SelectItem>
                <SelectItem value="KREDI_GERCEKLESME">Patlatma Sonucunu İşle</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Kredi düşümü planlama aşamasında değil, patlatma “Yapıldı” olarak işlendiğinde
              yapılır.
            </p>
          </div>
        }

        {trafik &&
        <div className="space-y-3">
            <div className="sm:max-w-sm">
              <Label htmlFor="sigorta-sirketi">Sigorta şirketi (başvuru kaynağı)</Label>
              <Select
              value={form.sigortaSirketiId || undefined}
              onValueChange={(v) => guncelle('sigortaSirketiId', v)}>
              
                <SelectTrigger id="sigorta-sirketi" className="mt-1.5">
                  <SelectValue placeholder="Lütfen sigorta şirketi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {sigortalar.
                filter((s) => s.aktif).
                map((s) =>
                <SelectItem key={s.id} value={s.id}>
                        {s.ad}
                      </SelectItem>
                )}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Liste{' '}
                <Link to="/sigorta-sirketleri" className="font-medium text-primary hover:underline">
                  Sigorta Şirketi Kartları
                </Link>{' '}
                ekranından beslenir. Talep eden alanı bu seçimden otomatik dolar.
              </p>
            </div>
            <KuralNotu baslik="Trafik başvuru kaynağı kuralı">
              Trafik raporları yalnızca sigorta şirketi kartına bağlı açılır. Bireysel, avukat veya
              serbest başvuru türü yoktur. Tek rapor bile ana TTRF kaydı olarak açılır; ek raporlara
              ayrı makbuz kesilmez.
            </KuralNotu>
          </div>
        }

        {bent === 'E' &&
        <div className="space-y-4">
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
              <p className="mt-1 text-xs text-muted-foreground">
                Liste{' '}
                <Link
                to="/tas-ocagi-isletmecileri"
                className="font-medium text-primary hover:underline">
                
                  Taş Ocağı İşletmecileri
                </Link>{' '}
                ekranından beslenir. Kredi bu hesapta tutulur; talep eden alanı buradan dolar.
              </p>
            </div>

            {krediOzeti && <KrediOzetKutusu ozet={krediOzeti} />}
          </div>
        }
      </div>);

  }

  /* ------------------------- RAPOR / GÖREV BİLGİSİ ------------------------ */
  if (bolum === 'rapor') {
    if (trafik) {
      return (
        <TrafikAltBasvurular
          satirlar={trafikSatirlari}
          guncelle={trafikGuncelle}
          ekle={trafikEkle}
          kaldir={trafikKaldir}
          raporBedeliTutar={raporBedeliTutar} />);


    }
    if (adli) {
      return (
        <AdliRaporlar
          satirlar={adliSatirlari}
          guncelle={adliGuncelle}
          ekle={adliEkle}
          kaldir={adliKaldir}
          raporBedeliTutar={raporBedeliTutar} />);


    }
    return null;
  }

  /* --------------------------- OPERASYON BİLGİSİ -------------------------- */
  if (bolum === 'operasyon') {
    if (bent === 'A' || bent === 'B' || krediYukleme) return null;

    if (bent === 'C' || bent === 'Ç') {
      return (
        <OperasyonAlanlari
          form={form}
          guncelle={guncelle}
          tarihEtiketi={bent === 'C' ? 'İşlem / denetim tarihi' : 'Rapor / denetim tarihi'}
          saatEtiketi={bent === 'C' ? 'İşlem / denetim saati' : 'Rapor / denetim saati'}
          yerEtiketi="Yer / adres" />);


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
              placeholder="Örn. Maraton yol kapama ve güvenlik tedbiri"
              className="mt-1.5" />
            
          </div>
          <OperasyonAlanlari
            form={form}
            guncelle={guncelle}
            tarihEtiketi="Görev tarihi"
            saatEtiketi="Başlama saati"
            yerEtiketi="Görev yeri" />
          <p className="text-xs text-muted-foreground">
            Başlama saati 13:30 gibi olabilir. Ücret hesabında polis sayısı tam kişi, görev süresi
            tam saat girilir; 4,5 polis veya 1,5 saat kabul edilmez.
          </p>
          
        </div>);

    }

    if (bent === 'F') {
      return (
        <OperasyonAlanlari
          form={form}
          guncelle={guncelle}
          tarihEtiketi="Rapor / işlem tarihi"
          saatEtiketi="Rapor / işlem saati"
          yerEtiketi="Birim / yer" />);


    }

    if (!krediPlanlama) return null;

    // E — patlatma planlama
    const isletmeciTasOcaklari = tasOcaklari.filter(
      (t) => t.isletmeciId === form.isletmeciId && t.aktif
    );

    return (
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
          <p className="mt-1 text-xs text-muted-foreground">
            {form.isletmeciId ?
            `Yalnızca seçilen işletmeciye bağlı ${isletmeciTasOcaklari.length} aktif taş ocağı listelenir.` :
            'İşletmeci seçildikten sonra yalnızca ona bağlı taş ocakları listelenir.'}
          </p>
        </div>

        <OperasyonAlanlari
          form={form}
          guncelle={guncelle}
          tarihEtiketi="Planlanan patlatma tarihi"
          saatEtiketi="Planlanan patlatma saati"
          yerVar={false} />
        
      </div>);

  }

  /* ------------------------------ HESAPLAMA ------------------------------ */
  if (bent === 'A' || bent === 'B') {
    return (
      <div className="space-y-4">
        <div className="sm:max-w-xs">
          <Label htmlFor="manuel-tutar">
            {bent === 'A' ? 'Tutar (TL)' : 'Satış / hurda gelir tutarı (TL)'}
          </Label>
          <ParaInput
            id="manuel-tutar"
            value={form.manuelTutar}
            onValueChange={(deger) => guncelle('manuelTutar', deger)}
            placeholder="0,00 TL"
            className="mt-1.5" />
          
          <p className="mt-1 text-xs text-muted-foreground">
            Bu bentte yasal sabit oran yoktur, tutar manuel girilir. Alan TL formatındadır; negatif
            tutar kabul edilmez.
          </p>
        </div>
        {bent === 'B' &&
        <KuralNotu baslik="B bendi ek bilgi">
            Bu gelir, ilgili yasal amaç kapsamında Kurum hesabına aktarılır.
          </KuralNotu>
        }
        <KuralNotu>A ve B bentleri mali işlemdir; ajandaya otomatik düşmez.</KuralNotu>
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
          className="mt-1.5" />
        
        <p className="mt-1 text-xs text-muted-foreground">
          En düşük geçerli değer 1 olarak gelir ve hesaplamaya doğrudan yansır.
        </p>
      </div>);

  }

  if (bent === 'D') {
    const polisHatasi = form.polisSayisi !== '' && !pozitifTamSayiMi(form.polisSayisi);
    const sureHatasi = form.gorevSuresi !== '' && !pozitifTamSayiMi(form.gorevSuresi);
    return (
      <div className="space-y-3">
        <div className="grid gap-4 sm:max-w-xl sm:grid-cols-2">
          <div>
            <Label htmlFor="polis-sayisi">Polis sayısı (pozitif tam sayı)</Label>
            <Input
              id="polis-sayisi"
              type="number"
              min={1}
              step={1}
              value={form.polisSayisi}
              onChange={(e) => guncelle('polisSayisi', e.target.value)}
              aria-invalid={polisHatasi}
              className="mt-1.5" />
            {polisHatasi &&
            <p className="mt-1 text-xs text-rose-700">Polis sayısı 1, 2, 3 gibi pozitif tam sayı olmalıdır.</p>
            }
            
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
              aria-invalid={sureHatasi}
              className="mt-1.5" />
            {sureHatasi &&
            <p className="mt-1 text-xs text-rose-700">Görev süresi 1, 2, 3 gibi pozitif tam saat olmalıdır.</p>
            }
            
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ücret hesabında polis sayısı tam kişi, görev süresi tam saat girilir. 1,5 / 1.5 / 2,5
          gibi değerler kabul edilmez.
        </p>
        {form.polisSayisi === '1' && form.gorevSuresi === '1' &&
        <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            Başlangıç hesabı: 1 polis × 1 saat
          </p>
        }
      </div>);

  }

  if (bent === 'F') {
    const raporSayisi = trafik ? trafikSatirlari.length : adliSatirlari.length;
    return (
      <p className="text-sm text-muted-foreground">
        Rapor sayısı, girilen rapor satırlarından otomatik alınır:{' '}
        <strong className="text-foreground">{raporSayisi} rapor</strong>. Rapor bilgileri “Rapor
        Bilgisi” bölümünde girilir.
      </p>);

  }

  // E bendi hesaplama alanları
  if (krediYukleme) {
    const adet = Number(form.krediAdedi) || 0;
    const birimKurus = Math.round(patlatmaBedeliTutar * 100);
    const dekontKurus = Math.round((krediDekontTutari ?? 0) * 100);
    const mahsupBakiyesiKurus = Math.round((krediOzeti?.mahsuplasmaBakiyesi ?? 0) * 100);
    const dekontTekBasinaKredi = birimKurus > 0 ? Math.floor(dekontKurus / birimKurus) : 0;
    const kalanKurus = birimKurus > 0 ? dekontKurus % birimKurus : 0;
    const sonrakiKrediIcinEksikKurus = birimKurus > 0 && kalanKurus > 0 ? birimKurus - kalanKurus : 0;
    const gerekliMahsupKurus = mahsupKullan && krediYuklemeYontemi === 'TUTAR' && sonrakiKrediIcinEksikKurus > 0 && sonrakiKrediIcinEksikKurus <= mahsupBakiyesiKurus ? sonrakiKrediIcinEksikKurus : 0;
    const toplamHesapKurus = krediYuklemeYontemi === 'TUTAR' ? dekontKurus + gerekliMahsupKurus : adet * birimKurus;
    const tutardanKredi = birimKurus > 0 && toplamHesapKurus >= birimKurus ? Math.floor(toplamHesapKurus / birimKurus) : 0;
    const krediyeMahsupKurus = tutardanKredi * birimKurus;
    const mahsupKurus = mahsupKullan && krediOzeti ?
    krediYuklemeYontemi === 'TUTAR' ?
    Math.min(gerekliMahsupKurus, Math.max(0, krediyeMahsupKurus - dekontKurus)) :
    Math.min(mahsupBakiyesiKurus, Math.max(0, adet * birimKurus)) :
    0;
    const mahsupTutari = mahsupKurus / 100;
    const kalanMahsupTutari = Math.max(0, (mahsupBakiyesiKurus - mahsupKurus) / 100);
    const odenecekTutar = krediYuklemeYontemi === 'TUTAR' ? (krediDekontTutari ?? 0) : Math.max(0, adet * patlatmaBedeliTutar - mahsupTutari);
    const fazlaKurus = Math.max(0, dekontKurus + mahsupKurus - krediyeMahsupKurus);
    const fazlaOdemeTutar = fazlaKurus / 100;
    const tutarYetersiz = krediYuklemeYontemi === 'TUTAR' && (krediDekontTutari ?? 0) > 0 && toplamHesapKurus < birimKurus;
    const fazlaOdemeVar = krediYuklemeYontemi === 'TUTAR' && fazlaOdemeTutar > 0 && tutardanKredi > 0;
    return (
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => krediYuklemeYontemiDegistir?.('ADET')}
            className={`rounded-lg border p-3 text-left text-sm ${
            krediYuklemeYontemi === 'ADET' ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-card text-muted-foreground'}`
            }>
            <span className="block font-medium">Patlatma adedine göre hesapla</span>
            <span className="mt-0.5 block text-xs">Kredi adedini tam sayı olarak girin.</span>
          </button>
          <button
            type="button"
            onClick={() => krediYuklemeYontemiDegistir?.('TUTAR')}
            className={`rounded-lg border p-3 text-left text-sm ${
            krediYuklemeYontemi === 'TUTAR' ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-card text-muted-foreground'}`
            }>
            <span className="block font-medium">Dekont tutarından kredi hesapla</span>
            <span className="mt-0.5 block text-xs">Tutar tam kredi adedine karşılık gelmelidir.</span>
          </button>
        </div>

        {krediOzeti && krediOzeti.mahsuplasmaBakiyesi > 0 &&
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">Bu işletmecinin mahsuplaşma bakiyesi: {formatTL(krediOzeti.mahsuplasmaBakiyesi)}</p>
          <p className="mt-1 text-xs">Bu tutar patlatma kredisi değildir; sonraki kredi yükleme ödemesinde TL indirimi olarak kullanılabilir.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => mahsupKullanDegistir?.(true)}
                className={`rounded-md border px-3 py-1.5 text-xs ${mahsupKullan ? 'border-amber-700 bg-white text-amber-900' : 'border-amber-200 bg-amber-100/60 text-amber-800'}`}>
                Bu bakiyeyi bu işlemde kullan
              </button>
              <button
                type="button"
                onClick={() => mahsupKullanDegistir?.(false)}
                className={`rounded-md border px-3 py-1.5 text-xs ${!mahsupKullan ? 'border-amber-700 bg-white text-amber-900' : 'border-amber-200 bg-amber-100/60 text-amber-800'}`}>
                Bu bakiyeyi kullanma
              </button>
            </div>
            {mahsupKullan &&
            <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-4">
                {krediYuklemeYontemi === 'TUTAR' && <div><dt>Dekonttaki yeni ödeme</dt><dd className="font-medium">{formatTL(krediDekontTutari ?? 0)}</dd></div>}
                <div><dt>Kredi yükleme tutarı</dt><dd className="font-medium">{formatTL(krediYuklemeYontemi === 'TUTAR' ? krediyeMahsupKurus / 100 : patlatmaBedeliTutar * adet)}</dd></div>
                <div><dt>Kullanılan mahsup</dt><dd className="font-medium">{formatTL(mahsupTutari)}</dd></div>
                <div><dt>Ödenmesi gereken</dt><dd className="font-medium">{formatTL(odenecekTutar)}</dd></div>
                <div><dt>Kalan mahsup bakiyesi</dt><dd className="font-medium">{formatTL(kalanMahsupTutari)}</dd></div>
              </dl>
            }
            {!mahsupKullan && <p className="mt-2 text-xs">Mahsup bakiyesi bu işlemde kullanılmadı.</p>}
            {mahsupKullan && krediYuklemeYontemi === 'TUTAR' && dekontKurus > 0 && dekontKurus % birimKurus === 0 &&
            <p className="mt-2 text-xs">Bu dekont tutarı tam kredi karşılıyor. Mahsup bakiyesi kullanılmasına gerek yoktur.</p>
            }
            {mahsupKullan && krediYuklemeYontemi === 'TUTAR' && dekontKurus > 0 && dekontKurus % birimKurus !== 0 && gerekliMahsupKurus === 0 && dekontTekBasinaKredi > 0 &&
            <p className="mt-2 text-xs">Bu dekont {dekontTekBasinaKredi} kredi karşılıyor. Mahsup bakiyesi bu işlemde kullanılmadı; çünkü ek kredi oluşturmaya gerek/yeterlilik yok.</p>
            }
          </div>
        }

        {krediYuklemeYontemi === 'ADET' ?
        <div className="sm:max-w-xs">
            <Label htmlFor="kredi-adedi">Kaç patlatmalık ödeme yapılacak?</Label>
            <Input
              id="kredi-adedi"
              type="number"
              min={1}
              step={1}
              value={form.krediAdedi}
              onChange={(e) => guncelle('krediAdedi', e.target.value)}
              className="mt-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">
              Kredi adedi pozitif tam sayı olmalıdır; yarım veya küsuratlı kredi oluşturulmaz.
            </p>
          </div> :
        <div className="space-y-2 sm:max-w-sm">
            <Label htmlFor="kredi-dekont-tutari">Dekonttaki yeni ödeme tutarı</Label>
            <ParaInput
              id="kredi-dekont-tutari"
              value={krediDekontTutari}
              onValueChange={(deger) => krediDekontTutariDegistir?.(deger)}
              placeholder="Örn. 21.267,90 TL"
              className="mt-1.5" />
            <p className="text-xs text-muted-foreground">
              Bu alan yeni yatırılan dekont tutarıdır. Seçilirse mahsuplaşma bakiyesi ayrıca hesaba eklenir.
            </p>
            {tutarYetersiz &&
            <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                Girilen tutar 1 patlatma kredisi bedelinden düşüktür. 1 kredi bedeli {formatTL(patlatmaBedeliTutar)}’dir.
              </p>
            }
            {tutardanKredi > 0 &&
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                {formatTL((dekontKurus + mahsupKurus) / 100)} / {formatTL(patlatmaBedeliTutar)} = {tutardanKredi} tam kredi
              </p>
            }
            {fazlaOdemeVar &&
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-medium">Bu dekont tutarı tam kredi bedeline bölünmüyor.</p>
                <dl className="grid gap-1 sm:grid-cols-2">
                  <div><dt>Dekonttaki yeni ödeme tutarı</dt><dd className="font-medium">{formatTL(krediDekontTutari ?? 0)}</dd></div>
                  <div><dt>Kullanılan mahsup</dt><dd className="font-medium">{formatTL(mahsupTutari)}</dd></div>
                  <div><dt>Hesaplamaya giren toplam</dt><dd className="font-medium">{formatTL((dekontKurus + mahsupKurus) / 100)}</dd></div>
                  <div><dt>1 kredi bedeli</dt><dd className="font-medium">{formatTL(patlatmaBedeliTutar)}</dd></div>
                  <div><dt>Tam karşılanan kredi</dt><dd className="font-medium">{tutardanKredi}</dd></div>
                  <div><dt>Krediye mahsup edilen</dt><dd className="font-medium">{formatTL(krediyeMahsupKurus / 100)}</dd></div>
                  <div><dt>Kalan mahsup bakiyesi</dt><dd className="font-medium">{formatTL(kalanMahsupTutari)}</dd></div>
                  <div><dt>Fazla ödeme</dt><dd className="font-medium">{formatTL(fazlaOdemeTutar)}</dd></div>
                </dl>
                <p>Fazla ödeme patlatma kredisi değildir. Kayıt oluşturulabilir; ancak fazla ödeme için iade veya mahsup kararı alınmalıdır.</p>
                <div>
                  <p className="font-medium">Fazla ödeme işlemi</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                    ['IADE_BEKLIYOR', 'İade edilecek'],
                    ['MAHSUP_BAKIYESI', 'Sonraki ödemeye mahsup edilecek'],
                    ['KARAR_BEKLIYOR', 'Karar bekliyor']
                    ].map(([deger, etiket]) =>
                    <button
                      key={deger}
                      type="button"
                      onClick={() => fazlaOdemeDurumuDegistir?.(deger as 'KARAR_BEKLIYOR' | 'IADE_BEKLIYOR' | 'MAHSUP_BAKIYESI')}
                      className={`rounded-md border px-3 py-1.5 text-xs ${fazlaOdemeDurumu === deger ? 'border-amber-700 bg-white text-amber-900' : 'border-amber-200 bg-amber-100/60 text-amber-800'}`}>
                        {etiket}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <dt className="text-xs text-muted-foreground">1 patlatma bedeli (BAÜ x %10)</dt>
            <dd className="mt-1 font-heading text-base font-semibold text-foreground">
              {formatTL(patlatmaBedeliTutar)}
            </dd>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <dt className="text-xs text-muted-foreground">
              Toplam kredi yükleme tutarı ({adet} kredi)
            </dt>
            <dd className="mt-1 font-heading text-base font-semibold text-primary">
              {formatTL(patlatmaBedeliTutar * adet)}
            </dd>
          </div>
        </dl>

        {adet > 0 &&
        <p className="text-sm text-muted-foreground">
            {krediYuklemeYontemi === 'TUTAR' ?
          `${formatTL(patlatmaBedeliTutar * adet)} / ${formatTL(patlatmaBedeliTutar)} = ${adet} kredi` :
          `${adet} kredi × ${formatTL(patlatmaBedeliTutar)} = ${formatTL(patlatmaBedeliTutar * adet)}`}
          </p>
        }

        <KuralNotu baslik="Kredi kullanılabilirliği">
          Kredi yükleme kaydı “Ödeme Doğrulama Bekliyor” durumunda başlar. Ödeme doğrulandığında veya
          makbuz üretildiğinde kredi kullanılabilir hale gelir. Kredi yükleme mali işlemdir, ajandaya
          düşmez.
        </KuralNotu>
      </div>);

  }

  if (!krediPlanlama) return null;

  const planlanacak = Number(form.krediAdedi) || 0;
  const yeterli = !!krediOzeti && planlanacak > 0 && planlanacak <= krediOzeti.kalan;

  return (
    <div className="space-y-4">
      <div className="sm:max-w-xs">
        <Label htmlFor="kredi-adedi">Planlanan patlatma adedi</Label>
        <Input
          id="kredi-adedi"
          type="number"
          min={1}
          step={1}
          value={form.krediAdedi}
          onChange={(e) => guncelle('krediAdedi', e.target.value)}
          className="mt-1.5" />
        
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">Kredi yeterlilik kontrolü</p>
          {krediOzeti && planlanacak > 0 &&
          <BilgiRozeti
            metin={yeterli ? 'Kredi yeterli' : 'Kredi yetersiz'}
            ton={yeterli ? 'olumlu' : 'hata'} />

          }
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {krediOzeti ?
          `Kalan kullanılabilir kredi: ${krediOzeti.kalan} · Planlanan / sonuç bekleyen: ${krediOzeti.planlanan} · Bu planda: ${planlanacak}` :
          'Kontrol için işletmeci seçilmelidir.'}
        </p>
        {krediOzeti && planlanacak > krediOzeti.kalan &&
        <p className="mt-2 text-sm text-rose-700">
            Kullanılabilir kredi yetersiz. Plan kaydı açılabilir ancak patlatma “Yapıldı” olarak
            işlenmeden önce kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.
          </p>
        }
      </div>

      <KuralNotu baslik="Kredi düşüm kuralı">
        Planlama aşamasında kredi düşülmez, yalnızca “planlanan / sonuç bekleyen” olarak izlenir.
        Kredi düşümü, patlatma “Yapıldı” olarak işlendiğinde yapılır. Bu işlem en pratik şekilde
        Patlatma Takvimi ekranındaki kart üzerinden yürütülür. Planlama ve kullanım için yeniden
        ödeme veya dekont istenmez.
      </KuralNotu>
    </div>);

}