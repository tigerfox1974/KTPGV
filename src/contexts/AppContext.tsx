import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  AjandaDurumu,
  AjandaKaydi,
  AuditKaydi,
  BentKodu,
  Birim,
  DekontDosyasi,
  Islem,
  Isletmeci,
  KrediHareketi,
  Kullanici,
  MaliYilArsivi,
  SigortaSirketi,
  TasOcagi } from
'../types';
import { kullanicilar as baslangicKullanicilari } from '../data/kullanicilar';
import { baslangicBirimleri } from '../data/birimler';
import { baslangicIslemleri } from '../data/islemler';
import { baslangicAjandasi } from '../data/ajanda';
import { baslangicAuditKayitlari } from '../data/auditLog';
import { sigortaSirketleri as baslangicSigortalari } from '../data/sigortaSirketleri';
import {
  isletmeciler as baslangicIsletmecileri,
  tasOcaklari as baslangicOcaklari,
  krediHareketleri as baslangicKredileri } from
'../data/tasOcagi';
import { maliYilArsivleri } from '../data/arsiv';
import { sonrakiKayitNo, sonrakiMakbuzNo } from '../utils/numaralandirma';
import { VARSAYILAN_BAU } from '../utils/hesaplama';
import { formatTL } from '../utils/currency';

export interface KrediOzeti {
  /** Ödemesi alınan toplam kredi */
  yuklenen: number;
  /** Ödeme doğrulanmış / makbuzu kesilmiş, kullanıma hazır kredi */
  kullanilabilir: number;
  /** Gerçekleşme raporu işlenmiş, fiilen düşülmüş kredi */
  kullanilan: number;
  /** Planlanmış ancak gerçekleşme raporu beklenen kredi (henüz düşülmedi) */
  planlanan: number;
  /** Kullanılabilir - kullanılan */
  kalan: number;
  /** Ödeme doğrulaması veya makbuz bekleyen, henüz kullanılamayan kredi */
  dogrulamaBekleyen: number;
}

export interface GerceklesmeGirdisi {
  isletmeciId: string;
  tasOcagiId: string;
  planKayitNo?: string;
  ajandaId?: string;
  tarih: string;
  saat: string;
  adet: number;
  raporNo: string;
  bildiren: string;
  aciklama: string;
  raporDosyasi?: DekontDosyasi | null;
}

export interface GerceklesmeSonucu {
  basarili: boolean;
  kayitNo?: string;
  mesaj?: string;
  oncekiKredi?: number;
  kalanKredi?: number;
}

const DOGRULANMIS_DURUMLAR = ['ODEME_DOGRULANDI', 'ISLEM_BASLATILABILIR', 'TAMAMLANDI'];

export interface GirisSonucu {
  basarili: boolean;
  mesaj?: string;
}

interface AppContextDegeri {
  kullanici: Kullanici | null;
  giris: (kullaniciAdi: string, sifre: string) => GirisSonucu;
  cikis: () => void;
  kullanicilar: Kullanici[];
  kullaniciKaydet: (kullanici: Kullanici) => {basarili: boolean;mesaj?: string;};
  kullaniciAktiflikDegistir: (id: string, aktif: boolean) => void;
  sifreSifirla: (id: string, yeniSifre: string) => void;
  birimler: Birim[];
  birimBul: (id?: string) => Birim | undefined;
  birimKaydet: (birim: Birim) => {basarili: boolean;mesaj?: string;};
  birimAktiflikDegistir: (id: string, aktif: boolean) => void;
  birimKullanicilari: (birimId: string) => Kullanici[];
  yonetimYetkisi: boolean;
  islemBul: (kayitNo?: string) => Islem | undefined;
  bau: number;
  bauGuncelle: (deger: number) => void;
  islemler: Islem[];
  islemEkle: (islem: Islem) => void;
  makbuzUret: (islemId: string) => string | null;
  odemeDogrula: (islemId: string) => void;
  ajanda: AjandaKaydi[];
  ajandaEkle: (kayit: AjandaKaydi) => void;
  ajandaDurumGuncelle: (id: string, durum: AjandaDurumu) => void;
  auditKayitlari: AuditKaydi[];
  auditEkle: (eylem: string, hedef: string) => void;
  krediHareketleri: KrediHareketi[];
  krediHareketiEkle: (hareket: KrediHareketi) => void;
  krediOzeti: (isletmeciId: string) => KrediOzeti;
  /** Patlatmanın yapıldığına dair raporu işler; kredi düşümü SADECE burada yapılır. */
  patlatmaGerceklesmeIsle: (girdi: GerceklesmeGirdisi) => GerceklesmeSonucu;
  sigortalar: SigortaSirketi[];
  sigortaBul: (id?: string) => SigortaSirketi | undefined;
  sigortaKaydet: (sirket: SigortaSirketi) => void;
  isletmeciler: Isletmeci[];
  isletmeciBul: (id?: string) => Isletmeci | undefined;
  isletmeciKaydet: (isletmeci: Isletmeci) => void;
  tasOcaklari: TasOcagi[];
  tasOcagiBul: (id?: string) => TasOcagi | undefined;
  tasOcagiKaydet: (ocak: TasOcagi) => void;
  arsivler: MaliYilArsivi[];
  manifestOlustur: (yil: number) => void;
  arsivDogrula: (yil: number) => void;
  menuGorunur: (menuId: string) => boolean;
  bentKullanilabilir: (bent: BentKodu) => boolean;
}

const AppContext = createContext<AppContextDegeri | null>(null);

function simdiEtiketi(): string {
  const d = new Date();
  const iki = (n: number) => n.toString().padStart(2, '0');
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} ${iki(
    d.getHours()
  )}:${iki(d.getMinutes())}`;
}

export function AppProvider({
  children,
  baslangicKullanicisi = null



}: {children: React.ReactNode;baslangicKullanicisi?: Kullanici | null;}) {
  const [kullanici, setKullanici] = useState<Kullanici | null>(baslangicKullanicisi);
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>(baslangicKullanicilari);
  const [birimler, setBirimler] = useState<Birim[]>(baslangicBirimleri);
  const [bau, setBau] = useState(VARSAYILAN_BAU);
  const [islemler, setIslemler] = useState<Islem[]>(baslangicIslemleri);
  const [ajanda, setAjanda] = useState<AjandaKaydi[]>(baslangicAjandasi);
  const [auditKayitlari, setAuditKayitlari] = useState<AuditKaydi[]>(baslangicAuditKayitlari);
  const [krediHareketleri, setKrediHareketleri] = useState<KrediHareketi[]>(baslangicKredileri);
  const [arsivler, setArsivler] = useState<MaliYilArsivi[]>(maliYilArsivleri);
  const [sigortalar, setSigortalar] = useState<SigortaSirketi[]>(baslangicSigortalari);
  const [isletmeciler, setIsletmeciler] = useState<Isletmeci[]>(baslangicIsletmecileri);
  const [tasOcaklari, setTasOcaklari] = useState<TasOcagi[]>(baslangicOcaklari);

  const auditYaz = useCallback((kullaniciAdi: string, eylem: string, hedef: string) => {
    setAuditKayitlari((eski) => [
    { id: `au-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, zaman: simdiEtiketi(), kullanici: kullaniciAdi, eylem, hedef },
    ...eski]
    );
  }, []);

  const auditEkle = useCallback(
    (eylem: string, hedef: string) => {
      auditYaz(kullanici?.adSoyad ?? 'Sistem', eylem, hedef);
    },
    [auditYaz, kullanici]
  );

  const giris = useCallback(
    (kullaniciAdi: string, sifre: string): GirisSonucu => {
      const bulunan = kullanicilar.find(
        (k) => k.kullaniciAdi === kullaniciAdi.trim().toLowerCase() && k.sifre === sifre
      );
      if (!bulunan) return { basarili: false, mesaj: 'Kullanıcı adı veya şifre hatalı.' };
      if (!bulunan.aktif) {
        return {
          basarili: false,
          mesaj: 'Bu kullanıcı pasif durumdadır ve giriş yapamaz. Merkez Admin ile iletişime geçin.'
        };
      }
      setKullanici(bulunan);
      auditYaz(bulunan.adSoyad, 'Giriş yapıldı', `${bulunan.kullaniciAdi} · ${bulunan.birim}`);
      return { basarili: true };
    },
    [auditYaz, kullanicilar]
  );

  const cikis = useCallback(() => setKullanici(null), []);

  const yonetimYetkisi = !!kullanici?.menuler.includes('kullanici-yonetimi');

  const kullaniciKaydet = useCallback(
    (hedef: Kullanici) => {
      const ad = hedef.kullaniciAdi.trim().toLowerCase();
      if (!ad) return { basarili: false, mesaj: 'Kullanıcı adı boş olamaz.' };
      if (!hedef.sifre.trim()) return { basarili: false, mesaj: 'Şifre boş olamaz.' };
      if (kullanicilar.some((k) => k.kullaniciAdi === ad && k.id !== hedef.id)) {
        return { basarili: false, mesaj: 'Bu kullanıcı adı zaten kullanılıyor.' };
      }
      const kayit = { ...hedef, kullaniciAdi: ad };
      const yeniMi = !kullanicilar.some((k) => k.id === hedef.id);
      setKullanicilar((eski) =>
      yeniMi ? [kayit, ...eski] : eski.map((k) => k.id === kayit.id ? kayit : k)
      );
      if (kullanici?.id === kayit.id) setKullanici(kayit);
      auditEkle(
        yeniMi ? 'Kullanıcı oluşturuldu' : 'Kullanıcı güncellendi',
        `${kayit.kullaniciAdi} · ${kayit.rol} · ${kayit.birim} · ${kayit.aktif ? 'Aktif' : 'Pasif'}`
      );
      return { basarili: true };
    },
    [kullanicilar, kullanici, auditEkle]
  );

  const kullaniciAktiflikDegistir = useCallback(
    (id: string, aktif: boolean) => {
      const hedef = kullanicilar.find((k) => k.id === id);
      setKullanicilar((eski) => eski.map((k) => k.id === id ? { ...k, aktif } : k));
      auditEkle(
        aktif ? 'Kullanıcı aktife alındı' : 'Kullanıcı pasife alındı',
        `${hedef?.kullaniciAdi ?? id} · ${hedef?.rol ?? ''}`
      );
    },
    [kullanicilar, auditEkle]
  );

  const sifreSifirla = useCallback(
    (id: string, yeniSifre: string) => {
      const hedef = kullanicilar.find((k) => k.id === id);
      setKullanicilar((eski) => eski.map((k) => k.id === id ? { ...k, sifre: yeniSifre } : k));
      auditEkle('Kullanıcı şifresi sıfırlandı', `${hedef?.kullaniciAdi ?? id}`);
    },
    [kullanicilar, auditEkle]
  );

  const birimBul = useCallback((id?: string) => birimler.find((b) => b.id === id), [birimler]);

  const birimKullanicilari = useCallback(
    (birimId: string) => kullanicilar.filter((k) => k.birimId === birimId),
    [kullanicilar]
  );

  const birimKaydet = useCallback(
    (birim: Birim) => {
      if (!birim.ad.trim()) return { basarili: false, mesaj: 'Birim adı boş olamaz.' };
      if (!birim.kod.trim()) return { basarili: false, mesaj: 'Birim kodu boş olamaz.' };
      if (birimler.some((b) => b.kod.toUpperCase() === birim.kod.trim().toUpperCase() && b.id !== birim.id)) {
        return { basarili: false, mesaj: 'Bu birim kodu zaten kullanılıyor.' };
      }
      const kayit = { ...birim, ad: birim.ad.trim(), kod: birim.kod.trim().toUpperCase() };
      const yeniMi = !birimler.some((b) => b.id === birim.id);
      setBirimler((eski) =>
      yeniMi ? [kayit, ...eski] : eski.map((b) => b.id === kayit.id ? kayit : b)
      );
      auditEkle(
        yeniMi ? 'Birim oluşturuldu' : 'Birim güncellendi',
        `${kayit.ad} (${kayit.kod}) · ${kayit.aktif ? 'Aktif' : 'Pasif'}`
      );
      return { basarili: true };
    },
    [birimler, auditEkle]
  );

  const birimAktiflikDegistir = useCallback(
    (id: string, aktif: boolean) => {
      const hedef = birimler.find((b) => b.id === id);
      setBirimler((eski) => eski.map((b) => b.id === id ? { ...b, aktif } : b));
      auditEkle(
        aktif ? 'Birim aktife alındı' : 'Birim pasife alındı',
        `${hedef?.ad ?? id} · Bağlı kullanıcı: ${kullanicilar.filter((k) => k.birimId === id).length}`
      );
    },
    [birimler, kullanicilar, auditEkle]
  );

  const bauGuncelle = useCallback(
    (deger: number) => {
      setBau(deger);
      auditEkle('BAÜ güncellendi', `Brüt asgari ücret: ${formatTL(deger)}`);
    },
    [auditEkle]
  );

  const islemEkle = useCallback((islem: Islem) => {
    setIslemler((eski) => [islem, ...eski]);
  }, []);

  const islemBul = useCallback(
    (kayitNo?: string) => islemler.find((i) => i.kayitNo === kayitNo || i.id === kayitNo),
    [islemler]
  );

  const makbuzUret = useCallback(
    (islemId: string) => {
      const hedef = islemler.find((i) => i.id === islemId);
      if (!hedef || hedef.makbuzNo) return null;
      const uretilen = sonrakiMakbuzNo(islemler);
      setIslemler((eski) =>
      eski.map((i) =>
      i.id === islemId ?
      {
        ...i,
        makbuzNo: uretilen,
        makbuzUreten: kullanici?.rol,
        durum: 'ISLEM_BASLATILABILIR' as const
      } :
      i
      )
      );
      if (hedef.eIslemTuru === 'KREDI_YUKLEME') {
        auditEkle(
          'Taş ocağı kredi kullanılabilir yapıldı',
          `${hedef.talepEden} · ${hedef.krediAdedi} kredi (makbuz ${uretilen})`
        );
      }
      return uretilen;
    },
    [islemler, kullanici, auditEkle]
  );

  const odemeDogrula = useCallback(
    (islemId: string) => {
      const hedef = islemler.find((i) => i.id === islemId);
      setIslemler((eski) =>
      eski.map((i) => i.id === islemId ? { ...i, durum: 'ODEME_DOGRULANDI' as const } : i)
      );
      if (hedef?.eIslemTuru === 'KREDI_YUKLEME') {
        auditEkle(
          'Taş ocağı kredi kullanılabilir yapıldı',
          `${hedef.talepEden} · ${hedef.krediAdedi} kredi (ödeme doğrulandı)`
        );
      }
    },
    [islemler, auditEkle]
  );

  const ajandaEkle = useCallback(
    (kayit: AjandaKaydi) => {
      setAjanda((eski) => [kayit, ...eski]);
      auditEkle('Ajanda kaydı oluşturuldu', `${kayit.kayitNo} · ${kayit.tarih} ${kayit.saat}`);
    },
    [auditEkle]
  );

  const ajandaDurumGuncelle = useCallback((id: string, durum: AjandaDurumu) => {
    setAjanda((eski) => eski.map((a) => a.id === id ? { ...a, durum } : a));
  }, []);

  const krediHareketiEkle = useCallback((hareket: KrediHareketi) => {
    setKrediHareketleri((eski) => [hareket, ...eski]);
  }, []);

  const krediOzeti = useCallback(
    (isletmeciId: string): KrediOzeti => {
      const hareketler = krediHareketleri.filter((h) => h.isletmeciId === isletmeciId);
      const yuklemeler = hareketler.filter((h) => h.tip === 'YUKLEME');
      const yuklenen = yuklemeler.reduce((t, h) => t + h.adet, 0);
      const dogrulamaBekleyen = yuklemeler.reduce((t, h) => {
        const kayit = islemler.find((i) => i.kayitNo === h.kayitNo);
        const dogrulandi =
        !kayit || !!kayit.makbuzNo || DOGRULANMIS_DURUMLAR.includes(kayit.durum);
        return dogrulandi ? t : t + h.adet;
      }, 0);
      const gerceklesmeler = hareketler.filter((h) => h.tip === 'KULLANIM');
      const kullanilan = gerceklesmeler.reduce((t, h) => t + h.adet, 0);
      const raporlananPlanlar = gerceklesmeler.
      map((h) => h.planKayitNo).
      filter((no): no is string => !!no);
      const planlanan = hareketler.
      filter((h) => h.tip === 'PLAN' && !raporlananPlanlar.includes(h.kayitNo)).
      reduce((t, h) => t + h.adet, 0);
      const kullanilabilir = yuklenen - dogrulamaBekleyen;
      return {
        yuklenen,
        kullanilabilir,
        kullanilan,
        planlanan,
        kalan: kullanilabilir - kullanilan,
        dogrulamaBekleyen
      };
    },
    [krediHareketleri, islemler]
  );

  const patlatmaGerceklesmeIsle = useCallback(
    (girdi: GerceklesmeGirdisi): GerceklesmeSonucu => {
      const ozet = krediOzeti(girdi.isletmeciId);
      if (girdi.adet <= 0) {
        return { basarili: false, mesaj: 'Gerçekleşen patlatma adedi sıfırdan büyük olmalıdır.' };
      }
      if (girdi.adet > ozet.kalan) {
        auditEkle(
          'Kredi yetersiz işlem engellendi',
          `${isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad ?? '—'} · gerçekleşme raporu ${
          girdi.raporNo || '—'} · talep ${
          girdi.adet} / kullanılabilir ${ozet.kalan}`
        );
        return {
          basarili: false,
          mesaj:
          'Kullanılabilir kredi yetersiz. Bu patlatma gerçekleşme raporu işlenmeden önce işletmeciye kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.'
        };
      }

      const isletmeciAdi = isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad ?? '—';
      const ocakAdi = tasOcaklari.find((t) => t.id === girdi.tasOcagiId)?.ad ?? '—';
      const kayitNo = sonrakiKayitNo(islemler, 'E', '', 'KREDI_GERCEKLESME');

      const kayit: Islem = {
        id: `is-${Date.now()}`,
        kayitNo,
        bent: 'E',
        eIslemTuru: 'KREDI_GERCEKLESME',
        baslik: `Patlatma gerçekleşme raporu — ${ocakAdi}`,
        talepEden: isletmeciAdi,
        birim: kullanici?.birim ?? 'KTPGV Taş Ocağı Birimi',
        olusturan: kullanici?.rol ?? 'Sistem',
        olusturmaTarihi: new Date().toISOString().slice(0, 10),
        operasyonTarihi: girdi.tarih,
        operasyonSaati: girdi.saat,
        yer: ocakAdi,
        tutar: 0,
        hesaplamaAciklamasi: `Gerçekleşme raporu işlendi. Önceki kullanılabilir kredi: ${ozet.kalan} · Düşülen: ${girdi.adet} · Kalan: ${ozet.kalan - girdi.adet}`,
        dekont: {
          dekontNo: 'Ön ödemeli kredi',
          banka: '—',
          tarih: '',
          odenenTutar: 0,
          odemeYapan: isletmeciAdi,
          dosya: null
        },
        makbuzNo: null,
        durum: 'TAMAMLANDI',
        isletmeciId: girdi.isletmeciId,
        tasOcagiId: girdi.tasOcagiId,
        krediAdedi: girdi.adet,
        planKayitNo: girdi.planKayitNo,
        raporNo: girdi.raporNo,
        bildiren: girdi.bildiren,
        raporDosyasi: girdi.raporDosyasi ?? null,
        notlar: girdi.aciklama || undefined
      };

      setIslemler((eski) => [kayit, ...eski]);
      setKrediHareketleri((eski) => [
      {
        id: `kh-${Date.now()}`,
        isletmeciId: girdi.isletmeciId,
        tip: 'KULLANIM',
        adet: girdi.adet,
        kayitNo,
        planKayitNo: girdi.planKayitNo,
        tasOcagiId: girdi.tasOcagiId,
        raporNo: girdi.raporNo,
        bildiren: girdi.bildiren,
        tarih: girdi.tarih,
        aciklama: `${ocakAdi} — patlatma gerçekleşme raporu işlendi, kredi düşüldü.`
      },
      ...eski]
      );

      if (girdi.ajandaId) {
        setAjanda((eski) =>
        eski.map((a) =>
        a.id === girdi.ajandaId ?
        {
          ...a,
          durum: 'Görev Tamamlandı' as const,
          raporNo: girdi.raporNo,
          gerceklesmeKayitNo: kayitNo,
          odemeDurumu: `Gerçekleşme raporu işlendi · ${girdi.adet} kredi düşüldü · Kalan ${
          ozet.kalan - girdi.adet}`

        } :
        a
        )
        );
      }

      auditEkle(
        'Patlatma gerçekleşme raporu işlendi',
        `${kayitNo} · ${ocakAdi} · Rapor ${girdi.raporNo || '—'}`
      );
      auditEkle(
        'Taş ocağı kredi kullanıldı',
        `${isletmeciAdi} · -${girdi.adet} kredi · Kalan ${ozet.kalan - girdi.adet}`
      );

      return {
        basarili: true,
        kayitNo,
        oncekiKredi: ozet.kalan,
        kalanKredi: ozet.kalan - girdi.adet
      };
    },
    [krediOzeti, islemler, isletmeciler, tasOcaklari, kullanici, auditEkle]
  );

  const sigortaBul = useCallback(
    (id?: string) => sigortalar.find((s) => s.id === id),
    [sigortalar]
  );

  const sigortaKaydet = useCallback(
    (sirket: SigortaSirketi) => {
      setSigortalar((eski) => {
        const varMi = eski.some((s) => s.id === sirket.id);
        return varMi ? eski.map((s) => s.id === sirket.id ? sirket : s) : [sirket, ...eski];
      });
      const yeniMi = !sigortalar.some((s) => s.id === sirket.id);
      auditEkle(
        yeniMi ? 'Sigorta şirketi kartı oluşturuldu' : 'Sigorta şirketi kartı güncellendi',
        `${sirket.ad} · ${sirket.aktif ? 'Aktif' : 'Pasif'}`
      );
    },
    [sigortalar, auditEkle]
  );

  const isletmeciBul = useCallback(
    (id?: string) => isletmeciler.find((i) => i.id === id),
    [isletmeciler]
  );

  const isletmeciKaydet = useCallback(
    (isletmeci: Isletmeci) => {
      setIsletmeciler((eski) => {
        const varMi = eski.some((i) => i.id === isletmeci.id);
        return varMi ? eski.map((i) => i.id === isletmeci.id ? isletmeci : i) : [isletmeci, ...eski];
      });
      const yeniMi = !isletmeciler.some((i) => i.id === isletmeci.id);
      auditEkle(
        yeniMi ?
        'Taş ocağı işletmeci kartı oluşturuldu' :
        'Taş ocağı işletmeci kartı güncellendi',
        `${isletmeci.ad} · ${isletmeci.tur === 'SAHIS' ? 'Şahıs' : 'Şirket'}`
      );
    },
    [isletmeciler, auditEkle]
  );

  const tasOcagiBul = useCallback(
    (id?: string) => tasOcaklari.find((t) => t.id === id),
    [tasOcaklari]
  );

  const tasOcagiKaydet = useCallback(
    (ocak: TasOcagi) => {
      setTasOcaklari((eski) => {
        const varMi = eski.some((t) => t.id === ocak.id);
        return varMi ? eski.map((t) => t.id === ocak.id ? ocak : t) : [ocak, ...eski];
      });
      const yeniMi = !tasOcaklari.some((t) => t.id === ocak.id);
      const isletmeciAdi = isletmeciler.find((i) => i.id === ocak.isletmeciId)?.ad ?? '—';
      auditEkle(
        yeniMi ? 'Taş ocağı kartı oluşturuldu' : 'Taş ocağı kartı güncellendi',
        `${ocak.ad} · Bağlı işletmeci: ${isletmeciAdi}`
      );
    },
    [tasOcaklari, isletmeciler, auditEkle]
  );

  const manifestOlustur = useCallback(
    (yil: number) => {
      const hash = `sha256:${Math.random().toString(16).slice(2, 14)}…${Math.random().
      toString(16).
      slice(2, 6)}`;
      setArsivler((eski) => eski.map((a) => a.yil === yil ? { ...a, manifestHash: hash } : a));
      auditEkle('Arşiv manifest simülasyonu oluşturuldu', `Mali Yıl ${yil}`);
    },
    [auditEkle]
  );

  const arsivDogrula = useCallback(
    (yil: number) => {
      setArsivler((eski) =>
      eski.map((a) => a.yil === yil ? { ...a, dogrulandi: true, durum: 'Arşivlendi' as const } : a)
      );
      auditEkle('Arşiv bütünlüğü doğrulandı', `Mali Yıl ${yil}`);
    },
    [auditEkle]
  );

  const menuGorunur = useCallback(
    (menuId: string) => !!kullanici?.menuler.includes(menuId),
    [kullanici]
  );

  const bentKullanilabilir = useCallback(
    (bent: BentKodu) => !!kullanici && !kullanici.sadeceGoruntule && kullanici.bentler.includes(bent),
    [kullanici]
  );

  const deger = useMemo<AppContextDegeri>(
    () => ({
      kullanici,
      giris,
      cikis,
      kullanicilar,
      kullaniciKaydet,
      kullaniciAktiflikDegistir,
      sifreSifirla,
      birimler,
      birimBul,
      birimKaydet,
      birimAktiflikDegistir,
      birimKullanicilari,
      yonetimYetkisi,
      islemBul,
      bau,
      bauGuncelle,
      islemler,
      islemEkle,
      makbuzUret,
      odemeDogrula,
      ajanda,
      ajandaEkle,
      ajandaDurumGuncelle,
      auditKayitlari,
      auditEkle,
      krediHareketleri,
      krediHareketiEkle,
      krediOzeti,
      patlatmaGerceklesmeIsle,
      sigortalar,
      sigortaBul,
      sigortaKaydet,
      isletmeciler,
      isletmeciBul,
      isletmeciKaydet,
      tasOcaklari,
      tasOcagiBul,
      tasOcagiKaydet,
      arsivler,
      manifestOlustur,
      arsivDogrula,
      menuGorunur,
      bentKullanilabilir
    }),
    [
    kullanici,
    giris,
    cikis,
    kullanicilar,
    kullaniciKaydet,
    kullaniciAktiflikDegistir,
    sifreSifirla,
    birimler,
    birimBul,
    birimKaydet,
    birimAktiflikDegistir,
    birimKullanicilari,
    yonetimYetkisi,
    islemBul,
    bau,
    bauGuncelle,
    islemler,
    islemEkle,
    makbuzUret,
    odemeDogrula,
    ajanda,
    ajandaEkle,
    ajandaDurumGuncelle,
    auditKayitlari,
    auditEkle,
    krediHareketleri,
    krediHareketiEkle,
    krediOzeti,
    patlatmaGerceklesmeIsle,
    sigortalar,
    sigortaBul,
    sigortaKaydet,
    isletmeciler,
    isletmeciBul,
    isletmeciKaydet,
    tasOcaklari,
    tasOcagiBul,
    tasOcagiKaydet,
    arsivler,
    manifestOlustur,
    arsivDogrula,
    menuGorunur,
    bentKullanilabilir]

  );

  return <AppContext.Provider value={deger}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextDegeri {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp, AppProvider içinde kullanılmalıdır.');
  return ctx;
}