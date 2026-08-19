import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { BosDurum } from '../components/common/BosDurum';
import { KuralNotu } from '../components/common/KuralNotu';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../components/ui/Select';
import { BentAlanlari, IslemFormu } from '../components/islem/BentAlanlari';
import { BOS_DEKONT, DekontBolumu, DekontFormu } from '../components/islem/DekontBolumu';
import { HesaplamaKutusu } from '../components/islem/HesaplamaKutusu';
import { bentler } from '../data/bentler';
import { useApp } from '../contexts/AppContext';
import { BentKodu, DekontDosyasi, Islem, TrafikAltBasvuru } from '../types';
import { hesapla, patlatmaBedeli, raporBedeli } from '../utils/hesaplama';
import { altBasvuruNo, sonrakiKayitNo } from '../utils/numaralandirma';
import { formatTL } from '../utils/currency';

const BOS_FORM: IslemFormu = {
  bent: '',
  fAltTur: '',
  eIslemTuru: '',
  baslik: '',
  talepEden: '',
  etkinlikAdi: '',
  operasyonTarihi: '',
  operasyonSaati: '',
  yer: '',
  manuelTutar: null,
  adet: '',
  polisSayisi: '',
  gorevSuresi: '',
  krediAdedi: '',
  sigortaSirketiId: '',
  isletmeciId: '',
  tasOcagiId: '',
  notlar: ''
};

const BOS_ALT: TrafikAltBasvuru = {
  no: '',
  plaka: '',
  hasarDosyaNo: '',
  kazaTarihi: '',
  raporKonusu: '',
  raporTutari: 0
};

/** Formu iş akışına göre numaralı bölümlere ayırır. */
function Bolum({
  sira,
  baslik,
  aciklama,
  children





}: {sira: number;baslik: string;aciklama?: string;children: React.ReactNode;}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5" aria-label={baslik}>
      <div className="flex items-start gap-3 border-b border-border pb-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {sira}
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">{baslik}</h2>
          {aciklama && <p className="mt-0.5 text-xs text-muted-foreground">{aciklama}</p>}
        </div>
      </div>
      <div className="pt-4">{children}</div>
    </section>);

}

export function YeniIslem() {
  const {
    kullanici,
    bau,
    islemler,
    islemEkle,
    ajandaEkle,
    auditEkle,
    krediOzeti,
    krediHareketiEkle,
    sigortaBul,
    isletmeciBul,
    tasOcagiBul
  } = useApp();

  const [form, setForm] = useState<IslemFormu>(BOS_FORM);
  const [dekont, setDekont] = useState<DekontFormu>(BOS_DEKONT);
  const [dosya, setDosya] = useState<DekontDosyasi | null>(null);
  const [altSatirlar, setAltSatirlar] = useState<TrafikAltBasvuru[]>([]);
  const [sonKayit, setSonKayit] = useState<Islem | null>(null);

  const kullanilabilirBentler = useMemo(
    () => bentler.filter((b) => kullanici?.bentler.includes(b.kod)),
    [kullanici]
  );

  const guncelle = <K extends keyof IslemFormu,>(alan: K, deger: IslemFormu[K]) =>
  setForm((eski) => ({ ...eski, [alan]: deger }));

  const dekontGuncelle = <K extends keyof DekontFormu,>(alan: K, deger: DekontFormu[K]) =>
  setDekont((eski) => ({ ...eski, [alan]: deger }));

  const trafik = form.bent === 'F' && form.fAltTur === 'TRAFIK';
  const krediYukleme = form.bent === 'E' && form.eIslemTuru === 'KREDI_YUKLEME';
  const krediKullanim = form.bent === 'E' && form.eIslemTuru === 'KREDI_KULLANIM';
  const ozet = form.isletmeciId ? krediOzeti(form.isletmeciId) : null;
  const sigortaSirketi = sigortaBul(form.sigortaSirketiId);
  const isletmeci = isletmeciBul(form.isletmeciId);

  const talepEdenGorunur = form.bent !== 'E' && !trafik;
  const baslikGorunur = form.bent !== 'E';
  const operasyonGorunur =
  !!form.bent && form.bent !== 'A' && form.bent !== 'B' && !krediYukleme;
  const dekontGorunur = !!form.bent && !krediKullanim;
  const aciklamaOnce = form.bent === 'A' || form.bent === 'B';

  useEffect(() => {
    if (!trafik) {
      setAltSatirlar([]);
      return;
    }
    const adet = Number(form.adet) || 0;
    setAltSatirlar((eski) => Array.from({ length: adet }, (_, i) => eski[i] ?? { ...BOS_ALT }));
  }, [trafik, form.adet]);

  const sonuc = useMemo(
    () =>
    hesapla({
      bent: form.bent,
      fAltTur: form.fAltTur,
      bau,
      manuelTutar: form.manuelTutar ?? 0,
      adet: form.adet ? Number(form.adet) : 0,
      polisSayisi: form.polisSayisi ? Number(form.polisSayisi) : 0,
      gorevSuresi: form.gorevSuresi ? Number(form.gorevSuresi) : 0,
      krediAdedi: form.krediAdedi ? Number(form.krediAdedi) : 0
    }),
    [form, bau]
  );

  const kayitNoOnizleme = form.bent ?
  sonrakiKayitNo(islemler, form.bent as BentKodu, form.fAltTur, form.eIslemTuru) :
  '';

  const gosterilenAltlar = altSatirlar.map((satir, i) => ({
    ...satir,
    no: altBasvuruNo(kayitNoOnizleme, i + 1),
    raporTutari: raporBedeli(bau)
  }));

  const altGuncelle = (sira: number, alan: keyof TrafikAltBasvuru, deger: string) =>
  setAltSatirlar((eski) =>
  eski.map((satir, i) => i === sira ? { ...satir, [alan]: deger } : satir)
  );

  const odenen = dekont.odenenTutar ?? 0;
  const tutarUyumlu = odenen > 0 && Math.abs(odenen - sonuc.tutar) < 0.01;

  const dekontTamam =
  !!dosya &&
  dekont.dekontNo.trim() !== '' &&
  dekont.banka.trim() !== '' &&
  dekont.tarih !== '' &&
  dekont.odemeYapan.trim() !== '' &&
  tutarUyumlu;

  const temelTamam =
  (!baslikGorunur || form.baslik.trim() !== '') && (
  !talepEdenGorunur || form.talepEden.trim() !== '');

  const bentTamam = (() => {
    if (!form.bent) return false;
    if (form.bent === 'C' || form.bent === 'Ç') {
      return (
        sonuc.gecerli && !!form.operasyonTarihi && !!form.operasyonSaati && form.yer.trim() !== '');

    }
    if (form.bent === 'D') {
      return sonuc.gecerli && !!form.operasyonTarihi && form.yer.trim() !== '';
    }
    if (form.bent === 'F') {
      if (!form.fAltTur || !form.operasyonTarihi || !sonuc.gecerli) return false;
      if (!trafik) return true;
      if (!form.sigortaSirketiId) return false;
      return (
        altSatirlar.length > 0 &&
        altSatirlar.every((s) => s.plaka.trim() !== '' && s.kazaTarihi !== ''));

    }
    if (form.bent === 'E') {
      if (!form.eIslemTuru || !form.isletmeciId) return false;
      if (krediKullanim) {
        return (
          !!form.tasOcagiId &&
          !!form.operasyonTarihi &&
          !!form.operasyonSaati &&
          Number(form.krediAdedi) > 0);

      }
      return sonuc.gecerli;
    }
    return sonuc.gecerli;
  })();

  const kaydedilebilir =
  !!kullanici &&
  !kullanici.sadeceGoruntule &&
  temelTamam &&
  bentTamam && (
  !dekontGorunur || dekontTamam);

  const sifirla = () => {
    setForm(BOS_FORM);
    setDekont(BOS_DEKONT);
    setDosya(null);
    setAltSatirlar([]);
  };

  const kaydet = () => {
    if (!kullanici || !kaydedilebilir) return;
    const bent = form.bent as BentKodu;

    if (krediKullanim) {
      const kullanilacak = Number(form.krediAdedi);
      const mevcut = ozet?.kalan ?? 0;
      if (kullanilacak > mevcut) {
        auditEkle(
          'Kredi yetersiz işlem engellendi',
          `${isletmeci?.ad} · talep ${kullanilacak} / kullanılabilir ${mevcut}`
        );
        toast.error('Kullanılabilir kredi yetersiz', {
          description: 'Önce kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.'
        });
        return;
      }
    }

    const kayitNo = sonrakiKayitNo(islemler, bent, form.fAltTur, form.eIslemTuru);

    const altBasvurular: TrafikAltBasvuru[] | undefined = trafik ?
    altSatirlar.map((satir, i) => ({
      ...satir,
      no: altBasvuruNo(kayitNo, i + 1),
      raporKonusu: satir.raporKonusu.trim() || 'Trafik kaza raporu',
      raporTutari: raporBedeli(bau)
    })) :
    undefined;

    const talepEdenAdi = trafik ?
    sigortaSirketi?.ad ?? '—' :
    bent === 'E' ?
    isletmeci?.ad ?? '—' :
    form.talepEden.trim();

    const baslikMetni = baslikGorunur ?
    form.baslik.trim() :
    krediYukleme ?
    `Patlatma kredisi yükleme — ${form.krediAdedi} kredi` :
    `Patlatma kullanımı — ${tasOcagiBul(form.tasOcagiId)?.ad ?? ''}`;

    const yeni: Islem = {
      id: `is-${Date.now()}`,
      kayitNo,
      bent,
      fAltTur: form.fAltTur || undefined,
      eIslemTuru: form.eIslemTuru || undefined,
      baslik: baslikMetni,
      talepEden: talepEdenAdi,
      birim: kullanici.birim,
      olusturan: kullanici.rol,
      olusturmaTarihi: new Date().toISOString().slice(0, 10),
      operasyonTarihi: form.operasyonTarihi || undefined,
      operasyonSaati: form.operasyonSaati || undefined,
      yer: form.yer.trim() || undefined,
      etkinlikAdi: form.etkinlikAdi.trim() || undefined,
      polisSayisi: bent === 'D' ? Number(form.polisSayisi) : undefined,
      gorevSuresi: bent === 'D' ? Number(form.gorevSuresi) : undefined,
      tutar: krediKullanim ? 0 : sonuc.tutar,
      hesaplamaAciklamasi: krediKullanim ?
      `Kredi kullanımı — yeniden ödeme alınmaz. Ön ödemeli krediden ${form.krediAdedi} kredi düşüldü.` :
      sonuc.satirlar.join(' · '),
      dekont: krediKullanim ?
      {
        dekontNo: 'Ön ödemeli kredi',
        banka: '—',
        tarih: '',
        odenenTutar: 0,
        odemeYapan: isletmeci?.ad ?? '—',
        dosya: null
      } :
      {
        dekontNo: dekont.dekontNo.trim(),
        banka: dekont.banka.trim(),
        tarih: dekont.tarih,
        odenenTutar: odenen,
        odemeYapan: dekont.odemeYapan.trim(),
        dosya
      },
      makbuzNo: null,
      durum: krediKullanim ?
      'ISLEM_BASLATILABILIR' :
      krediYukleme ?
      'ODEME_BEKLIYOR' :
      'MAKBUZ_BEKLIYOR',
      sigortaSirketiId: trafik ? form.sigortaSirketiId : undefined,
      altBasvurular,
      isletmeciId: bent === 'E' ? form.isletmeciId : undefined,
      tasOcagiId: krediKullanim ? form.tasOcagiId : undefined,
      krediAdedi: bent === 'E' ? Number(form.krediAdedi) : undefined,
      notlar: form.notlar.trim() || undefined
    };

    islemEkle(yeni);
    auditEkle('Kayıt oluşturuldu', kayitNo);
    if (trafik) {
      auditEkle('Trafik ana TTRF oluşturuldu', `${kayitNo} · ${sigortaSirketi?.ad}`);
      altBasvurular?.forEach((alt) =>
      auditEkle('Trafik alt başvuru oluşturuldu', `${alt.no} · ${alt.plaka}`)
      );
    }

    if (krediYukleme) {
      krediHareketiEkle({
        id: `kh-${Date.now()}`,
        isletmeciId: form.isletmeciId,
        tip: 'YUKLEME',
        adet: Number(form.krediAdedi),
        kayitNo,
        dekontNo: dekont.dekontNo.trim(),
        tarih: dekont.tarih,
        aciklama: `${form.krediAdedi} patlatmalık ön ödeme alındı (doğrulama bekliyor).`
      });
      auditEkle(
        'Taş ocağı kredi yüklendi',
        `${isletmeci?.ad} · +${form.krediAdedi} kredi (doğrulama bekliyor)`
      );
    }

    if (krediKullanim) {
      krediHareketiEkle({
        id: `kh-${Date.now()}`,
        isletmeciId: form.isletmeciId,
        tip: 'KULLANIM',
        adet: Number(form.krediAdedi),
        kayitNo,
        tasOcagiId: form.tasOcagiId,
        tarih: form.operasyonTarihi,
        aciklama: `${tasOcagiBul(form.tasOcagiId)?.ad} — planlı patlatma.`
      });
      auditEkle(
        'Taş ocağı kredi kullanıldı',
        `${kayitNo} · -${form.krediAdedi} kredi · ${tasOcagiBul(form.tasOcagiId)?.ad}`
      );
    }

    const ajandayaDuser =
    bent === 'C' || bent === 'Ç' || bent === 'D' || bent === 'F' || krediKullanim;
    if (ajandayaDuser) {
      ajandaEkle({
        id: `aj-${Date.now()}`,
        kayitNo,
        bent,
        islemTuru: krediKullanim ?
        'Patlatma kullanımı' :
        bent === 'F' ?
        `${form.fAltTur === 'TRAFIK' ? 'Trafik' : 'Adli'} polis raporu${
        trafik ? ` (${altSatirlar.length} alt başvuru)` : ''}` :

        bentler.find((b) => b.kod === bent)?.baslik ?? '',
        baslik: form.etkinlikAdi.trim() || yeni.baslik,
        talepEden: talepEdenAdi,
        birim: kullanici.birim,
        tarih: form.operasyonTarihi,
        saat: form.operasyonSaati || '09:00',
        yer: krediKullanim ? tasOcagiBul(form.tasOcagiId)?.ad ?? '—' : form.yer.trim() || '—',
        durum: 'Planlandı',
        odemeDurumu: krediKullanim ?
        `Ön ödemeli kredi · ${form.krediAdedi} kredi düşüldü · Kalan ${
        (ozet?.kalan ?? 0) - Number(form.krediAdedi)}` :

        `Ödeme alındı · Makbuz bekliyor · ${formatTL(yeni.tutar)}`
      });
    }

    setSonKayit(yeni);
    toast.success('İşlem kaydı oluşturuldu', {
      description: `Kayıt no: ${kayitNo} · Numara sistem tarafından üretildi.`
    });
    sifirla();
  };

  if (!kullanici) return null;

  if (!kullanilabilirBentler.length) {
    return (
      <div className="space-y-6">
        <PageHeader baslik="Yeni İşlem" aciklama={`${kullanici.rol} · ${kullanici.birim}`} />
        <BosDurum
          baslik="Bu kullanıcı için işlem yapılabilir bent bulunmuyor"
          aciklama="Rol ve birim yetkiniz yalnızca görüntüleme ve rapor kapsamındadır. Yetkili bent tanımı Kullanıcı / Rol / Birim Yetkileri ekranından yapılır." />
        
      </div>);

  }

  const secilenBent = bentler.find((b) => b.kod === form.bent);
  const kaynakEtiketi = form.bent ?
  `${form.bent} bendi · ${
  trafik ? sigortaSirketi?.ad ?? 'Sigorta şirketi' : form.talepEden || isletmeci?.ad || 'Başvuru sahibi'}` :

  'Yeni işlem';

  const talepEdenEtiketi =
  form.bent === 'B' ?
  'Talep eden / satış kaynağı / ilgili birim' :
  form.bent === 'Ç' ?
  'Talep eden sigorta şirketi / kurum' :
  'Talep eden kişi / kurum';

  // Bölüm sırası iş akışına göre kurulur.
  const bolumler: {baslik: string;aciklama?: string;icerik: React.ReactNode;}[] = [];

  bolumler.push({
    baslik: 'İşlem Kaynağı',
    aciklama: 'Bent, alt tür ve başvuru kaynağı seçilir.',
    icerik:
    <div className="space-y-4">
        <div className="sm:max-w-sm">
          <Label htmlFor="bent">Bent</Label>
          <Select
          value={form.bent || undefined}
          onValueChange={(v) => {
            setForm({ ...BOS_FORM, bent: v as BentKodu });
            setDosya(null);
            setDekont(BOS_DEKONT);
            setAltSatirlar([]);
          }}>
          
            <SelectTrigger id="bent" className="mt-1.5">
              <SelectValue placeholder="Lütfen bent seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {kullanilabilirBentler.map((b) =>
            <SelectItem key={b.kod} value={b.kod}>
                  {b.kod} - {b.baslik}
                </SelectItem>
            )}
            </SelectContent>
          </Select>
          {secilenBent &&
        <p className="mt-1.5 text-xs text-muted-foreground">{secilenBent.aciklama}</p>
        }
        </div>

        <BentAlanlari
        bolum="kaynak"
        form={form}
        guncelle={guncelle}
        krediOzeti={ozet}
        patlatmaBedeliTutar={patlatmaBedeli(bau)}
        raporBedeliTutar={raporBedeli(bau)}
        altBasvurular={gosterilenAltlar}
        altGuncelle={altGuncelle} />
      

        {talepEdenGorunur &&
      <div className="sm:max-w-md">
            <Label htmlFor="talep-eden">{talepEdenEtiketi}</Label>
            <Input
          id="talep-eden"
          value={form.talepEden}
          onChange={(e) => guncelle('talepEden', e.target.value)}
          placeholder="Örn. Palm Beach Otel"
          className="mt-1.5" />
        
          </div>
      }

        {baslikGorunur &&
      <div className="sm:max-w-md">
            <Label htmlFor="baslik">İşlem konusu</Label>
            <Input
          id="baslik"
          value={form.baslik}
          onChange={(e) => guncelle('baslik', e.target.value)}
          placeholder="Örn. İtfaiye denetim ve kontrol raporu"
          className="mt-1.5" />
        
          </div>
      }
      </div>

  });

  if (operasyonGorunur) {
    bolumler.push({
      baslik: 'Operasyon Bilgisi',
      aciklama: 'Ajanda bu tarihten beslenir; dekont tarihinden bağımsızdır.',
      icerik:
      <BentAlanlari
        bolum="operasyon"
        form={form}
        guncelle={guncelle}
        krediOzeti={ozet}
        patlatmaBedeliTutar={patlatmaBedeli(bau)}
        raporBedeliTutar={raporBedeli(bau)}
        altBasvurular={gosterilenAltlar}
        altGuncelle={altGuncelle} />


    });
  }

  bolumler.push({
    baslik: 'Hesaplama',
    aciklama: krediKullanim ?
    'Kullanılacak kredi ve yeterlilik kontrolü.' :
    `Yasa 57/2026 Madde 6 · BAÜ: ${formatTL(bau)}`,
    icerik:
    <div className="space-y-4">
        <BentAlanlari
        bolum="hesaplama"
        form={form}
        guncelle={guncelle}
        krediOzeti={ozet}
        patlatmaBedeliTutar={patlatmaBedeli(bau)}
        raporBedeliTutar={raporBedeli(bau)}
        altBasvurular={gosterilenAltlar}
        altGuncelle={altGuncelle} />
      
        {!krediKullanim && <HesaplamaKutusu sonuc={sonuc} />}
      </div>

  });

  const aciklamaBolumu = {
    baslik: 'Açıklama',
    aciklama: 'Serbest not — kayıt ve ajanda kartında görünür.',
    icerik:
    <div>
        <Label htmlFor="notlar" className="sr-only">
          Açıklama / görev notu
        </Label>
        <Textarea
        id="notlar"
        value={form.notlar}
        onChange={(e) => guncelle('notlar', e.target.value)}
        rows={3}
        placeholder="Açıklama / görev notu" />
      
      </div>

  };

  const dekontBolumu = {
    baslik: 'Ödeme / Dekont ve Dijital Dosya',
    aciklama: 'Dekont dosyası olmadan ödeme gerektiren kayıt oluşturulamaz.',
    icerik:
    <DekontBolumu
      form={dekont}
      guncelle={dekontGuncelle}
      dosya={dosya}
      dosyaAta={setDosya}
      kaynakEtiketi={kaynakEtiketi}
      beklenenTutar={sonuc.tutar}
      auditEkle={auditEkle} />


  };

  if (dekontGorunur) {
    if (aciklamaOnce) {
      bolumler.push(aciklamaBolumu, dekontBolumu);
    } else {
      bolumler.push(dekontBolumu, aciklamaBolumu);
    }
  } else {
    bolumler.push(aciklamaBolumu);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Yeni İşlem"
        aciklama={`Kayıt numarası sistem tarafından üretilir. BAÜ: ${formatTL(
          bau
        )} · Tüm tutarlar TL formatındadır.`} />
      

      {sonKayit &&
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>
            <strong className="font-mono">{sonKayit.kayitNo}</strong> kaydı oluşturuldu. Makbuz
            süreci Ödeme / Makbuz ekranından yürütülür.
          </span>
        </div>
      }

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {bolumler.map((bolum, i) =>
          <Bolum
            key={bolum.baslik}
            sira={i + 1}
            baslik={bolum.baslik}
            aciklama={bolum.aciklama}>
            
              {bolum.icerik}
            </Bolum>
          )}

          <Bolum
            sira={bolumler.length + 1}
            baslik="Kayıt"
            aciklama="Kayıt numarası merkezi sistem tarafından üretilir; elle yazılamaz.">
            
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Üretilecek kayıt numarası</p>
                <p className="mt-1 font-mono text-sm text-primary">{kayitNoOnizleme || '—'}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Eşzamanlı işlemlerde transaction, sequence ve unique constraint ile çakışma
                  önlenir. Offline makbuz üretimi yoktur.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="lg" disabled={!kaydedilebilir} onClick={kaydet}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  İşlemi kaydet
                </Button>
                <Button variant="ghost" size="lg" onClick={sifirla}>
                  Formu sıfırla
                </Button>
              </div>

              {!kaydedilebilir &&
              <p className="text-xs text-muted-foreground">
                  {krediKullanim ?
                'Kayıt için işletmeci, taş ocağı, patlatma tarihi/saati ve kullanılacak kredi girilmelidir.' :
                'Kayıt için işlem kaynağı, operasyon bilgisi, hesaplama alanları, dekont bilgileri, dijital dekont dosyası ve hesaplanan tutarla eşleşen ödeme tamamlanmalıdır.'}
                </p>
              }
            </div>
          </Bolum>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">İşlem özeti</p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Bent</dt>
                <dd className="text-foreground">
                  {form.bent ?
                  `${form.bent}${form.fAltTur ? ` · ${form.fAltTur === 'TRAFIK' ? 'Trafik' : 'Adli'}` : ''}` :
                  '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Kaynak</dt>
                <dd className="max-w-[60%] truncate text-right text-foreground">
                  {trafik ?
                  sigortaSirketi?.ad ?? 'Sigorta şirketi seçilmedi' :
                  form.bent === 'E' ?
                  isletmeci?.ad ?? 'İşletmeci seçilmedi' :
                  form.talepEden || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Operasyon tarihi</dt>
                <dd className="text-foreground">{form.operasyonTarihi || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">
                  {krediKullanim ? 'Kullanılacak kredi' : 'Hesaplanan tutar'}
                </dt>
                <dd className="font-medium text-foreground">
                  {krediKullanim ?
                  `${Number(form.krediAdedi) || 0} kredi` :
                  formatTL(sonuc.tutar)}
                </dd>
              </div>
              {dekontGorunur &&
              <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Ödenen tutar</dt>
                  <dd
                  className={`font-medium ${
                  odenen > 0 && !tutarUyumlu ? 'text-rose-700' : 'text-foreground'}`
                  }>
                  
                    {odenen > 0 ? formatTL(odenen) : '—'}
                  </dd>
                </div>
              }
            </dl>
          </div>

          {trafik && form.sigortaSirketiId &&
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <p className="font-medium text-foreground">TTRF yapısı</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ana kayıt TTRF serisinde açılır, {altSatirlar.length} alt başvuru ana kayda bağlanır.
                Ödeme, dekont ve makbuz yalnızca ana kayda işlenir.
              </p>
            </div>
          }

          {krediKullanim &&
          <KuralNotu baslik="Ödeme / dekont">
              Patlatma kullanımında ödeme yeniden alınmaz; ödeme ve dekont işletmecinin kredi yükleme
              kaydında (EKRD serisi) bulunur.
            </KuralNotu>
          }
        </aside>
      </div>
    </div>);

}