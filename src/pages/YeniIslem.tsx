import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { BosDurum } from '../components/common/BosDurum';
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
import { BentAlanlari, GorevDilimiSatiri, IslemFormu } from '../components/islem/BentAlanlari';
import { BOS_DEKONT, DekontBolumu, DekontFormu } from '../components/islem/DekontBolumu';
import { HesaplamaKutusu } from '../components/islem/HesaplamaKutusu';
import { bentler } from '../data/bentler';
import { useApp } from '../contexts/AppContext';
import { AdliRapor, BentKodu, DekontDosyasi, Islem, TrafikAltBasvuru } from '../types';
import { hesapla, patlatmaBedeli, raporBedeli } from '../utils/hesaplama';
import { DekontOcrSonucu, normalizeDekontNo } from '../utils/dekontOcr';
import { altBasvuruNo, sonrakiKayitNo } from '../utils/numaralandirma';
import { formatTL, formatTarih } from '../utils/currency';
import { islemDekontlariniOku } from '../utils/krediYukleme';

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
  bilgiKaynagi: '',
  notlar: ''
};

const BOS_TRAFIK: TrafikAltBasvuru = {
  no: '',
  plaka: '',
  hasarDosyaNo: '',
  kazaTarihi: '',
  raporKonusu: '',
  raporTutari: 0
};

const BOS_ADLI: AdliRapor = {
  no: '',
  basvuran: '',
  dosyaNo: '',
  raporKonusu: '',
  olayTarihi: '',
  aciklama: '',
  raporTutari: 0
};

/** D bendi görev dilimi — yeni satır 1 polis × 1 saat başlangıç değeriyle açılır. */
function yeniDilim(): GorevDilimiSatiri {
  return {
    id: `gd-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    polisSayisi: '1',
    gorevSuresi: '1',
    polisSaat: 0,
    tutar: 0
  };
}

/** Bent seçildiğinde gelen en düşük geçerli değerler — placeholder değil, gerçek form değeri. */
function bentVarsayilanlari(bent: BentKodu): Partial<IslemFormu> {
  if (bent === 'C' || bent === 'Ç') return { adet: '1' };
  if (bent === 'E') return { eIslemTuru: 'KREDI_YUKLEME', krediAdedi: '1' };
  return {};
}

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
    islemOlustur,
    auditEkle,
    krediOzeti,
    sigortaBul,
    isletmeciBul
  } = useApp();

  const [form, setForm] = useState<IslemFormu>(BOS_FORM);
  const [dekont, setDekont] = useState<DekontFormu>(BOS_DEKONT);
  const [dosya, setDosya] = useState<DekontDosyasi | null>(null);
  const [dekontKontrolTamamlandi, setDekontKontrolTamamlandi] = useState(false);
  const [ocrBilgileri, setOcrBilgileri] = useState<Pick<DekontOcrSonucu, 'durum' | 'okunanAlanlar' | 'guven'>>({ durum: 'BASARISIZ', okunanAlanlar: [], guven: {} });
  const [trafikSatirlari, setTrafikSatirlari] = useState<TrafikAltBasvuru[]>([]);
  const [adliSatirlari, setAdliSatirlari] = useState<AdliRapor[]>([]);
  const [dilimler, setDilimler] = useState<GorevDilimiSatiri[]>([]);
  const [sonKayit, setSonKayit] = useState<Islem | null>(null);
  const navigate = useNavigate();

  const kullanilabilirBentler = useMemo(
    () => bentler.filter((b) => kullanici?.bentler.includes(b.kod)),
    [kullanici]
  );

  const guncelle = <K extends keyof IslemFormu,>(alan: K, deger: IslemFormu[K]) => {
    if (alan === 'fAltTur') {
      setDekont(BOS_DEKONT);
      setDosya(null);
      setForm((eski) => ({
        ...eski,
        fAltTur: deger as IslemFormu['fAltTur'],
        sigortaSirketiId: deger === 'TRAFIK' ? eski.sigortaSirketiId : '',
        notlar: ''
      }));
      return;
    }
    if (alan === 'eIslemTuru') {
      setDekont(BOS_DEKONT);
      setDosya(null);
      setForm((eski) => ({
        ...eski,
        eIslemTuru: deger as IslemFormu['eIslemTuru'],
        tasOcagiId: '',
        operasyonTarihi: '',
        operasyonSaati: '',
        krediAdedi: '1',
        notlar: ''
      }));
      return;
    }
    setForm((eski) => ({ ...eski, [alan]: deger }));
  };

  const dekontGuncelle = <K extends keyof DekontFormu,>(alan: K, deger: DekontFormu[K]) =>
  setDekont((eski) => ({ ...eski, [alan]: deger }));

  const trafik = form.bent === 'F' && form.fAltTur === 'TRAFIK';
  const adli = form.bent === 'F' && form.fAltTur === 'ADLI';
  const krediYukleme = form.bent === 'E' && form.eIslemTuru === 'KREDI_YUKLEME';
  const ozet = form.isletmeciId ? krediOzeti(form.isletmeciId) : null;
  const sigortaSirketi = sigortaBul(form.sigortaSirketiId);
  const isletmeci = isletmeciBul(form.isletmeciId);

  const otomatikKaynak = trafik || form.bent === 'E';
  const baslikGorunur = form.bent !== 'E';
  const raporBolumuVar = trafik || adli;
  const operasyonGorunur =
  !!form.bent && form.bent !== 'A' && form.bent !== 'B' && form.bent !== 'E';
  // E bendinde yalnız kredi yükleme akışı vardır; dekont yalnız kredi yüklemede istenir.
  const dekontGorunur = form.bent === 'E' ? krediYukleme : !!form.bent;

  // F bendi seçildiğinde ilk rapor satırı otomatik açılır.
  useEffect(() => {
    if (trafik) {
      setTrafikSatirlari((eski) => eski.length ? eski : [{ ...BOS_TRAFIK }]);
    } else {
      setTrafikSatirlari([]);
    }
  }, [trafik]);

  useEffect(() => {
    if (adli) {
      setAdliSatirlari((eski) => eski.length ? eski : [{ ...BOS_ADLI }]);
    } else {
      setAdliSatirlari([]);
    }
  }, [adli]);

  // D bendi seçildiğinde en az bir görev dilimi başlatılır; başka bente geçilince dilimler temizlenir.
  useEffect(() => {
    if (form.bent === 'D') {
      setDilimler((eski) => eski.length ? eski : [yeniDilim()]);
    } else {
      setDilimler([]);
    }
  }, [form.bent]);

  const raporSayisi = trafik ? trafikSatirlari.length : adli ? adliSatirlari.length : 0;

  const sonuc = useMemo(
    () =>
    hesapla({
      bent: form.bent,
      fAltTur: form.fAltTur,
      bau,
      manuelTutar: form.manuelTutar ?? 0,
      adet: form.bent === 'F' ? raporSayisi : form.adet ? Number(form.adet) : 0,
      gorevDilimleri: form.bent === 'D' ?
      dilimler.map((d) => ({
        id: d.id,
        polisSayisi: Number(d.polisSayisi) || 0,
        gorevSuresi: Number(d.gorevSuresi) || 0
      })) :
      undefined,
      krediAdedi: form.krediAdedi ? Number(form.krediAdedi) : 0
    }),
    [form, bau, raporSayisi, dilimler]
  );

  const kayitNoOnizleme = form.bent ?
  sonrakiKayitNo(islemler, form.bent as BentKodu, form.fAltTur, form.eIslemTuru) :
  '';

  const gosterilenTrafik = trafikSatirlari.map((satir, i) => ({
    ...satir,
    no: altBasvuruNo(kayitNoOnizleme, i + 1),
    raporTutari: raporBedeli(bau)
  }));

  const gosterilenAdli = adliSatirlari.map((satir, i) => ({
    ...satir,
    no: altBasvuruNo(kayitNoOnizleme, i + 1),
    raporTutari: raporBedeli(bau)
  }));

  const gosterilenDilimler = dilimler.map((dilim) => {
    const polis = Number(dilim.polisSayisi) || 0;
    const sure = Number(dilim.gorevSuresi) || 0;
    const polisSaat = polis * sure;
    return {
      ...dilim,
      polisSaat,
      tutar: polisSaat * bau * 0.005
    };
  });

  const trafikGuncelle = (sira: number, alan: keyof TrafikAltBasvuru, deger: string) =>
  setTrafikSatirlari((eski) =>
  eski.map((satir, i) => i === sira ? { ...satir, [alan]: deger } : satir)
  );
  const trafikEkle = () => setTrafikSatirlari((eski) => [...eski, { ...BOS_TRAFIK }]);
  const trafikKaldir = (sira: number) =>
  setTrafikSatirlari((eski) => eski.filter((_, i) => i !== sira));

  const adliGuncelle = (sira: number, alan: keyof AdliRapor, deger: string) =>
  setAdliSatirlari((eski) =>
  eski.map((satir, i) => i === sira ? { ...satir, [alan]: deger } : satir)
  );
  const adliEkle = () => setAdliSatirlari((eski) => [...eski, { ...BOS_ADLI }]);
  const adliKaldir = (sira: number) => setAdliSatirlari((eski) => eski.filter((_, i) => i !== sira));

  const dilimGuncelle = (sira: number, alan: 'polisSayisi' | 'gorevSuresi', deger: string) =>
  setDilimler((eski) =>
  eski.map((dilim, i) => i === sira ? { ...dilim, [alan]: deger } : dilim)
  );
  const dilimEkle = () => setDilimler((eski) => [...eski, yeniDilim()]);
  const dilimKaldir = (sira: number) =>
  setDilimler((eski) => eski.length > 1 ? eski.filter((_, i) => i !== sira) : eski);

  const odenen = dekont.odenenTutar ?? 0;
  const tutarUyumlu = odenen > 0 && Math.abs(odenen - sonuc.tutar) < 0.01;
  const tutarGecerli = krediYukleme ? odenen > 0 : tutarUyumlu;
  const dekontNo = normalizeDekontNo(dekont.dekontNo);
  const bankaReferansNo = normalizeDekontNo(dekont.bankaReferansNo);
  const banka = dekont.banka.trim().toLocaleUpperCase('tr-TR');
  const tumDekontKayitlari = islemler.flatMap((islem) =>
    islemDekontlariniOku(islem).map((kayitDekont) => ({ islem, kayitDekont }))
  );
  const duplicateDekont = krediYukleme && dekontNo && banka ? islemler.find((islem) =>
    islemDekontlariniOku(islem).some((kayitDekont) =>
      normalizeDekontNo(kayitDekont.dekontNo) === dekontNo &&
      kayitDekont.banka.trim().toLocaleUpperCase('tr-TR') === banka)) : undefined;
  const duplicateReferans = krediYukleme && bankaReferansNo && banka ? islemler.find((islem) =>
    islemDekontlariniOku(islem).some((kayitDekont) =>
      normalizeDekontNo(kayitDekont.bankaReferansNo ?? '') === bankaReferansNo &&
      kayitDekont.banka.trim().toLocaleUpperCase('tr-TR') === banka)) : undefined;
  const duplicateDosya = krediYukleme && dosya?.dekontHash ? tumDekontKayitlari.find(({ kayitDekont }) => kayitDekont.dosya?.dekontHash === dosya.dekontHash)?.islem : undefined;
  const gelecekDekontTarihi = krediYukleme && !!dekont.tarih && dekont.tarih > new Date().toISOString().slice(0, 10);

  const dekontTamam =
  !!dosya &&
  dekont.dekontNo.trim() !== '' &&
  dekont.banka.trim() !== '' &&
  dekont.tarih !== '' &&
  dekont.odemeYapan.trim() !== '' &&
  tutarGecerli &&
  !duplicateDekont &&
  !duplicateReferans &&
  !duplicateDosya &&
  !gelecekDekontTarihi &&
  (!krediYukleme || dekontKontrolTamamlandi);

  const talepEdenAdi = trafik ?
  sigortaSirketi?.ad ?? '' :
  form.bent === 'E' ?
  isletmeci?.ad ?? '' :
  form.talepEden.trim();

  const temelTamam =
  (!baslikGorunur || form.baslik.trim() !== '') && (otomatikKaynak || talepEdenAdi !== '');

  const bentTamam = (() => {
    if (!form.bent) return false;
    if (form.bent === 'C' || form.bent === 'Ç') {
      return (
        sonuc.gecerli && !!form.operasyonTarihi && !!form.operasyonSaati && form.yer.trim() !== '');

    }
    if (form.bent === 'D') {
      return (
        sonuc.gecerli &&
        form.etkinlikAdi.trim() !== '' &&
        !!form.operasyonTarihi &&
        !!form.operasyonSaati &&
        form.yer.trim() !== ''
      );
    }
    if (form.bent === 'F') {
      if (!form.fAltTur || !form.operasyonTarihi || !sonuc.gecerli) return false;
      if (trafik) {
        if (!form.sigortaSirketiId) return false;
        return (
          trafikSatirlari.length > 0 &&
          trafikSatirlari.every(
            (s) =>
            s.plaka.trim() !== '' &&
            s.hasarDosyaNo.trim() !== '' &&
            s.kazaTarihi !== '' &&
            s.raporKonusu.trim() !== ''
          ));

      }
      return (
        adliSatirlari.length > 0 &&
        adliSatirlari.every(
          (s) =>
          s.basvuran.trim() !== '' &&
          s.dosyaNo.trim() !== '' &&
          s.raporKonusu.trim() !== '' &&
          s.olayTarihi !== ''
        ));

    }
    if (form.bent === 'E') {
      if (!form.eIslemTuru || !form.isletmeciId) return false;
      return sonuc.gecerli;
    }
    return sonuc.gecerli;
  })();

  const kaynakTamam = (() => {
    if (!form.bent || !temelTamam) return false;
    if (form.bent === 'F') {
      if (!form.fAltTur) return false;
      return !trafik || !!form.sigortaSirketiId;
    }
    if (form.bent === 'E') {
      return !!form.eIslemTuru && !!form.isletmeciId;
    }
    return true;
  })();

  const raporTamam = (() => {
    if (!raporBolumuVar) return true;
    if (trafik) {
      return trafikSatirlari.length > 0 && trafikSatirlari.every(
        (s) =>
        s.plaka.trim() !== '' &&
        s.hasarDosyaNo.trim() !== '' &&
        s.kazaTarihi !== '' &&
        s.raporKonusu.trim() !== ''
      );
    }
    return adliSatirlari.length > 0 && adliSatirlari.every(
      (s) =>
      s.basvuran.trim() !== '' &&
      s.dosyaNo.trim() !== '' &&
      s.raporKonusu.trim() !== '' &&
      s.olayTarihi !== ''
    );
  })();

  const operasyonTamam = (() => {
    if (!operasyonGorunur) return true;
    if (form.bent === 'C' || form.bent === 'Ç' || form.bent === 'F') {
      return !!form.operasyonTarihi && !!form.operasyonSaati && form.yer.trim() !== '';
    }
    if (form.bent === 'D') {
      return form.etkinlikAdi.trim() !== '' && !!form.operasyonTarihi && !!form.operasyonSaati && form.yer.trim() !== '';
    }
    return true;
  })();

  const hesaplamaBolumuGorunur =
  !!form.bent &&
  kaynakTamam &&
  raporTamam &&
  operasyonTamam;

  const hesaplamaOlustu =
  hesaplamaBolumuGorunur &&
  bentTamam &&
  sonuc.gecerli && sonuc.tutar > 0;

  const dekontBolumuGorunur = dekontGorunur && hesaplamaOlustu && sonuc.tutar > 0;
  const notBolumuGorunur = hesaplamaOlustu;
  const kayitBolumuGorunur = dekontTamam;
  const makbuzYetkiGerekiyor = !!form.bent && (form.bent !== 'E' || krediYukleme);
  const makbuzYetkiTamam = !makbuzYetkiGerekiyor || !!kullanici?.makbuzUretebilir;

  const kaydedilebilir =
  !!kullanici &&
  !kullanici.sadeceGoruntule &&
  makbuzYetkiTamam &&
  temelTamam &&
  bentTamam && (
  !dekontGorunur || dekontTamam);

  const sifirla = () => {
    setForm(BOS_FORM);
    setDekont(BOS_DEKONT);
    setDosya(null);
    setDekontKontrolTamamlandi(false);
    setOcrBilgileri({ durum: 'BASARISIZ', okunanAlanlar: [], guven: {} });
    setTrafikSatirlari([]);
    setAdliSatirlari([]);
    setDilimler([]);
  };

  const kaydet = () => {
    if (!kullanici || !kaydedilebilir) return;

    const sonucKayit = islemOlustur({
      bent: form.bent as BentKodu,
      fAltTur: form.fAltTur || undefined,
      eIslemTuru: form.eIslemTuru || undefined,
      baslik: form.baslik,
      talepEden: talepEdenAdi || '—',
      operasyonTarihi: form.operasyonTarihi || undefined,
      operasyonSaati: form.operasyonSaati || undefined,
      yer: form.yer || undefined,
      etkinlikAdi: form.etkinlikAdi || undefined,
      polisSayisi: form.bent === 'D' && dilimler[0] ? Number(dilimler[0].polisSayisi) : undefined,
      gorevSuresi: form.bent === 'D' && dilimler[0] ? Number(dilimler[0].gorevSuresi) : undefined,
      gorevDilimleri: form.bent === 'D' && dilimler.length ?
      dilimler.map((d) => ({
        id: d.id,
        polisSayisi: Number(d.polisSayisi) || 0,
        gorevSuresi: Number(d.gorevSuresi) || 0
      })) :
      undefined,
      tutar: sonuc.tutar,
      hesaplamaSatirlari: sonuc.satirlar,
      dekontNo: dekont.dekontNo,
      bankaReferansNo: dekont.bankaReferansNo || undefined,
      banka: dekont.banka,
      dekontTarihi: dekont.tarih,
      odenenTutar: odenen,
      odemeYapan: dekont.odemeYapan,
      dekontDosyasi: dosya,
      ocrDurumu: ocrBilgileri.durum,
      ocrOkunanAlanlar: ocrBilgileri.okunanAlanlar,
      ocrGuvenBilgileri: ocrBilgileri.guven,
      sigortaSirketiId: trafik ? form.sigortaSirketiId : undefined,
      trafikAltBasvurular: trafik ? trafikSatirlari : undefined,
      adliRaporlar: adli ? adliSatirlari : undefined,
      isletmeciId: form.bent === 'E' ? form.isletmeciId : undefined,
      krediAdedi: form.bent === 'E' ? Number(form.krediAdedi) : undefined,
      notlar: form.notlar || undefined
    });

    if (!sonucKayit.basarili || !sonucKayit.kayit) {
      toast.error('İşlem kaydı oluşturulamadı', { description: sonucKayit.mesaj });
      return;
    }

    const olusanMakbuzlar =
    sonucKayit.kayit.eIslemTuru === 'KREDI_YUKLEME' ?
    (sonucKayit.kayit.bagisMakbuzlari ?? []).
    map((makbuz) => makbuz.makbuzNo).
    filter((no): no is string => !!no) :
    sonucKayit.kayit.makbuzNo ?
    [sonucKayit.kayit.makbuzNo] :
    [];
    const makbuzAciklamasi = olusanMakbuzlar.length ? ` · Makbuz: ${olusanMakbuzlar.join(', ')}` : '';

    setSonKayit(sonucKayit.kayit);
    toast.success('İşlem kaydı oluşturuldu', {
      description: `Kayıt no: ${sonucKayit.kayitNo}${makbuzAciklamasi} · Numara sistem tarafından üretildi.`
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

  const sonKayitMakbuzlari = sonKayit ?
  sonKayit.eIslemTuru === 'KREDI_YUKLEME' ?
  (sonKayit.bagisMakbuzlari ?? []).map((makbuz) => makbuz.makbuzNo).filter((no): no is string => !!no) :
  sonKayit.makbuzNo ?
  [sonKayit.makbuzNo] :
  [] :
  [];

  const secilenBent = bentler.find((b) => b.kod === form.bent);
  const kaynakEtiketi = form.bent ?
  `${form.bent} bendi · ${talepEdenAdi || 'Başvuru sahibi'}` :
  'Yeni işlem';

  const talepEdenEtiketi =
  form.bent === 'B' ?
  'Talep eden / satış kaynağı / ilgili birim' :
  'Talep eden kişi / kurum';

  const bentAlanProps = {
    form,
    guncelle,
    krediOzeti: ozet,
    patlatmaBedeliTutar: patlatmaBedeli(bau),
    raporBedeliTutar: raporBedeli(bau),
    trafikSatirlari: gosterilenTrafik,
    trafikGuncelle,
    trafikEkle,
    trafikKaldir,
    adliSatirlari: gosterilenAdli,
    adliGuncelle,
    adliEkle,
    adliKaldir,
    dilimSatirlari: gosterilenDilimler,
    dilimGuncelle,
    dilimEkle,
    dilimKaldir
  };

  const bolumler: {baslik: string;aciklama?: string;icerik: React.ReactNode;}[] = [];

  bolumler.push({
    baslik: 'Başvuru Kaynağı',
    aciklama: 'Bent, işlem türü ve başvuru kaynağı seçilir.',
    icerik:
    <div className="space-y-4">
        <div className="sm:max-w-sm">
          <Label htmlFor="bent">Bent</Label>
          <Select
          value={form.bent}
          onValueChange={(v) => {
            const yeniBent = v as BentKodu;
            setForm({ ...BOS_FORM, bent: yeniBent, ...bentVarsayilanlari(yeniBent) });
            setDosya(null);
            setDekont(BOS_DEKONT);
            setTrafikSatirlari([]);
            setAdliSatirlari([]);
            setDilimler([]);
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

        <BentAlanlari bolum="kaynak" {...bentAlanProps} />

        {!!form.bent &&
      <div className="sm:max-w-md">
            <Label htmlFor="talep-eden">{talepEdenEtiketi}</Label>
            {otomatikKaynak ?
        <>
                <Input
            id="talep-eden"
            value={talepEdenAdi}
            readOnly
            placeholder={
            trafik ? 'Seçilen sigorta şirketi' : 'Seçilen işletmeci / sahip'
            }
            className="mt-1.5 bg-muted/50" />
          
                <p className="mt-1 text-xs text-muted-foreground">
                  {trafik ?
            'Talep eden, seçilen sigorta şirketinden otomatik gelir.' :
            'Talep eden, seçilen işletmeci / sahipten otomatik gelir.'}
                </p>
              </> :

        <Input
          id="talep-eden"
          value={form.talepEden}
          onChange={(e) => guncelle('talepEden', e.target.value)}
          placeholder="Örn. Palm Beach Otel"
          className="mt-1.5" />

        }
          </div>
      }

        {baslikGorunur && !!form.bent &&
      <div className="sm:max-w-md">
            <Label htmlFor="baslik">İşlem konusu</Label>
            <Input
          id="baslik"
          value={form.baslik}
          onChange={(e) => guncelle('baslik', e.target.value)}
          placeholder={
          form.bent === 'D' ?
          'Örn. Maraton yol kapama ve güvenlik tedbiri' :
          'Örn. İtfaiye denetim ve kontrol raporu'
          }
          className="mt-1.5" />
        
          </div>
      }
      </div>

  });

  if (raporBolumuVar && kaynakTamam) {
    bolumler.push({
      baslik: trafik ? 'Rapor Bilgisi' : 'Adli Rapor Bilgisi',
      aciklama:
      'İlk rapor otomatik açıktır. Gerekiyorsa ek rapor ekleyin; tümü tek ana kayda bağlanır.',
      icerik: <BentAlanlari bolum="rapor" {...bentAlanProps} />
    });
  }

  if (operasyonGorunur && kaynakTamam) {
    bolumler.push({
      baslik: 'Operasyon Bilgisi',
      aciklama: 'Ajanda bu tarihten beslenir; dekont tarihinden bağımsızdır.',
      icerik: <BentAlanlari bolum="operasyon" {...bentAlanProps} />
    });
  }

  if (hesaplamaBolumuGorunur) {
    bolumler.push({
      baslik: 'Hesaplama Özeti',
      aciklama: `Yasa 57/2026 Madde 6 · BAÜ: ${formatTL(bau)}`,
      icerik:
      <div className="space-y-4">
          <BentAlanlari bolum="hesaplama" {...bentAlanProps} />
          {sonuc.gecerli && sonuc.tutar > 0 ?
        <HesaplamaKutusu sonuc={sonuc} /> :
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Hesaplama için önce gerekli işlem bilgilerini girin.
            </p>
          }
        </div>

    });
  }

  if (dekontBolumuGorunur) {
    bolumler.push({
      baslik: 'Ödeme / Dekont ve Dijital Dosya',
      aciklama:
      form.bent === 'D' ?
      'Kayıt oluşturmak için dijital dekont dosyası yüklenmelidir.' :
      'Dekont dosyası olmadan ödeme gerektiren kayıt oluşturulamaz.',
      icerik:
      <div className="space-y-3">
        {krediYukleme && <p className={dekontKontrolTamamlandi ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800' : 'rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800'}>
          {dekontKontrolTamamlandi ? '✓ Dekont kullanıcı tarafından kontrol edildi' : dosya ? 'Dekont yüklendi — kontrol bekliyor' : 'Dekont yüklenmesi bekleniyor'}
        </p>}
        <DekontBolumu
          form={dekont}
          guncelle={dekontGuncelle}
          dosya={dosya}
          dosyaAta={setDosya}
          kaynakEtiketi={kaynakEtiketi}
          beklenenTutar={sonuc.tutar}
          tutarKurali={krediYukleme ? 'POZITIF_OLMALI' : 'ESIT_OLMALI'}
          qrOdenecekTutarGoster={form.bent === 'D'}
          auditEkle={auditEkle}
          mevcutIslemler={islemler}
          ocrBilgisi={setOcrBilgileri}
          gelistirilmisMi={krediYukleme}
          dekontKontrolDurumu={setDekontKontrolTamamlandi} />
      </div>


    });
  }

  if (notBolumuGorunur) {
    bolumler.push({
      baslik: 'Açıklama / Not',
      aciklama: 'Varsa açıklama / görev notu — zorunlu değildir.',
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
          placeholder="Varsa açıklama / görev notu" />
        
        </div>

    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Yeni İşlem"
        aciklama={`Kayıt numarası sistem tarafından üretilir. BAÜ: ${formatTL(
          bau
        )} · Tüm tutarlar TL formatındadır.`} />
      

      {sonKayit &&
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>
              Kayıt oluşturuldu: <strong className="font-mono">{sonKayit.kayitNo}</strong>.
            {` Makbuz anlık üretildi${
            sonKayitMakbuzlari.length ? ` (${sonKayitMakbuzlari.join(', ')})` : ''
            }. Tekrar döküm için Kayıt Detayı veya Ödeme / Makbuz ekranı kullanılabilir.`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/kayitlar/${sonKayit.kayitNo}`)}>
            Kaydı Gör
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            setSonKayit(null);
            sifirla();
          }}>
            Yeni İşlem
          </Button>
        </div>
        </div>
      }

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {bolumler.map((bolum, i) =>
          <Bolum key={bolum.baslik} sira={i + 1} baslik={bolum.baslik} aciklama={bolum.aciklama}>
              {bolum.icerik}
            </Bolum>
          )}

          {kayitBolumuGorunur &&
          <Bolum
            sira={bolumler.length + 1}
            baslik="Kayıt"
            aciklama="Kayıt numarası merkezi sistem tarafından üretilir; elle yazılamaz.">
            
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium text-foreground">Üretilecek kayıt numarası</p>
                  <p className="mt-1 font-mono text-sm text-primary">{kayitNoOnizleme || '—'}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Kayıt numarası sistem tarafından otomatik ve benzersiz üretilir. Aynı kayıt
                    numarası ikinci kez oluşmaz. Çevrim dışı makbuz üretimi yapılmaz.
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
                    {!makbuzYetkiTamam ?
                'Bu kayıtta makbuz anlık üretildiği için makbuz üretme yetkisi gereklidir.' :
                form.bent === 'D' && !dosya ?
                'Kayıt oluşturmak için dijital dekont dosyası yüklenmelidir.' :
                'Kayıt için başvuru kaynağı, rapor/operasyon bilgileri, hesaplama alanları, dekont bilgileri, dijital dekont dosyası ve hesaplanan tutarla eşleşen ödeme tamamlanmalıdır.'}
                  </p>
              }
              </div>
            </Bolum>
          }
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">İşlem özeti</p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Bent</dt>
                <dd className="text-foreground">
                  {form.bent ?
                  `${form.bent}${
                  form.fAltTur ? ` · ${trafik ? 'Trafik' : 'Adli'}` : ''}` :

                  '—'}
                </dd>
              </div>
              {form.bent &&
              <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Kaynak</dt>
                  <dd className="max-w-[60%] truncate text-right text-foreground">
                    {talepEdenAdi || '—'}
                  </dd>
                </div>
              }
              {raporBolumuVar &&
              <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Rapor sayısı</dt>
                  <dd className="text-foreground">{raporSayisi}</dd>
                </div>
              }
              {form.operasyonTarihi &&
              <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Operasyon tarihi</dt>
                  <dd className="text-foreground">{formatTarih(form.operasyonTarihi)}</dd>
                </div>
              }
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Hesaplanan tutar</dt>
                <dd className="font-medium text-foreground">
                  {formatTL(sonuc.tutar)}
                </dd>
              </div>
              {(dekontBolumuGorunur || odenen > 0) &&
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
                Ana kayıt TTRF serisinde açılır; {raporSayisi} rapor tek ana kayda bağlanır. Ödeme,
                dekont ve makbuz yalnızca ana kayda işlenir.
              </p>
            </div>
          }

        </aside>
      </div>

    </div>);

}