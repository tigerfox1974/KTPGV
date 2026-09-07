import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  AjandaDurumu,
  AjandaKaydi,
  AuditKaydi,
  BentKodu,
  Birim,
  Islem,
  Isletmeci,
  KrediHareketi,
  Kullanici,
  MaliYilArsivi,
  SigortaSirketi,
  TasOcagi
} from '../types';
import { repository } from '../services/repository';
import type {
  GerceklesmeGirdisi,
  GerceklesmeSonucu,
  GirisSonucu,
  IslemSonucu,
  KrediOzeti,
  KrediYuklemeDekontKaydiGirdisi,
  MakbuzUretimSonucu,
  OdemeDogrulamaSonucu,
  PlanGirdisi,
  PlanSonucu,
  YeniIslemGirdisi,
  YeniIslemSonucu,
  SonucGirdisi
} from '../services/repository';
import { islemBagisMakbuzlariniOku } from '../utils/krediYukleme';
import { patlatmaBedeli } from '../utils/hesaplama';
import {
  ajandaIslemiYapilabilirMi,
  ajandaKaydiGorulebilirMi,
  auditKaydiGorulebilirMi,
  ekranGorulebilirMi,
  islemDegistirilebilirMi,
  islemGorulebilirMi,
  kullaniciDenetciMi,
  kullaniciMaliVeriGorebilir,
  kullaniciMerkezAdminMi,
  kullaniciTumVeriGorebilir,
  makbuzUretilebilirMi,
  maliKayitGorulebilirMi,
  maliKayitMi,
  odemeDogrulanabilirMi,
  yonetimEkraniGorulebilirMi
} from '../utils/yetki';

export type {
  GerceklesmeGirdisi,
  GerceklesmeSonucu,
  GirisSonucu,
  IslemSonucu,
  KrediOzeti,
  KrediYuklemeDekontKaydiGirdisi,
  MakbuzUretimSonucu,
  OdemeDogrulamaSonucu,
  PlanGirdisi,
  PlanSonucu,
  YeniIslemGirdisi,
  YeniIslemSonucu,
  SonucGirdisi
};

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
  kullaniciYonetimiYetkisi: boolean;
  birimYonetimiYetkisi: boolean;
  /** Menü gizlemek yetmez; route/ekran erişimi de bu fonksiyonla korunur. */
  ekranGorulebilir: (menuId: string) => boolean;
  merkezAdminMi: boolean;
  denetciMi: boolean;
  tumVeriGorebilir: boolean;
  maliVeriGorebilir: boolean;
  /** Aktif kullanıcının görebileceği işlem kayıtları. */
  gorunurIslemler: Islem[];
  /** Aktif kullanıcının görebileceği mali kayıtlar (ödeme doğuran kayıtlar). */
  gorunurMaliKayitlar: Islem[];
  gorunurAjanda: AjandaKaydi[];
  gorunurAuditKayitlari: AuditKaydi[];
  islemGorulebilir: (islem: Islem) => boolean;
  maliKayitGorulebilir: (islem: Islem) => boolean;
  ajandaKaydiGorulebilir: (kayit: AjandaKaydi) => boolean;
  islemDegistirilebilir: (islem: Islem) => boolean;
  makbuzUretilebilir: (islem: Islem) => boolean;
  odemeDogrulanabilir: (islem: Islem) => boolean;
  ajandaIslemiYapilabilir: (kayit: AjandaKaydi) => boolean;
  islemBul: (kayitNo?: string) => Islem | undefined;
  bau: number;
  bauGuncelle: (deger: number) => void;
  islemler: Islem[];
  islemEkle: (islem: Islem) => void;
  islemOlustur: (girdi: YeniIslemGirdisi) => YeniIslemSonucu;
  makbuzUret: (islemId: string) => MakbuzUretimSonucu;
  odemeDogrula: (islemId: string, dekontId?: string) => OdemeDogrulamaSonucu;
  krediYuklemeDekontEkle: (islemId: string, girdi: KrediYuklemeDekontKaydiGirdisi) => IslemSonucu;
  ajanda: AjandaKaydi[];
  ajandaEkle: (kayit: AjandaKaydi) => void;
  ajandaDurumGuncelle: (id: string, durum: AjandaDurumu) => void;
  auditKayitlari: AuditKaydi[];
  auditEkle: (eylem: string, hedef: string) => void;
  krediHareketleri: KrediHareketi[];
  krediHareketiEkle: (hareket: KrediHareketi) => void;
  krediOzeti: (isletmeciId: string) => KrediOzeti;
  /** Patlatma planlar (EKPL). Kredi bu aşamada düşülmez. */
  patlatmaPlanla: (girdi: PlanGirdisi) => PlanSonucu;
  /** “Yapıldı” sonucunu işler; kredi düşümü SADECE burada yapılır (EKGR). */
  patlatmaGerceklesmeIsle: (girdi: GerceklesmeGirdisi) => GerceklesmeSonucu;
  /** Yapılmadı / Ertelendi / İptal sonucunu işler; kredi düşülmez. */
  patlatmaSonucIsle: (girdi: SonucGirdisi) => {basarili: boolean;mesaj?: string;};
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

export function AppProvider({
  children,
  baslangicKullanicisi = null
}: {children: React.ReactNode;baslangicKullanicisi?: Kullanici | null;}) {
  // --- Reaktif ayna (mirror) durumu ----------------------------------------
  // Gerçek veri, doğrulama, yetki denetimi ve numaralandırma `repository`
  // (bkz. src/services/repository) içinde tutulur/uygulanır. Bu state'ler
  // yalnızca React render'ının tetiklenmesi için repository anlık görüntüsünü
  // yansıtır; iş kuralı burada uygulanmaz.
  const [kullanici, setKullanici] = useState<Kullanici | null>(baslangicKullanicisi);
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>(() => repository.kullanicilariGetir());
  const [birimler, setBirimler] = useState<Birim[]>(() => repository.birimleriGetir());
  const [bau, setBau] = useState<number>(() => repository.bauGetir());
  const [islemler, setIslemler] = useState<Islem[]>(() => repository.islemleriGetir());
  const [ajanda, setAjanda] = useState<AjandaKaydi[]>(() => repository.ajandaGetir());
  const [auditKayitlari, setAuditKayitlari] = useState<AuditKaydi[]>(() => repository.auditGetir());
  const [krediHareketleri, setKrediHareketleri] = useState<KrediHareketi[]>(() =>
  repository.krediHareketleriGetir()
  );
  const [arsivler, setArsivler] = useState<MaliYilArsivi[]>(() => repository.arsivleriGetir());
  const [sigortalar, setSigortalar] = useState<SigortaSirketi[]>(() => repository.sigortalariGetir());
  const [isletmeciler, setIsletmeciler] = useState<Isletmeci[]>(() => repository.isletmecileriGetir());
  const [tasOcaklari, setTasOcaklari] = useState<TasOcagi[]>(() => repository.tasOcaklariniGetir());
  const birimKrediBedeli = useMemo(() => patlatmaBedeli(bau), [bau]);

  /** Bir yazma işleminden sonra ilgili mirror state'leri repository'den tazeler. */
  const islemVeKrediyiTazele = useCallback(() => {
    setIslemler(repository.islemleriGetir());
    setKrediHareketleri(repository.krediHareketleriGetir());
    setAjanda(repository.ajandaGetir());
    setAuditKayitlari(repository.auditGetir());
  }, []);

  const auditEkle = useCallback(
    (eylem: string, hedef: string) => {
      repository.auditYaz(kullanici, eylem, hedef);
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const giris = useCallback((kullaniciAdi: string, sifre: string): GirisSonucu => {
    const sonuc = repository.girisYap(kullaniciAdi, sifre);
    if (sonuc.basarili && sonuc.kullanici) {
      setKullanici(sonuc.kullanici);
      setAuditKayitlari(repository.auditGetir());
    }
    return { basarili: sonuc.basarili, mesaj: sonuc.mesaj };
  }, []);

  const cikis = useCallback(() => setKullanici(null), []);

  const kullaniciKaydet = useCallback(
    (hedef: Kullanici) => {
      const sonuc = repository.kullaniciKaydet(kullanici, hedef);
      if (sonuc.basarili) {
        const guncelKullanicilar = repository.kullanicilariGetir();
        setKullanicilar(guncelKullanicilar);
        if (kullanici?.id === hedef.id) {
          const guncelAktif = guncelKullanicilar.find((k) => k.id === hedef.id);
          if (guncelAktif) setKullanici(guncelAktif);
        }
        setAuditKayitlari(repository.auditGetir());
      }
      return sonuc;
    },
    [kullanici]
  );

  const kullaniciAktiflikDegistir = useCallback(
    (id: string, aktif: boolean) => {
      repository.kullaniciAktiflikDegistir(kullanici, id, aktif);
      setKullanicilar(repository.kullanicilariGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const sifreSifirla = useCallback(
    (id: string, yeniSifre: string) => {
      repository.sifreSifirla(kullanici, id, yeniSifre);
      setKullanicilar(repository.kullanicilariGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const birimBul = useCallback((id?: string) => birimler.find((b) => b.id === id), [birimler]);

  const birimKullanicilari = useCallback(
    (birimId: string) => kullanicilar.filter((k) => k.birimId === birimId),
    [kullanicilar]
  );

  const birimKaydet = useCallback(
    (birim: Birim) => {
      const sonuc = repository.birimKaydet(kullanici, birim);
      if (sonuc.basarili) {
        setBirimler(repository.birimleriGetir());
        setAuditKayitlari(repository.auditGetir());
      }
      return sonuc;
    },
    [kullanici]
  );

  const birimAktiflikDegistir = useCallback(
    (id: string, aktif: boolean) => {
      repository.birimAktiflikDegistir(kullanici, id, aktif);
      setBirimler(repository.birimleriGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const bauGuncelle = useCallback(
    (deger: number) => {
      repository.bauGuncelle(kullanici, deger);
      setBau(repository.bauGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const islemEkle = useCallback(
    (islem: Islem) => {
      repository.islemEkle(kullanici, islem);
      setIslemler(repository.islemleriGetir());
    },
    [kullanici]
  );

  const islemOlustur = useCallback(
    (girdi: YeniIslemGirdisi): YeniIslemSonucu => {
      const sonuc = repository.islemOlustur(kullanici, girdi);
      if (sonuc.basarili) islemVeKrediyiTazele();
      return sonuc;
    },
    [kullanici, islemVeKrediyiTazele]
  );

  const islemBul = useCallback(
    (kayitNo?: string) => islemler.find((i) => i.kayitNo === kayitNo || i.id === kayitNo),
    [islemler]
  );

  const makbuzUret = useCallback(
    (islemId: string): MakbuzUretimSonucu => {
      const sonuc = repository.makbuzUret(kullanici, islemId);
      if (sonuc.basarili) islemVeKrediyiTazele();
      return sonuc;
    },
    [kullanici, islemVeKrediyiTazele]
  );

  const odemeDogrula = useCallback(
    (islemId: string, dekontId?: string): OdemeDogrulamaSonucu => {
      const sonuc = repository.odemeDogrula(kullanici, islemId, dekontId);
      if (sonuc.basarili) islemVeKrediyiTazele();
      return sonuc;
    },
    [kullanici, islemVeKrediyiTazele]
  );

  const krediYuklemeDekontEkle = useCallback(
    (islemId: string, girdi: KrediYuklemeDekontKaydiGirdisi): IslemSonucu => {
      const sonuc = repository.krediYuklemeDekontEkle(kullanici, islemId, girdi);
      if (sonuc.basarili) islemVeKrediyiTazele();
      return sonuc;
    },
    [kullanici, islemVeKrediyiTazele]
  );

  const ajandaEkle = useCallback(
    (kayit: AjandaKaydi) => {
      repository.ajandaEkle(kullanici, kayit);
      setAjanda(repository.ajandaGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const ajandaDurumGuncelle = useCallback(
    (id: string, durum: AjandaDurumu) => {
      repository.ajandaDurumGuncelle(kullanici, id, durum);
      setAjanda(repository.ajandaGetir());
    },
    [kullanici]
  );

  const krediHareketiEkle = useCallback(
    (hareket: KrediHareketi) => {
      repository.krediHareketiEkle(kullanici, hareket);
      setKrediHareketleri(repository.krediHareketleriGetir());
    },
    [kullanici]
  );

  const krediOzeti = useCallback(
    (isletmeciId: string): KrediOzeti => repository.krediOzetiHesapla(isletmeciId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [islemler, krediHareketleri, birimKrediBedeli]
  );

  const patlatmaPlanla = useCallback(
    (girdi: PlanGirdisi): PlanSonucu => {
      const sonuc = repository.patlatmaPlanla(kullanici, girdi);
      if (sonuc.basarili) islemVeKrediyiTazele();
      return sonuc;
    },
    [kullanici, islemVeKrediyiTazele]
  );

  const patlatmaSonucIsle = useCallback(
    (girdi: SonucGirdisi) => {
      const sonuc = repository.patlatmaSonucIsle(kullanici, girdi);
      if (sonuc.basarili) islemVeKrediyiTazele();
      return sonuc;
    },
    [kullanici, islemVeKrediyiTazele]
  );

  const patlatmaGerceklesmeIsle = useCallback(
    (girdi: GerceklesmeGirdisi): GerceklesmeSonucu => {
      const sonuc = repository.patlatmaGerceklesmeIsle(kullanici, girdi);
      islemVeKrediyiTazele();
      return sonuc;
    },
    [kullanici, islemVeKrediyiTazele]
  );

  const sigortaBul = useCallback(
    (id?: string) => sigortalar.find((s) => s.id === id),
    [sigortalar]
  );

  const sigortaKaydet = useCallback(
    (sirket: SigortaSirketi) => {
      repository.sigortaKaydet(kullanici, sirket);
      setSigortalar(repository.sigortalariGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const isletmeciBul = useCallback(
    (id?: string) => isletmeciler.find((i) => i.id === id),
    [isletmeciler]
  );

  const isletmeciKaydet = useCallback(
    (isletmeci: Isletmeci) => {
      repository.isletmeciKaydet(kullanici, isletmeci);
      setIsletmeciler(repository.isletmecileriGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const tasOcagiBul = useCallback(
    (id?: string) => tasOcaklari.find((t) => t.id === id),
    [tasOcaklari]
  );

  const tasOcagiKaydet = useCallback(
    (ocak: TasOcagi) => {
      repository.tasOcagiKaydet(kullanici, ocak);
      setTasOcaklari(repository.tasOcaklariniGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const manifestOlustur = useCallback(
    (yil: number) => {
      repository.manifestOlustur(kullanici, yil);
      setArsivler(repository.arsivleriGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const arsivDogrula = useCallback(
    (yil: number) => {
      repository.arsivDogrula(kullanici, yil);
      setArsivler(repository.arsivleriGetir());
      setAuditKayitlari(repository.auditGetir());
    },
    [kullanici]
  );

  const menuGorunur = useCallback(
    (menuId: string) => !!kullanici?.menuler.includes(menuId),
    [kullanici]
  );

  const bentKullanilabilir = useCallback(
    (bent: BentKodu) => !!kullanici && !kullanici.sadeceGoruntule && kullanici.bentler.includes(bent),
    [kullanici]
  );

  // --- Merkezi yetki katmanı (UI görünürlük/filtreleme; yazma denetimi repository'dedir) ---
  const merkezAdminMi = kullaniciMerkezAdminMi(kullanici);
  const denetciMi = kullaniciDenetciMi(kullanici);
  const tumVeriGorebilir = kullaniciTumVeriGorebilir(kullanici);
  const maliVeriGorebilir = kullaniciMaliVeriGorebilir(kullanici);

  const ekranGorulebilir = useCallback(
    (menuId: string) => ekranGorulebilirMi(kullanici, menuId),
    [kullanici]
  );
  const kullaniciYonetimiYetkisi = yonetimEkraniGorulebilirMi(kullanici, 'kullanici-yonetimi');
  const birimYonetimiYetkisi = yonetimEkraniGorulebilirMi(kullanici, 'birim-yonetimi');
  const yonetimYetkisi = kullaniciYonetimiYetkisi || birimYonetimiYetkisi;

  const islemGorulebilir = useCallback(
    (islem: Islem) => islemGorulebilirMi(kullanici, islem),
    [kullanici]
  );
  const maliKayitGorulebilir = useCallback(
    (islem: Islem) => maliKayitGorulebilirMi(kullanici, islem),
    [kullanici]
  );
  const ajandaKaydiGorulebilir = useCallback(
    (kayit: AjandaKaydi) => ajandaKaydiGorulebilirMi(kullanici, kayit),
    [kullanici]
  );
  const islemDegistirilebilir = useCallback(
    (islem: Islem) => islemDegistirilebilirMi(kullanici, islem),
    [kullanici]
  );
  const makbuzUretilebilir = useCallback(
    (islem: Islem) => makbuzUretilebilirMi(kullanici, islem),
    [kullanici]
  );
  const odemeDogrulanabilir = useCallback(
    (islem: Islem) => odemeDogrulanabilirMi(kullanici, islem),
    [kullanici]
  );
  const ajandaIslemiYapilabilir = useCallback(
    (kayit: AjandaKaydi) => ajandaIslemiYapilabilirMi(kullanici, kayit),
    [kullanici]
  );

  const gorunurIslemler = useMemo(
    () => islemler.filter((i) => islemGorulebilirMi(kullanici, i)),
    [islemler, kullanici]
  );
  const gorunurMaliKayitlar = useMemo(
    () => gorunurIslemler.filter(maliKayitMi),
    [gorunurIslemler]
  );
  const gorunurAjanda = useMemo(
    () => ajanda.filter((a) => ajandaKaydiGorulebilirMi(kullanici, a)),
    [ajanda, kullanici]
  );
  const gorunurAuditKayitlari = useMemo(() => {
    const numaralar = new Set<string>();
    gorunurIslemler.forEach((i) => {
      numaralar.add(i.kayitNo);
      if (i.makbuzNo) numaralar.add(i.makbuzNo);
      islemBagisMakbuzlariniOku(i, birimKrediBedeli).forEach((makbuz) => {
        if (makbuz.makbuzNo) numaralar.add(makbuz.makbuzNo);
      });
      i.altBasvurular?.forEach((alt) => numaralar.add(alt.no));
      i.adliRaporlar?.forEach((r) => numaralar.add(r.no));
    });
    return auditKayitlari.filter((a) => auditKaydiGorulebilirMi(kullanici, a, numaralar));
  }, [auditKayitlari, gorunurIslemler, kullanici, birimKrediBedeli]);

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
      kullaniciYonetimiYetkisi,
      birimYonetimiYetkisi,
      ekranGorulebilir,
      merkezAdminMi,
      denetciMi,
      tumVeriGorebilir,
      maliVeriGorebilir,
      gorunurIslemler,
      gorunurMaliKayitlar,
      gorunurAjanda,
      gorunurAuditKayitlari,
      islemGorulebilir,
      maliKayitGorulebilir,
      ajandaKaydiGorulebilir,
      islemDegistirilebilir,
      makbuzUretilebilir,
      odemeDogrulanabilir,
      ajandaIslemiYapilabilir,
      islemBul,
      bau,
      bauGuncelle,
      islemler,
      islemEkle,
      islemOlustur,
      makbuzUret,
      odemeDogrula,
      krediYuklemeDekontEkle,
      ajanda,
      ajandaEkle,
      ajandaDurumGuncelle,
      auditKayitlari,
      auditEkle,
      krediHareketleri,
      krediHareketiEkle,
      krediOzeti,
      patlatmaPlanla,
      patlatmaGerceklesmeIsle,
      patlatmaSonucIsle,
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
    kullaniciYonetimiYetkisi,
    birimYonetimiYetkisi,
    ekranGorulebilir,
    merkezAdminMi,
    denetciMi,
    tumVeriGorebilir,
    maliVeriGorebilir,
    gorunurIslemler,
    gorunurMaliKayitlar,
    gorunurAjanda,
    gorunurAuditKayitlari,
    islemGorulebilir,
    maliKayitGorulebilir,
    ajandaKaydiGorulebilir,
    islemDegistirilebilir,
    makbuzUretilebilir,
    odemeDogrulanabilir,
    ajandaIslemiYapilabilir,
    islemBul,
    bau,
    bauGuncelle,
    islemler,
    islemEkle,
    islemOlustur,
    makbuzUret,
    odemeDogrula,
    krediYuklemeDekontEkle,
    ajanda,
    ajandaEkle,
    ajandaDurumGuncelle,
    auditKayitlari,
    auditEkle,
    krediHareketleri,
    krediHareketiEkle,
    krediOzeti,
    patlatmaPlanla,
    patlatmaGerceklesmeIsle,
    patlatmaSonucIsle,
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
