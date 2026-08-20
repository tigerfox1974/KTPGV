import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { BosDurum } from '../components/common/BosDurum';
import { KuralNotu } from '../components/common/KuralNotu';
import { BilgiRozeti } from '../components/common/DurumRozeti';
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
import {
  PatlatmaBaslangici,
  PatlatmaYapildiModali } from
'../components/tasocagi/PatlatmaYapildiModali';
import { bentler } from '../data/bentler';
import { useApp } from '../contexts/AppContext';
import { AdliRapor, BentKodu, DekontDosyasi, FazlaOdemeDurumu, Islem, TrafikAltBasvuru } from '../types';
import { hesapla, patlatmaBedeli, raporBedeli } from '../utils/hesaplama';
import { altBasvuruNo, sonrakiKayitNo } from '../utils/numaralandirma';
import { formatTL, formatTarih, formatTarihSaat } from '../utils/currency';

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

/** Bent seçildiğinde gelen en düşük geçerli değerler — placeholder değil, gerçek form değeri. */
function bentVarsayilanlari(bent: BentKodu): Partial<IslemFormu> {
  if (bent === 'C' || bent === 'Ç') return { adet: '1' };
  if (bent === 'D') return { polisSayisi: '1', gorevSuresi: '1' };
  if (bent === 'E') return { krediAdedi: '1' };
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
    islemEkle,
    ajanda,
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
  const [trafikSatirlari, setTrafikSatirlari] = useState<TrafikAltBasvuru[]>([]);
  const [adliSatirlari, setAdliSatirlari] = useState<AdliRapor[]>([]);
  const [sonKayit, setSonKayit] = useState<Islem | null>(null);
  const [raporBaslangici, setRaporBaslangici] = useState<PatlatmaBaslangici | null>(null);
  const [krediYuklemeYontemi, setKrediYuklemeYontemi] = useState<'ADET' | 'TUTAR'>('ADET');
  const [krediDekontTutari, setKrediDekontTutari] = useState<number | null>(null);
  const [fazlaOdemeDurumu, setFazlaOdemeDurumu] = useState<'KARAR_BEKLIYOR' | 'IADE_BEKLIYOR' | 'MAHSUP_BAKIYESI'>('KARAR_BEKLIYOR');
  const [mahsupKullan, setMahsupKullan] = useState(false);
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
      setKrediYuklemeYontemi('ADET');
      setKrediDekontTutari(null);
      setFazlaOdemeDurumu('KARAR_BEKLIYOR');
      setMahsupKullan(false);
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

  const krediYuklemeBirimKurus = Math.round(patlatmaBedeli(bau) * 100);

  const krediYuklemeYontemiDegistir = (yontem: 'ADET' | 'TUTAR') => {
    setKrediYuklemeYontemi(yontem);
    setDekont(BOS_DEKONT);
    setDosya(null);
    setFazlaOdemeDurumu('KARAR_BEKLIYOR');
    setMahsupKullan(false);
    if (yontem === 'ADET') {
      setKrediDekontTutari(null);
      setForm((eski) => ({ ...eski, krediAdedi: eski.krediAdedi || '1' }));
      return;
    }
    setForm((eski) => ({ ...eski, krediAdedi: '' }));
  };

  const krediDekontTutariDegistir = (tutar: number | null) => {
    setKrediDekontTutari(tutar);
    const tutarKurus = Math.round((tutar ?? 0) * 100);
    const krediAdedi =
    krediYuklemeBirimKurus > 0 && tutarKurus >= krediYuklemeBirimKurus ?
    Math.floor(tutarKurus / krediYuklemeBirimKurus) :
    0;
    setForm((eski) => ({ ...eski, krediAdedi: krediAdedi > 0 ? String(krediAdedi) : '' }));
    setDekont((eski) => ({ ...eski, odenenTutar: krediAdedi > 0 ? tutar : null }));
  };

  const trafik = form.bent === 'F' && form.fAltTur === 'TRAFIK';
  const adli = form.bent === 'F' && form.fAltTur === 'ADLI';
  const krediYukleme = form.bent === 'E' && form.eIslemTuru === 'KREDI_YUKLEME';
  const krediPlanlama = form.bent === 'E' && form.eIslemTuru === 'KREDI_PLANLAMA';
  const krediGerceklesme = form.bent === 'E' && form.eIslemTuru === 'KREDI_GERCEKLESME';
  const ozet = form.isletmeciId ? krediOzeti(form.isletmeciId) : null;
  const sigortaSirketi = sigortaBul(form.sigortaSirketiId);
  const isletmeci = isletmeciBul(form.isletmeciId);

  const otomatikKaynak = trafik || form.bent === 'E';
  const baslikGorunur = form.bent !== 'E';
  const raporBolumuVar = trafik || adli;
  const operasyonGorunur =
  !!form.bent && form.bent !== 'A' && form.bent !== 'B' && (krediPlanlama || form.bent !== 'E');
  // E bendinde dekont yalnızca kredi yüklemede istenir; planlama ve gerçekleşmede istenmez.
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

  const raporSayisi = trafik ? trafikSatirlari.length : adli ? adliSatirlari.length : 0;

  const sonuc = useMemo(
    () =>
    hesapla({
      bent: form.bent,
      fAltTur: form.fAltTur,
      bau,
      manuelTutar: form.manuelTutar ?? 0,
      adet: form.bent === 'F' ? raporSayisi : form.adet ? Number(form.adet) : 0,
      polisSayisi: form.polisSayisi ? Number(form.polisSayisi) : 0,
      gorevSuresi: form.gorevSuresi ? Number(form.gorevSuresi) : 0,
      krediAdedi: form.krediAdedi ? Number(form.krediAdedi) : 0
    }),
    [form, bau, raporSayisi]
  );

  const krediDekontKurus = Math.round((krediDekontTutari ?? 0) * 100);
  const krediDekonttanAdet =
  krediYuklemeBirimKurus > 0 && krediDekontKurus >= krediYuklemeBirimKurus ?
  Math.floor(krediDekontKurus / krediYuklemeBirimKurus) :
  0;
  const krediDekontTutariGecerli = krediYuklemeYontemi !== 'TUTAR' || krediDekonttanAdet > 0;
  const krediyeMahsupEdilenTutar = krediYukleme ? (Number(form.krediAdedi) || 0) * patlatmaBedeli(bau) : sonuc.tutar;
  const mahsupKullanilanTutar = krediYukleme && mahsupKullan && ozet ? Math.min(ozet.mahsuplasmaBakiyesi, krediyeMahsupEdilenTutar) : 0;
  const beklenenOdemeTutari = krediYuklemeYontemi === 'TUTAR' && krediYukleme ?
  krediDekontTutari ?? 0 :
  Math.max(0, sonuc.tutar - mahsupKullanilanTutar);
  const fazlaOdemeTutar = krediYuklemeYontemi === 'TUTAR' && krediYukleme ?
  Math.max(0, (krediDekontTutari ?? 0) - krediyeMahsupEdilenTutar) :
  0;

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

  const odenen = dekont.odenenTutar ?? 0;
  const tutarUyumlu = odenen > 0 && Math.abs(odenen - beklenenOdemeTutari) < 0.01;

  const dekontTamam =
  !!dosya &&
  dekont.dekontNo.trim() !== '' &&
  dekont.banka.trim() !== '' &&
  dekont.tarih !== '' &&
  dekont.odemeYapan.trim() !== '' &&
  tutarUyumlu;

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
      if (krediGerceklesme) return false;
      if (krediPlanlama) {
        return (
          !!form.tasOcagiId &&
          !!form.operasyonTarihi &&
          !!form.operasyonSaati &&
          Number(form.krediAdedi) > 0);

      }
  if (krediYukleme) return sonuc.gecerli && krediDekontTutariGecerli;
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
    if (form.bent === 'E') return !!form.eIslemTuru && !!form.isletmeciId;
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
    if (krediPlanlama) {
      return !!form.tasOcagiId && !!form.operasyonTarihi && !!form.operasyonSaati;
    }
    return true;
  })();

  const hesaplamaBolumuGorunur =
  !!form.bent &&
  !krediGerceklesme &&
  kaynakTamam &&
  raporTamam &&
  operasyonTamam;

  const hesaplamaOlustu =
  hesaplamaBolumuGorunur &&
  bentTamam &&
  (krediPlanlama || sonuc.gecerli && sonuc.tutar > 0);

  const dekontBolumuGorunur = dekontGorunur && hesaplamaOlustu && sonuc.tutar > 0;
  const notBolumuGorunur = !krediGerceklesme && hesaplamaOlustu;
  const kayitBolumuGorunur = !krediGerceklesme && (krediPlanlama ? hesaplamaOlustu : dekontTamam);

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
    setTrafikSatirlari([]);
    setAdliSatirlari([]);
    setKrediYuklemeYontemi('ADET');
    setKrediDekontTutari(null);
    setFazlaOdemeDurumu('KARAR_BEKLIYOR');
    setMahsupKullan(false);
  };

  const kaydet = () => {
    if (!kullanici || !kaydedilebilir) return;
    const bent = form.bent as BentKodu;
    const kayitNo = sonrakiKayitNo(islemler, bent, form.fAltTur, form.eIslemTuru);

    const altBasvurular: TrafikAltBasvuru[] | undefined = trafik ?
    trafikSatirlari.map((satir, i) => ({
      ...satir,
      no: altBasvuruNo(kayitNo, i + 1),
      raporTutari: raporBedeli(bau)
    })) :
    undefined;

    const adliRaporlar: AdliRapor[] | undefined = adli ?
    adliSatirlari.map((satir, i) => ({
      ...satir,
      no: altBasvuruNo(kayitNo, i + 1),
      raporTutari: raporBedeli(bau)
    })) :
    undefined;

    const baslikMetni = baslikGorunur ?
    form.baslik.trim() :
    krediYukleme ?
    `Patlatma kredisi yükleme — ${form.krediAdedi} kredi` :
    `Planlı patlatma — ${tasOcagiBul(form.tasOcagiId)?.ad ?? ''}`;

    const yeni: Islem = {
      id: `is-${Date.now()}`,
      kayitNo,
      bent,
      fAltTur: form.fAltTur || undefined,
      eIslemTuru: form.eIslemTuru || undefined,
      baslik: baslikMetni,
      talepEden: talepEdenAdi || '—',
      birim: kullanici.birim,
      olusturan: kullanici.rol,
      olusturmaTarihi: new Date().toISOString().slice(0, 10),
      operasyonTarihi: form.operasyonTarihi || undefined,
      operasyonSaati: form.operasyonSaati || undefined,
      yer: form.yer.trim() || undefined,
      etkinlikAdi: form.etkinlikAdi.trim() || undefined,
      polisSayisi: bent === 'D' ? Number(form.polisSayisi) : undefined,
      gorevSuresi: bent === 'D' ? Number(form.gorevSuresi) : undefined,
      tutar: krediPlanlama ? 0 : sonuc.tutar,
      hesaplamaAciklamasi: krediPlanlama ?
      'Patlatma planı — kredi henüz düşülmedi. Kredi düşümü patlatma “Yapıldı” olarak işlendiğinde yapılır.' :
      sonuc.satirlar.join(' · '),
      dekont: krediPlanlama ?
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
      durum: krediPlanlama ?
      'ISLEM_BASLATILABILIR' :
      krediYukleme ?
      'ODEME_BEKLIYOR' :
      'MAKBUZ_BEKLIYOR',
      sigortaSirketiId: trafik ? form.sigortaSirketiId : undefined,
      altBasvurular,
      adliRaporlar,
      isletmeciId: bent === 'E' ? form.isletmeciId : undefined,
      tasOcagiId: krediPlanlama ? form.tasOcagiId : undefined,
      krediAdedi: bent === 'E' ? Number(form.krediAdedi) : undefined,
      dekonttaOdenenTutar: krediYukleme ? odenen : undefined,
      krediyeMahsupEdilenTutar: krediYukleme ? krediyeMahsupEdilenTutar : undefined,
      fazlaOdemeTutar: krediYukleme && fazlaOdemeTutar > 0 ? fazlaOdemeTutar : undefined,
      fazlaOdemeDurumu: krediYukleme && fazlaOdemeTutar > 0 ? fazlaOdemeDurumu as FazlaOdemeDurumu : undefined,
      mahsupKullanilanTutar: krediYukleme && mahsupKullanilanTutar > 0 ? mahsupKullanilanTutar : undefined,
      notlar: form.notlar.trim() || undefined
    };

    islemEkle(yeni);
    auditEkle('Kayıt oluşturuldu', kayitNo);

    if (trafik) {
      auditEkle('Trafik ana TTRF oluşturuldu', `${kayitNo} · ${sigortaSirketi?.ad}`);
      if (altBasvurular && altBasvurular.length > 1) {
        altBasvurular.
        slice(1).
        forEach((alt) => auditEkle('Trafik ek rapor oluşturuldu', `${alt.no} · ${alt.plaka}`));
      }
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
      if (fazlaOdemeTutar > 0) {
        auditEkle(
          'Fazla ödeme kaydedildi',
          `${kayitNo} · ${formatTL(fazlaOdemeTutar)} · ${fazlaOdemeDurumu === 'IADE_BEKLIYOR' ? 'İade bekliyor' : fazlaOdemeDurumu === 'MAHSUP_BAKIYESI' ? 'Mahsup bakiyesi' : 'Karar bekliyor'}`
        );
      }
      if (mahsupKullanilanTutar > 0) {
        auditEkle('Fazla ödeme mahsup edildi', `${kayitNo} · ${formatTL(mahsupKullanilanTutar)}`);
      }
    }

    if (krediPlanlama) {
      krediHareketiEkle({
        id: `kh-${Date.now()}`,
        isletmeciId: form.isletmeciId,
        tip: 'PLAN',
        adet: Number(form.krediAdedi),
        kayitNo,
        tasOcagiId: form.tasOcagiId,
        tarih: form.operasyonTarihi,
        aciklama: `${
        tasOcagiBul(form.tasOcagiId)?.ad} — planlı patlatma, sonuç bekliyor. Kredi düşülmedi.`

      });
      auditEkle(
        'Patlatma planlandı',
        `${kayitNo} · ${tasOcagiBul(form.tasOcagiId)?.ad} · ${form.krediAdedi} kredi sonuç bekliyor`
      );
    }

    const ajandayaDuser =
    bent === 'C' || bent === 'Ç' || bent === 'D' || bent === 'F' || krediPlanlama;
    if (ajandayaDuser) {
      ajandaEkle({
        id: `aj-${Date.now()}`,
        kayitNo,
        bent,
        islemTuru: krediPlanlama ?
        'Patlatma planlama' :
        bent === 'F' ?
        `${trafik ? 'Trafik' : 'Adli'} polis raporu${
        raporSayisi > 1 ? ` (${raporSayisi} rapor)` : ''}` :

        bentler.find((b) => b.kod === bent)?.baslik ?? '',
        baslik: form.etkinlikAdi.trim() || yeni.baslik,
        talepEden: talepEdenAdi || '—',
        birim: kullanici.birim,
        tarih: form.operasyonTarihi,
        saat: form.operasyonSaati || '09:00',
        yer: krediPlanlama ? tasOcagiBul(form.tasOcagiId)?.ad ?? '—' : form.yer.trim() || '—',
        durum: krediPlanlama ? 'Sonuç Bekliyor' : 'Planlandı',
        odemeDurumu: krediPlanlama ?
        `Ön ödemeli kredi · ${form.krediAdedi} kredi planlandı, sonuç bekliyor` :
        `Ödeme alındı · Makbuz bekliyor · ${formatTL(yeni.tutar)}`,
        isletmeciId: krediPlanlama ? form.isletmeciId : undefined,
        tasOcagiId: krediPlanlama ? form.tasOcagiId : undefined,
        planlananAdet: krediPlanlama ? Number(form.krediAdedi) : undefined
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
  `${form.bent} bendi · ${talepEdenAdi || 'Başvuru sahibi'}` :
  'Yeni işlem';

  const talepEdenEtiketi =
  form.bent === 'B' ?
  'Talep eden / satış kaynağı / ilgili birim' :
  'Talep eden kişi / kurum';

  const bekleyenPlanlar = ajanda.filter(
    (a) =>
    a.bent === 'E' &&
    !!a.isletmeciId &&
    !a.gerceklesmeKayitNo &&
    a.durum !== 'İptal Edildi' &&
    a.durum !== 'Görev Tamamlandı' && (
    !form.isletmeciId || a.isletmeciId === form.isletmeciId)
  );

  const bentAlanProps = {
    form,
    guncelle,
    krediYuklemeYontemi,
    krediYuklemeYontemiDegistir,
    krediDekontTutari,
    krediDekontTutariDegistir,
    fazlaOdemeDurumu,
    fazlaOdemeDurumuDegistir: setFazlaOdemeDurumu,
    mahsupKullan,
    mahsupKullanDegistir: setMahsupKullan,
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
    adliKaldir
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
            setKrediYuklemeYontemi('ADET');
            setKrediDekontTutari(null);
            setFazlaOdemeDurumu('KARAR_BEKLIYOR');
            setMahsupKullan(false);
            setTrafikSatirlari([]);
            setAdliSatirlari([]);
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

  if (krediGerceklesme) {
    bolumler.push({
      baslik: 'Patlatma Sonucunu İşle',
      aciklama: 'Kredi düşümü yalnızca sonuç “Yapıldı” olarak işlendiğinde yapılır.',
      icerik:
      <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-foreground">
              Patlatma sonucu en pratik şekilde Patlatma Takvimi ekranındaki kart üzerinden işlenir.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/patlatma-takvimi')}>
              Patlatma Takvimine Git
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Detaylı işlem için sonuç bekleyen planlı patlatmalar aşağıda listelenir.
          </p>
          {bekleyenPlanlar.length ?
        <ul className="space-y-2">
              {bekleyenPlanlar.map((plan) =>
          <li
            key={plan.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
            
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{plan.kayitNo}</p>
                    <p className="text-sm font-medium text-foreground">{plan.baslik}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatTarihSaat(plan.tarih, plan.saat)} · Planlanan{' '}
                      {plan.planlananAdet ?? 1} kredi
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <BilgiRozeti metin={plan.durum} ton="uyari" />
                    <Button
                size="sm"
                onClick={() => {
                  const isletmeciId = plan.isletmeciId;
                  if (!isletmeciId) return;
                  setRaporBaslangici({
                    isletmeciId,
                    tasOcagiId: plan.tasOcagiId ?? '',
                    planKayitNo: plan.kayitNo,
                    ajandaId: plan.id,
                    tarih: plan.tarih,
                    saat: plan.saat,
                    adet: plan.planlananAdet ?? 1
                  });
                }}>
                
                      Yapıldı
                    </Button>
                  </div>
                </li>
          )}
            </ul> :

        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Sonuç bekleyen planlı patlatma bulunmuyor. Önce “Patlatma Planla” işlem türü ile plan
              oluşturun.
            </p>
        }
          <Button
          variant="outline"
          size="sm"
          onClick={() =>
          setRaporBaslangici({
            isletmeciId: form.isletmeciId,
            tasOcagiId: '',
            tarih: new Date().toISOString().slice(0, 10),
            saat: '10:00',
            adet: 1
          })
          }
          disabled={!form.isletmeciId}>
          
            Plan kaydı olmadan sonuç işle
          </Button>
        </div>

    });
  }

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
      aciklama: krediPlanlama ?
      'Planlanan kredi ve yeterlilik kontrolü — kredi bu aşamada düşmez.' :
      `Yasa 57/2026 Madde 6 · BAÜ: ${formatTL(bau)}`,
      icerik:
      <div className="space-y-4">
          <BentAlanlari bolum="hesaplama" {...bentAlanProps} />
          {!krediPlanlama && sonuc.gecerli && sonuc.tutar > 0 ?
        <HesaplamaKutusu sonuc={sonuc} /> :
        !krediPlanlama &&
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
      <DekontBolumu
        form={dekont}
        guncelle={dekontGuncelle}
        dosya={dosya}
        dosyaAta={setDosya}
        kaynakEtiketi={kaynakEtiketi}
        beklenenTutar={beklenenOdemeTutari}
        qrOdenecekTutarGoster={form.bent === 'D'}
        auditEkle={auditEkle} />


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
            {sonKayit.eIslemTuru === 'KREDI_PLANLAMA' ?
          ' Kredi düşümü, patlatma “Yapıldı” olarak işlendiğinde yapılacak.' :
          ' Makbuz süreci Ödeme / Makbuz ekranından yürütülür.'}
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
                    {krediPlanlama ?
                'Plan kaydı için işletmeci, taş ocağı, planlanan patlatma tarihi/saati ve planlanan adet girilmelidir.' :
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
                <dt className="text-muted-foreground">
                  {krediPlanlama ? 'Planlanan kredi' : 'Hesaplanan tutar'}
                </dt>
                <dd className="font-medium text-foreground">
                  {krediPlanlama ?
                  `${Number(form.krediAdedi) || 0} kredi` :
                  formatTL(sonuc.tutar)}
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

          {(krediPlanlama || krediGerceklesme) &&
          <KuralNotu baslik="Ödeme / dekont">
              Patlatma planlama ve sonuç kayıtlarında ödeme yeniden alınmaz; ödeme ve dekont
              işletmecinin kredi yükleme kaydında bulunur.
            </KuralNotu>
          }
        </aside>
      </div>

      <PatlatmaYapildiModali
        acik={!!raporBaslangici}
        kapat={() => setRaporBaslangici(null)}
        baslangic={raporBaslangici} />
      
    </div>);

}