import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  AjandaDurumu,
  AjandaKaydi,
  AuditKaydi,
  BentKodu,
  Islem,
  Isletmeci,
  KrediHareketi,
  Kullanici,
  MaliYilArsivi,
  SigortaSirketi,
  TasOcagi } from
'../types';
import { kullanicilar } from '../data/kullanicilar';
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
import { sonrakiMakbuzNo } from '../utils/numaralandirma';
import { VARSAYILAN_BAU } from '../utils/hesaplama';
import { formatTL } from '../utils/currency';

export interface KrediOzeti {
  /** Ödemesi alınan toplam kredi */
  yuklenen: number;
  /** Ödeme doğrulanmış / makbuzu kesilmiş, kullanıma hazır kredi */
  kullanilabilir: number;
  /** Patlatmalarda harcanan kredi */
  kullanilan: number;
  /** Kullanılabilir - kullanılan */
  kalan: number;
  /** Ödeme doğrulaması veya makbuz bekleyen, henüz kullanılamayan kredi */
  dogrulamaBekleyen: number;
}

const DOGRULANMIS_DURUMLAR = ['ODEME_DOGRULANDI', 'ISLEM_BASLATILABILIR', 'TAMAMLANDI'];

interface AppContextDegeri {
  kullanici: Kullanici | null;
  giris: (kullaniciAdi: string, sifre: string) => boolean;
  cikis: () => void;
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
    (kullaniciAdi: string, sifre: string) => {
      const bulunan = kullanicilar.find(
        (k) => k.kullaniciAdi === kullaniciAdi.trim().toLowerCase() && k.sifre === sifre
      );
      if (!bulunan) return false;
      setKullanici(bulunan);
      auditYaz(bulunan.adSoyad, 'Giriş yapıldı', `${bulunan.kullaniciAdi} · ${bulunan.birim}`);
      return true;
    },
    [auditYaz]
  );

  const cikis = useCallback(() => setKullanici(null), []);

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
      const kullanilan = hareketler.
      filter((h) => h.tip === 'KULLANIM').
      reduce((t, h) => t + h.adet, 0);
      const kullanilabilir = yuklenen - dogrulamaBekleyen;
      return {
        yuklenen,
        kullanilabilir,
        kullanilan,
        kalan: kullanilabilir - kullanilan,
        dogrulamaBekleyen
      };
    },
    [krediHareketleri, islemler]
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