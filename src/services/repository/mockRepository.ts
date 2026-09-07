import {
  AdliRapor,
  AjandaDurumu,
  AjandaKaydi,
  AuditKaydi,
  BagisMakbuzu,
  Birim,
  Dekont,
  Isletmeci,
  Islem,
  KrediHareketi,
  Kullanici,
  MaliYilArsivi,
  SigortaSirketi,
  TrafikAltBasvuru,
  TasOcagi
} from '../../types';
import { bentler } from '../../data/bentler';
import { kullanicilar as baslangicKullanicilari } from '../../data/kullanicilar';
import { baslangicBirimleri } from '../../data/birimler';
import { baslangicIslemleri } from '../../data/islemler';
import { baslangicAjandasi } from '../../data/ajanda';
import { baslangicAuditKayitlari } from '../../data/auditLog';
import { sigortaSirketleri as baslangicSigortalari } from '../../data/sigortaSirketleri';
import {
  isletmeciler as baslangicIsletmecileri,
  tasOcaklari as baslangicOcaklari,
  krediHareketleri as baslangicKredileri
} from '../../data/tasOcagi';
import { maliYilArsivleri as baslangicArsivleri } from '../../data/arsiv';
import { altBasvuruNo, sonrakiKayitNo, sonrakiMakbuzNo } from '../../utils/numaralandirma';
import { patlatmaBedeli, raporBedeli, VARSAYILAN_BAU } from '../../utils/hesaplama';
import { formatTL, formatTarihSaat } from '../../utils/currency';
import {
  ajandaIslemiYapilabilirMi,
  ekranGorulebilirMi,
  islemDegistirilebilirMi,
  kullaniciMerkezAdminMi,
  makbuzUretilebilirMi,
  odemeDogrulanabilirMi
} from '../../utils/yetki';
import {
  krediYuklemeDekontMukerrerliginiBul,
  krediYuklemeKaydiniCozumle,
  krediYuklemeDekontKimligi,
  islemBagisMakbuzlariniOku,
  islemDekontlariniOku
} from '../../utils/krediYukleme';
import type {
  GerceklesmeGirdisi,
  GerceklesmeSonucu,
  IslemSonucu,
  KayitSonucu,
  KimlikDogrulamaSonucu,
  KrediOzeti,
  KrediYuklemeDekontKaydiGirdisi,
  KtpgvRepository,
  MakbuzUretimSonucu,
  OdemeDogrulamaSonucu,
  PlanGirdisi,
  PlanSonucu,
  YeniIslemGirdisi,
  YeniIslemSonucu,
  SonucGirdisi
} from './types';

function simdiEtiketi(): string {
  const d = new Date();
  const iki = (n: number) => n.toString().padStart(2, '0');
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} · ${iki(
    d.getHours()
  )}:${iki(d.getMinutes())}`;
}

function benzersizId(onEk: string): string {
  return `${onEk}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

/**
 * Demo/prototip amaçlı bellek içi depo.
 *
 * `src/data/*` yalnız başlangıç (seed) verisi olarak kullanılır; gerçek çalışma
 * zamanı durumu bu sınıf içinde tutulur. Kimlik doğrulama, yetki denetimi,
 * kayıt/audit yazımı ve kayıt/makbuz numaralandırması burada, tek noktadan yönetilir.
 * Üretimde aynı `KtpgvRepository` sözleşmesini karşılayan bir Supabase uygulaması
 * bu sınıfın yerine geçebilir.
 */
export class MockKtpgvRepository implements KtpgvRepository {
  private kullanicilar: Kullanici[] = [...baslangicKullanicilari];
  private birimler: Birim[] = [...baslangicBirimleri];
  private islemler: Islem[] = [...baslangicIslemleri];
  private ajanda: AjandaKaydi[] = [...baslangicAjandasi];
  private auditKayitlari: AuditKaydi[] = [...baslangicAuditKayitlari];
  private krediHareketleri: KrediHareketi[] = [...baslangicKredileri];
  private sigortalar: SigortaSirketi[] = [...baslangicSigortalari];
  private isletmeciler: Isletmeci[] = [...baslangicIsletmecileri];
  private tasOcaklari: TasOcagi[] = [...baslangicOcaklari];
  private arsivler: MaliYilArsivi[] = [...baslangicArsivleri];
  private bau: number = VARSAYILAN_BAU;

  // --- Ortak yardımcılar ---------------------------------------------------

  private auditYazDahili(kullaniciAdi: string, eylem: string, hedef: string): void {
    this.auditKayitlari = [
      { id: benzersizId('au'), zaman: simdiEtiketi(), kullanici: kullaniciAdi, eylem, hedef },
      ...this.auditKayitlari
    ];
  }

  private birimKrediBedeli(): number {
    return patlatmaBedeli(this.bau);
  }

  private yuklemeHareketAdedi(hareketler: KrediHareketi[], kayitNo: string): number {
    return hareketler
      .filter((hareket) => hareket.tip === 'YUKLEME' && hareket.kayitNo === kayitNo)
      .reduce((toplam, hareket) => toplam + hareket.adet, 0);
  }

  private krediYuklemeAnaliziniOlustur(islem: Islem) {
    return krediYuklemeKaydiniCozumle({
      islem,
      birimKrediBedeli: this.birimKrediBedeli(),
      mevcutYuklemeAdedi: this.yuklemeHareketAdedi(this.krediHareketleri, islem.kayitNo)
    });
  }

  private krediYuklemeKaydiniGuncelle(
    islem: Islem,
    makbuzUreten?: string,
    bagisMakbuzlari?: BagisMakbuzu[]
  ): Islem {
    const girdi = bagisMakbuzlari ? { ...islem, bagisMakbuzlari } : islem;
    const analiz = krediYuklemeKaydiniCozumle({
      islem: girdi,
      birimKrediBedeli: this.birimKrediBedeli(),
      mevcutYuklemeAdedi: this.yuklemeHareketAdedi(this.krediHareketleri, islem.kayitNo)
    });
    return {
      ...islem,
      dekont: analiz.guncelDekontlar[0] ?? islem.dekont,
      dekontlar: analiz.guncelDekontlar,
      bagisMakbuzlari: analiz.bagisMakbuzlari.length ? analiz.bagisMakbuzlari : undefined,
      krediTalebiOdemeOzeti: analiz.krediTalebiOdemeOzeti,
      makbuzNo: analiz.makbuzNoAlias,
      makbuzUreten: analiz.bagisMakbuzlari.length ? makbuzUreten ?? islem.makbuzUreten : islem.makbuzUreten,
      durum: analiz.kayitDurumu
    };
  }

  private aktifKullaniciAdi(aktifKullanici: Kullanici | null): string {
    return aktifKullanici?.adSoyad ?? 'Sistem';
  }

  private yazmaKullanabilirMi(aktifKullanici: Kullanici | null): aktifKullanici is Kullanici {
    return !!aktifKullanici && !aktifKullanici.sadeceGoruntule;
  }

  private menuYazmaYetkisiVarMi(
    aktifKullanici: Kullanici | null,
    menuId: string
  ): aktifKullanici is Kullanici {
    return this.yazmaKullanabilirMi(aktifKullanici) && ekranGorulebilirMi(aktifKullanici, menuId);
  }

  private bentYazmaYetkisiVarMi(
    aktifKullanici: Kullanici | null,
    bent: Islem['bent']
  ): aktifKullanici is Kullanici {
    return (
      this.yazmaKullanabilirMi(aktifKullanici) &&
      (kullaniciMerkezAdminMi(aktifKullanici) || aktifKullanici.bentler.includes(bent))
    );
  }

  private eBentTakvimYazmaYetkisiVarMi(aktifKullanici: Kullanici | null): aktifKullanici is Kullanici {
    return (
      this.menuYazmaYetkisiVarMi(aktifKullanici, 'patlatma-takvimi') &&
      this.bentYazmaYetkisiVarMi(aktifKullanici, 'E')
    );
  }

  private sigortaKayitYazmaYetkisiVarMi(aktifKullanici: Kullanici | null): aktifKullanici is Kullanici {
    return (
      this.menuYazmaYetkisiVarMi(aktifKullanici, 'sigorta') &&
      (kullaniciMerkezAdminMi(aktifKullanici) || aktifKullanici.rolKodu === 'PGM_TRAFIK')
    );
  }

  private tasOcagiMasterYazmaYetkisiVarMi(
    aktifKullanici: Kullanici | null,
    menuId: 'isletmeciler' | 'tas-ocaklari'
  ): aktifKullanici is Kullanici {
    return (
      this.menuYazmaYetkisiVarMi(aktifKullanici, menuId) &&
      (kullaniciMerkezAdminMi(aktifKullanici) || aktifKullanici.rolKodu === 'TAS_OCAGI')
    );
  }

  // --- Kimlik doğrulama -----------------------------------------------------

  girisYap(kullaniciAdi: string, sifre: string): KimlikDogrulamaSonucu {
    const bulunan = this.kullanicilar.find(
      (k) => k.kullaniciAdi === kullaniciAdi.trim().toLowerCase() && k.sifre === sifre
    );
    if (!bulunan) return { basarili: false, mesaj: 'Kullanıcı adı veya şifre hatalı.' };
    if (!bulunan.aktif) {
      return {
        basarili: false,
        mesaj: 'Bu kullanıcı pasif durumdadır ve giriş yapamaz. Merkez Admin ile iletişime geçin.'
      };
    }
    this.auditYazDahili(bulunan.adSoyad, 'Giriş yapıldı', `${bulunan.kullaniciAdi} · ${bulunan.birim}`);
    return { basarili: true, kullanici: bulunan };
  }

  // --- Kullanıcılar -----------------------------------------------------------

  kullanicilariGetir(): Kullanici[] {
    return this.kullanicilar;
  }

  kullaniciKaydet(aktifKullanici: Kullanici | null, hedef: Kullanici): KayitSonucu {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'kullanici-yonetimi')) {
      return { basarili: false, mesaj: 'Kullanıcı kaydetme yetkiniz yok.' };
    }
    const ad = hedef.kullaniciAdi.trim().toLowerCase();
    if (!ad) return { basarili: false, mesaj: 'Kullanıcı adı boş olamaz.' };
    if (!hedef.sifre.trim()) return { basarili: false, mesaj: 'Şifre boş olamaz.' };
    if (this.kullanicilar.some((k) => k.kullaniciAdi === ad && k.id !== hedef.id)) {
      return { basarili: false, mesaj: 'Bu kullanıcı adı zaten kullanılıyor.' };
    }
    const kayit = { ...hedef, kullaniciAdi: ad };
    const yeniMi = !this.kullanicilar.some((k) => k.id === hedef.id);
    this.kullanicilar = yeniMi
      ? [kayit, ...this.kullanicilar]
      : this.kullanicilar.map((k) => (k.id === kayit.id ? kayit : k));
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      yeniMi ? 'Kullanıcı oluşturuldu' : 'Kullanıcı güncellendi',
      `${kayit.kullaniciAdi} · ${kayit.rol} · ${kayit.birim} · ${kayit.aktif ? 'Aktif' : 'Pasif'}`
    );
    return { basarili: true };
  }

  kullaniciAktiflikDegistir(aktifKullanici: Kullanici | null, id: string, aktif: boolean): void {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'kullanici-yonetimi')) {
      return;
    }
    const hedef = this.kullanicilar.find((k) => k.id === id);
    this.kullanicilar = this.kullanicilar.map((k) => (k.id === id ? { ...k, aktif } : k));
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      aktif ? 'Kullanıcı aktife alındı' : 'Kullanıcı pasife alındı',
      `${hedef?.kullaniciAdi ?? id} · ${hedef?.rol ?? ''}`
    );
  }

  sifreSifirla(aktifKullanici: Kullanici | null, id: string, yeniSifre: string): void {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'kullanici-yonetimi')) {
      return;
    }
    const hedef = this.kullanicilar.find((k) => k.id === id);
    this.kullanicilar = this.kullanicilar.map((k) => (k.id === id ? { ...k, sifre: yeniSifre } : k));
    this.auditYazDahili(this.aktifKullaniciAdi(aktifKullanici), 'Kullanıcı şifresi sıfırlandı', `${hedef?.kullaniciAdi ?? id}`);
  }

  // --- Birimler ---------------------------------------------------------------

  birimleriGetir(): Birim[] {
    return this.birimler;
  }

  birimKaydet(aktifKullanici: Kullanici | null, birim: Birim): KayitSonucu {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'birim-yonetimi')) {
      return { basarili: false, mesaj: 'Birim kaydetme yetkiniz yok.' };
    }
    if (!birim.ad.trim()) return { basarili: false, mesaj: 'Birim adı boş olamaz.' };
    if (!birim.kod.trim()) return { basarili: false, mesaj: 'Birim kodu boş olamaz.' };
    if (this.birimler.some((b) => b.kod.toUpperCase() === birim.kod.trim().toUpperCase() && b.id !== birim.id)) {
      return { basarili: false, mesaj: 'Bu birim kodu zaten kullanılıyor.' };
    }
    const kayit = { ...birim, ad: birim.ad.trim(), kod: birim.kod.trim().toUpperCase() };
    const yeniMi = !this.birimler.some((b) => b.id === birim.id);
    this.birimler = yeniMi
      ? [kayit, ...this.birimler]
      : this.birimler.map((b) => (b.id === kayit.id ? kayit : b));
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      yeniMi ? 'Birim oluşturuldu' : 'Birim güncellendi',
      `${kayit.ad} (${kayit.kod}) · ${kayit.aktif ? 'Aktif' : 'Pasif'}`
    );
    return { basarili: true };
  }

  birimAktiflikDegistir(aktifKullanici: Kullanici | null, id: string, aktif: boolean): void {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'birim-yonetimi')) {
      return;
    }
    const hedef = this.birimler.find((b) => b.id === id);
    this.birimler = this.birimler.map((b) => (b.id === id ? { ...b, aktif } : b));
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      aktif ? 'Birim aktife alındı' : 'Birim pasife alındı',
      `${hedef?.ad ?? id} · Bağlı kullanıcı: ${this.kullanicilar.filter((k) => k.birimId === id).length}`
    );
  }

  // --- BAÜ ----------------------------------------------------------------------

  bauGetir(): number {
    return this.bau;
  }

  bauGuncelle(aktifKullanici: Kullanici | null, deger: number): void {
    if (!this.yazmaKullanabilirMi(aktifKullanici) || !aktifKullanici.bauGuncelleyebilir) {
      return;
    }
    this.bau = deger;
    this.auditYazDahili(this.aktifKullaniciAdi(aktifKullanici), 'BAÜ güncellendi', `Brüt asgari ücret: ${formatTL(deger)}`);
  }

  // --- İşlemler -------------------------------------------------------------------

  islemleriGetir(): Islem[] {
    return this.islemler;
  }

  /** Yeni kayıtlar aktif kullanıcının birimi ve kimliği ile damgalanır. */
  islemEkle(aktifKullanici: Kullanici | null, islem: Islem): void {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'yeni-islem') || !this.bentYazmaYetkisiVarMi(aktifKullanici, islem.bent)) {
      return;
    }
    const damgali: Islem = {
      ...islem,
      birim: islem.birim || aktifKullanici?.birim || '—',
      birimId: islem.birimId ?? aktifKullanici?.birimId,
      olusturan: islem.olusturan || aktifKullanici?.rol || 'Sistem',
      olusturanKullaniciId: islem.olusturanKullaniciId ?? aktifKullanici?.id
    };
    this.islemler = [damgali, ...this.islemler];
  }

  islemOlustur(aktifKullanici: Kullanici | null, girdi: YeniIslemGirdisi): YeniIslemSonucu {
    if (!aktifKullanici) {
      return { basarili: false, mesaj: 'Aktif kullanıcı olmadan kayıt oluşturulamaz.' };
    }
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'yeni-islem')) {
      return { basarili: false, mesaj: 'Yeni işlem oluşturma yetkiniz yok.' };
    }
    if (!this.bentYazmaYetkisiVarMi(aktifKullanici, girdi.bent)) {
      return { basarili: false, mesaj: `${girdi.bent} bendi için işlem oluşturma yetkiniz yok.` };
    }

    if (girdi.bent === 'E' && girdi.eIslemTuru === 'KREDI_PLANLAMA') {
      return {
        basarili: false,
        mesaj: 'Patlatma planlama kayıtları için patlatmaPlanla komutu kullanılmalıdır.'
      };
    }

    const trafik = girdi.bent === 'F' && girdi.fAltTur === 'TRAFIK';
    const adli = girdi.bent === 'F' && girdi.fAltTur === 'ADLI';
    const krediYukleme = girdi.bent === 'E' && girdi.eIslemTuru === 'KREDI_YUKLEME';
    const kayitNo = sonrakiKayitNo(this.islemler, girdi.bent, girdi.fAltTur ?? '', girdi.eIslemTuru ?? '');
    const baslikMetni =
      girdi.bent === 'E'
        ? `Patlatma kredisi yükleme — ${girdi.krediAdedi ?? 0} kredi`
        : girdi.baslik.trim();

    const altBasvurular: TrafikAltBasvuru[] | undefined = trafik
      ? (girdi.trafikAltBasvurular ?? []).map((satir, sira) => ({
          ...satir,
          no: altBasvuruNo(kayitNo, sira + 1),
          raporTutari: raporBedeli(this.bau)
        }))
      : undefined;

    const adliRaporlar: AdliRapor[] | undefined = adli
      ? (girdi.adliRaporlar ?? []).map((satir, sira) => ({
          ...satir,
          no: altBasvuruNo(kayitNo, sira + 1),
          raporTutari: raporBedeli(this.bau)
        }))
      : undefined;

    const temelDekont: Dekont = {
      dekontNo: girdi.dekontNo.trim(),
      bankaReferansNo: girdi.bankaReferansNo?.trim() || undefined,
      banka: girdi.banka.trim(),
      tarih: girdi.dekontTarihi,
      odenenTutar: girdi.odenenTutar,
      odemeYapan: girdi.odemeYapan.trim(),
      dosya: girdi.dekontDosyasi
    };

    const ilkKrediDekontu: Dekont | null = krediYukleme
      ? {
          ...temelDekont,
          id: benzersizId('dk'),
          dogrulamaDurumu: 'BEKLIYOR',
          ocrDurumu: girdi.ocrDurumu,
          ocrOkunanAlanlar: girdi.ocrOkunanAlanlar,
          ocrGuvenBilgileri: girdi.ocrGuvenBilgileri,
          ocrDogrulananDegerleri: {
            dekontNo: girdi.dekontNo.trim(),
            bankaReferansNo: girdi.bankaReferansNo?.trim() || undefined,
            banka: girdi.banka.trim(),
            tarih: girdi.dekontTarihi,
            odenenTutar: girdi.odenenTutar,
            odemeYapan: girdi.odemeYapan.trim()
          }
        }
      : null;

    const krediYuklemeTaslagi =
      krediYukleme && ilkKrediDekontu
        ? krediYuklemeKaydiniCozumle({
            islem: {
              dekont: ilkKrediDekontu,
              dekontlar: [ilkKrediDekontu],
              makbuzNo: null,
              durum: 'ODEME_BEKLIYOR',
              krediAdedi: girdi.krediAdedi
            },
            birimKrediBedeli: patlatmaBedeli(this.bau),
            mevcutYuklemeAdedi: 0
          })
        : null;

    const kayit: Islem = {
      id: benzersizId('is'),
      kayitNo,
      bent: girdi.bent,
      fAltTur: girdi.fAltTur,
      eIslemTuru: girdi.eIslemTuru,
      baslik: baslikMetni,
      talepEden: girdi.talepEden.trim() || '—',
      birim: aktifKullanici.birim,
      birimId: aktifKullanici.birimId,
      olusturan: aktifKullanici.rol,
      olusturanKullaniciId: aktifKullanici.id,
      olusturmaTarihi: new Date().toISOString().slice(0, 10),
      operasyonTarihi: girdi.operasyonTarihi,
      operasyonSaati: girdi.operasyonSaati,
      yer: girdi.yer?.trim() || undefined,
      etkinlikAdi: girdi.etkinlikAdi?.trim() || undefined,
      polisSayisi: girdi.bent === 'D' ? girdi.polisSayisi : undefined,
      gorevSuresi: girdi.bent === 'D' ? girdi.gorevSuresi : undefined,
      gorevDilimleri: girdi.bent === 'D' && girdi.gorevDilimleri?.length
        ? girdi.gorevDilimleri
        : undefined,
      tutar: girdi.tutar,
      hesaplamaAciklamasi: girdi.hesaplamaSatirlari.join(' · '),
      dekont: krediYukleme && ilkKrediDekontu ? ilkKrediDekontu : temelDekont,
      dekontlar: krediYuklemeTaslagi?.guncelDekontlar,
      makbuzNo: null,
      durum: krediYukleme ? krediYuklemeTaslagi?.kayitDurumu ?? 'ODEME_BEKLIYOR' : 'MAKBUZ_BEKLIYOR',
      bagisMakbuzlari: krediYuklemeTaslagi?.bagisMakbuzlari.length
        ? krediYuklemeTaslagi.bagisMakbuzlari
        : undefined,
      sigortaSirketiId: trafik ? girdi.sigortaSirketiId : undefined,
      altBasvurular,
      adliRaporlar,
      isletmeciId: girdi.bent === 'E' ? girdi.isletmeciId : undefined,
      krediAdedi: girdi.bent === 'E' ? girdi.krediAdedi : undefined,
      krediTalebiOdemeOzeti: krediYuklemeTaslagi?.krediTalebiOdemeOzeti,
      notlar: girdi.notlar?.trim() || undefined
    };

    this.islemEkle(aktifKullanici, kayit);
    this.auditYazDahili(this.aktifKullaniciAdi(aktifKullanici), 'Kayıt oluşturuldu', kayitNo);

    if (trafik) {
      const sigortaAdi = this.sigortalar.find((sirket) => sirket.id === girdi.sigortaSirketiId)?.ad;
      this.auditYazDahili(
        this.aktifKullaniciAdi(aktifKullanici),
        'Trafik ana TTRF oluşturuldu',
        `${kayitNo} · ${sigortaAdi ?? '—'}`
      );
      if (altBasvurular && altBasvurular.length > 1) {
        altBasvurular.slice(1).forEach((alt) => {
          this.auditYazDahili(
            this.aktifKullaniciAdi(aktifKullanici),
            'Trafik ek rapor oluşturuldu',
            `${alt.no} · ${alt.plaka}`
          );
        });
      }
    }

    if (krediYukleme) {
      const isletmeciAdi = this.isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad;
      this.auditYazDahili(
        this.aktifKullaniciAdi(aktifKullanici),
        'Taş ocağı kredi talebi oluşturuldu',
        `${isletmeciAdi ?? '—'} · ${kayitNo} · İlk dekont ${girdi.dekontNo.trim()} · doğrulama bekliyor`
      );
    }

    const ajandayaDuser = girdi.bent === 'C' || girdi.bent === 'Ç' || girdi.bent === 'D' || girdi.bent === 'F';
    if (ajandayaDuser) {
      const raporSayisi = trafik
        ? altBasvurular?.length ?? 0
        : adli
        ? adliRaporlar?.length ?? 0
        : 0;
      this.ajandaEkle(aktifKullanici, {
        id: benzersizId('aj'),
        kayitNo,
        bent: girdi.bent,
        islemTuru:
          girdi.bent === 'F'
            ? `${trafik ? 'Trafik' : 'Adli'} polis raporu${raporSayisi > 1 ? ` (${raporSayisi} rapor)` : ''}`
            : bentler.find((b) => b.kod === girdi.bent)?.baslik ?? '',
        baslik: girdi.etkinlikAdi?.trim() || baslikMetni,
        talepEden: girdi.talepEden.trim() || '—',
        birim: aktifKullanici.birim,
        birimId: aktifKullanici.birimId,
        olusturanKullaniciId: aktifKullanici.id,
        tarih: girdi.operasyonTarihi ?? '',
        saat: girdi.operasyonSaati || '09:00',
        yer: girdi.yer?.trim() || '—',
        durum: 'Planlandı',
        odemeDurumu: `Ödeme alındı · Makbuz bekliyor · ${formatTL(kayit.tutar)}`
      });
    }

    return { basarili: true, mesaj: 'İşlem kaydı oluşturuldu.', kayitNo, kayit };
  }

  makbuzUret(aktifKullanici: Kullanici | null, islemId: string): MakbuzUretimSonucu {
    const hedef = this.islemler.find((i) => i.id === islemId);
    if (!hedef) {
      return { basarili: false, mesaj: 'Makbuz üretilecek kayıt bulunamadı.' };
    }
    if (!makbuzUretilebilirMi(aktifKullanici, hedef)) {
      return { basarili: false, mesaj: 'Bu kayıt için makbuz üretme yetkiniz yok.' };
    }

    if (hedef.eIslemTuru === 'KREDI_YUKLEME') {
      const analiz = this.krediYuklemeAnaliziniOlustur(hedef);
      if (!analiz.makbuzEksikleri.length) {
        return {
          basarili: false,
          mesaj:
            analiz.bagisMakbuzlari.length > 0
              ? 'Bu kredi talebi için bekleyen bağış makbuzu bulunmuyor.'
              : 'Önce en az bir dekont doğrulanmalıdır.'
        };
      }

      const uretilenMakbuzlar: string[] = [];
      let guncelIslemler = this.islemler.slice();

      for (const eksik of analiz.makbuzEksikleri) {
        const sonDurum = guncelIslemler.find((islem) => islem.id === islemId);
        if (!sonDurum) {
          return { basarili: false, mesaj: 'Kayıt güncellenirken bulunamadı.' };
        }
        const yeniNo = sonrakiMakbuzNo(guncelIslemler);
        const yeniMakbuz: BagisMakbuzu = {
          makbuzNo: yeniNo,
          tur: eksik.tur,
          tutar: eksik.tutar,
          bagliDekontId: eksik.bagliDekontId,
          bagliDekontNo: eksik.bagliDekontNo,
          bagliDekontReferansi: eksik.bagliDekontReferansi,
          bagliDekontTarihi: eksik.bagliDekontTarihi,
          odemeYapan: eksik.odemeYapan,
          olusturmaTarihi: new Date().toISOString().slice(0, 10)
        };
        uretilenMakbuzlar.push(yeniNo);
        const guncelMakbuzlar = [...islemBagisMakbuzlariniOku(sonDurum, this.birimKrediBedeli()), yeniMakbuz];
        const guncelKayit = this.krediYuklemeKaydiniGuncelle(
          { ...sonDurum, bagisMakbuzlari: guncelMakbuzlar },
          aktifKullanici?.rol,
          guncelMakbuzlar
        );
        guncelIslemler = guncelIslemler.map((islem) => (islem.id === islemId ? guncelKayit : islem));
      }

      this.islemler = guncelIslemler;
      this.auditYazDahili(
        this.aktifKullaniciAdi(aktifKullanici),
        'Bağış makbuzları üretildi',
        `${hedef.kayitNo} · ${uretilenMakbuzlar.join(', ')}`
      );
      return {
        basarili: true,
        mesaj: `${uretilenMakbuzlar.length} bağış makbuzu üretildi.`,
        makbuzNumaralari: uretilenMakbuzlar
      };
    }

    if (hedef.makbuzNo) {
      return { basarili: false, mesaj: `Bu kayda zaten makbuz üretilmiş: ${hedef.makbuzNo}` };
    }

    const uretilen = sonrakiMakbuzNo(this.islemler);
    this.islemler = this.islemler.map((i) =>
      i.id === islemId
        ? {
            ...i,
            makbuzNo: uretilen,
            makbuzUreten: aktifKullanici?.rol,
            durum: 'ISLEM_BASLATILABILIR' as const
          }
        : i
    );
    return {
      basarili: true,
      mesaj: `Makbuz üretildi: ${uretilen}`,
      makbuzNumaralari: [uretilen]
    };
  }

  odemeDogrula(aktifKullanici: Kullanici | null, islemId: string, dekontId?: string): OdemeDogrulamaSonucu {
    const hedef = this.islemler.find((i) => i.id === islemId);
    if (!hedef) {
      return { basarili: false, mesaj: 'Ödeme doğrulanacak kayıt bulunamadı.' };
    }
    if (!odemeDogrulanabilirMi(aktifKullanici, hedef)) {
      return { basarili: false, mesaj: 'Bu kayıt için ödeme doğrulama yetkiniz yok.' };
    }

    if (hedef.eIslemTuru === 'KREDI_YUKLEME') {
      const tumDekontlar = islemDekontlariniOku(hedef);
      const hedefKaydi = tumDekontlar
        .map((dekont, sira) => ({
          dekont,
          kimlik: krediYuklemeDekontKimligi(dekont, sira)
        }))
        .find(
          ({ dekont, kimlik }) =>
            (dekontId ? kimlik === dekontId || dekont.id === dekontId : true) &&
            dekont.dogrulamaDurumu !== 'DOGRULANDI' &&
            dekont.dogrulamaDurumu !== 'REDDEDILDI'
        );

      if (!hedefKaydi) {
        return { basarili: false, mesaj: 'Doğrulanacak uygun dekont bulunamadı.' };
      }

      const dogrulamaZamani = new Date().toISOString();
      const guncelDekontlar: Dekont[] = tumDekontlar.map((dekont, sira) =>
        krediYuklemeDekontKimligi(dekont, sira) === hedefKaydi.kimlik
          ? {
              ...dekont,
              dogrulamaDurumu: 'DOGRULANDI' as const,
              dogrulamaZamani
            }
          : dekont
      );
      const geciciKayit = { ...hedef, dekont: guncelDekontlar[0] ?? hedef.dekont, dekontlar: guncelDekontlar };
      const mevcutYuklemeAdedi = this.yuklemeHareketAdedi(this.krediHareketleri, hedef.kayitNo);
      const analiz = krediYuklemeKaydiniCozumle({
        islem: geciciKayit,
        birimKrediBedeli: this.birimKrediBedeli(),
        mevcutYuklemeAdedi
      });
      const guncelKayit = this.krediYuklemeKaydiniGuncelle(geciciKayit);

      this.islemler = this.islemler.map((islem) => (islem.id === islemId ? guncelKayit : islem));

      if (analiz.yeniYuklemeAdedi > 0) {
        this.krediHareketleri = [
          {
            id: benzersizId('kh'),
            isletmeciId: hedef.isletmeciId ?? '',
            tip: 'YUKLEME',
            adet: analiz.yeniYuklemeAdedi,
            kayitNo: hedef.kayitNo,
            dekontId: hedefKaydi.dekont.id ?? hedefKaydi.kimlik,
            dekontNo: hedefKaydi.dekont.dekontNo,
            tarih: hedefKaydi.dekont.tarih,
            aciklama: `${hedefKaydi.dekont.dekontNo} doğrulandı; ${analiz.yeniYuklemeAdedi} kredi kullanılabilir oldu.`
          },
          ...this.krediHareketleri
        ];
        this.auditYazDahili(
          this.aktifKullaniciAdi(aktifKullanici),
          'Taş ocağı kredi kullanılabilir oldu',
          `${hedef.talepEden} · +${analiz.yeniYuklemeAdedi} kredi · ${hedefKaydi.dekont.dekontNo}`
        );
      }

      this.auditYazDahili(
        this.aktifKullaniciAdi(aktifKullanici),
        'Dekont doğrulandı',
        `${hedef.kayitNo} · ${hedefKaydi.dekont.dekontNo}`
      );
      return {
        basarili: true,
        mesaj:
          analiz.yeniYuklemeAdedi > 0
            ? `${hedefKaydi.dekont.dekontNo} doğrulandı ve ${analiz.yeniYuklemeAdedi} kredi kullanılabilir oldu.`
            : `${hedefKaydi.dekont.dekontNo} doğrulandı. Tam krediye yetmeyen bakiye beklemeye alındı.`,
        dogrulananDekontId: hedefKaydi.dekont.id ?? hedefKaydi.kimlik,
        kullanilabilirKrediAdedi: analiz.dogrulanmisOzeti.kullanilabilirKrediAdedi,
        olusanKrediAdedi: analiz.yeniYuklemeAdedi
      };
    }

    this.islemler = this.islemler.map((i) =>
      i.id === islemId ? { ...i, durum: 'ODEME_DOGRULANDI' as const } : i
    );
    return { basarili: true, mesaj: `${hedef.kayitNo} ödemesi doğrulandı.` };
  }

  krediYuklemeDekontEkle(
    aktifKullanici: Kullanici | null,
    islemId: string,
    girdi: KrediYuklemeDekontKaydiGirdisi
  ): IslemSonucu {
    const hedef = this.islemler.find((islem) => islem.id === islemId);
    if (!hedef || hedef.eIslemTuru !== 'KREDI_YUKLEME') {
      return { basarili: false, mesaj: 'Tamamlayıcı dekont eklenecek kredi talebi bulunamadı.' };
    }
    if (!islemDegistirilebilirMi(aktifKullanici, hedef)) {
      return { basarili: false, mesaj: 'Bu kredi talebine dekont ekleme yetkiniz yok.' };
    }
    if (!girdi.dosya) {
      return { basarili: false, mesaj: 'Dekont dosyası olmadan tamamlayıcı kayıt eklenemez.' };
    }
    if (!girdi.dekontNo.trim() || !girdi.banka.trim() || !girdi.tarih || !girdi.odemeYapan.trim()) {
      return { basarili: false, mesaj: 'Dekont no, banka, tarih ve ödeme yapan alanları zorunludur.' };
    }
    if (girdi.odenenTutar <= 0) {
      return { basarili: false, mesaj: 'Dekont tutarı sıfırdan büyük olmalıdır.' };
    }
    if (girdi.tarih > new Date().toISOString().slice(0, 10)) {
      return { basarili: false, mesaj: 'Dekont tarihi gelecekte olamaz.' };
    }

    const mukerrerlik = krediYuklemeDekontMukerrerliginiBul({
      islemler: this.islemler,
      dekontNo: girdi.dekontNo,
      bankaReferansNo: girdi.bankaReferansNo,
      banka: girdi.banka,
      dosyaHash: girdi.dosya?.dekontHash,
      tarih: girdi.tarih,
      odenenTutar: girdi.odenenTutar,
      odemeYapan: girdi.odemeYapan
    });
    if (mukerrerlik.duplicateDekont) {
      return {
        basarili: false,
        mesaj: `Bu dekont no zaten kullanılmış: ${mukerrerlik.duplicateDekont.islem.kayitNo}`
      };
    }
    if (mukerrerlik.duplicateReferans) {
      return {
        basarili: false,
        mesaj: `Bu banka referansı zaten kullanılmış: ${mukerrerlik.duplicateReferans.islem.kayitNo}`
      };
    }
    if (mukerrerlik.duplicateDosya) {
      return {
        basarili: false,
        mesaj: `Bu dijital dekont dosyası zaten kullanılmış: ${mukerrerlik.duplicateDosya.islem.kayitNo}`
      };
    }

    const yeniDekont: Dekont = {
      id: benzersizId('dk'),
      dekontNo: girdi.dekontNo.trim(),
      bankaReferansNo: girdi.bankaReferansNo?.trim() || undefined,
      banka: girdi.banka.trim(),
      tarih: girdi.tarih,
      odenenTutar: girdi.odenenTutar,
      odemeYapan: girdi.odemeYapan.trim(),
      dosya: girdi.dosya,
      dogrulamaDurumu: 'BEKLIYOR',
      ocrDurumu: girdi.ocrDurumu,
      ocrOkunanAlanlar: girdi.ocrOkunanAlanlar,
      ocrGuvenBilgileri: girdi.ocrGuvenBilgileri,
      ocrIlkDegerleri: girdi.ocrIlkDegerleri,
      ocrDogrulananDegerleri: girdi.ocrDogrulananDegerleri
    };
    const guncelDekontlar = [...islemDekontlariniOku(hedef), yeniDekont];
    const guncelKayit = this.krediYuklemeKaydiniGuncelle({
      ...hedef,
      dekont: guncelDekontlar[0] ?? hedef.dekont,
      dekontlar: guncelDekontlar
    });

    this.islemler = this.islemler.map((islem) => (islem.id === islemId ? guncelKayit : islem));
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      'Tamamlayıcı dekont eklendi',
      `${hedef.kayitNo} · ${yeniDekont.dekontNo}`
    );
    return {
      basarili: true,
      mesaj: `${yeniDekont.dekontNo} dekontu kredi talebine eklendi.`
    };
  }

  // --- Ajanda ----------------------------------------------------------------------

  ajandaGetir(): AjandaKaydi[] {
    return this.ajanda;
  }

  ajandaEkle(aktifKullanici: Kullanici | null, kayit: AjandaKaydi): void {
    if (!this.bentYazmaYetkisiVarMi(aktifKullanici, kayit.bent)) {
      return;
    }
    const damgali: AjandaKaydi = {
      ...kayit,
      birim: kayit.birim || aktifKullanici?.birim || '—',
      birimId: kayit.birimId ?? aktifKullanici?.birimId,
      olusturanKullaniciId: kayit.olusturanKullaniciId ?? aktifKullanici?.id
    };
    this.ajanda = [damgali, ...this.ajanda];
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      'Ajanda kaydı oluşturuldu',
      `${kayit.kayitNo} · ${formatTarihSaat(kayit.tarih, kayit.saat)}`
    );
  }

  ajandaDurumGuncelle(aktifKullanici: Kullanici | null, id: string, durum: AjandaDurumu): void {
    const hedef = this.ajanda.find((a) => a.id === id);
    if (!hedef) return;
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'ajanda')) return;
    if (!ajandaIslemiYapilabilirMi(aktifKullanici, hedef)) return;
    this.ajanda = this.ajanda.map((a) => (a.id === id ? { ...a, durum } : a));
  }

  // --- Audit -----------------------------------------------------------------------

  auditGetir(): AuditKaydi[] {
    return this.auditKayitlari;
  }

  auditYaz(aktifKullanici: Kullanici | null, eylem: string, hedef: string): void {
    this.auditYazDahili(this.aktifKullaniciAdi(aktifKullanici), eylem, hedef);
  }

  // --- Taş ocağı kredi hareketleri ---------------------------------------------------

  krediHareketleriGetir(): KrediHareketi[] {
    return this.krediHareketleri;
  }

  krediHareketiEkle(aktifKullanici: Kullanici | null, hareket: KrediHareketi): void {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'kredi-hareketleri')) {
      return;
    }
    if (!this.bentYazmaYetkisiVarMi(aktifKullanici, 'E')) {
      return;
    }
    this.krediHareketleri = [hareket, ...this.krediHareketleri];
  }

  krediOzetiHesapla(isletmeciId: string): KrediOzeti {
    const hareketler = this.krediHareketleri.filter((h) => h.isletmeciId === isletmeciId);
    const yuklemeler = hareketler.filter((h) => h.tip === 'YUKLEME');
    const yuklenen = yuklemeler.reduce((t, h) => t + h.adet, 0);
    const krediKayitlari = this.islemler.filter(
      (islem) => islem.isletmeciId === isletmeciId && islem.eIslemTuru === 'KREDI_YUKLEME'
    );
    const dogrulamaBekleyen = krediKayitlari.reduce((toplam, kayit) => {
      const analiz = krediYuklemeKaydiniCozumle({
        islem: kayit,
        birimKrediBedeli: this.birimKrediBedeli(),
        mevcutYuklemeAdedi: this.yuklemeHareketAdedi(hareketler, kayit.kayitNo)
      });
      return toplam + Math.max((kayit.krediAdedi ?? 0) - analiz.dogrulanmisOzeti.kullanilabilirKrediAdedi, 0);
    }, 0);
    const gerceklesmeler = hareketler.filter((h) => h.tip === 'KULLANIM');
    const kullanilan = gerceklesmeler.reduce((t, h) => t + h.adet, 0);
    const raporlananPlanlar = gerceklesmeler.map((h) => h.planKayitNo).filter((no): no is string => !!no);
    const planlanan = hareketler
      .filter((h) => h.tip === 'PLAN' && !raporlananPlanlar.includes(h.kayitNo))
      .reduce((t, h) => t + h.adet, 0);
    const kullanilabilir = yuklenen;
    return {
      yuklenen,
      kullanilabilir,
      kullanilan,
      planlanan,
      kalan: Math.max(kullanilabilir - kullanilan, 0),
      dogrulamaBekleyen
    };
  }

  /**
   * Patlatma planlama. Kredi DÜŞÜLMEZ; yalnızca “plan / sonuç bekliyor” hareketi oluşur.
   * Kredi yetersizse plan yine kaydedilir, ancak kart “Kredi Yetersiz” uyarısı gösterir.
   */
  patlatmaPlanla(aktifKullanici: Kullanici | null, girdi: PlanGirdisi): PlanSonucu {
    if (!this.eBentTakvimYazmaYetkisiVarMi(aktifKullanici)) {
      return { basarili: false, mesaj: 'Patlatma planlama yetkiniz yok.' };
    }
    if (girdi.adet <= 0) {
      return { basarili: false, mesaj: 'Patlatma adedi sıfırdan büyük olmalıdır.' };
    }
    const ozet = this.krediOzetiHesapla(girdi.isletmeciId);
    const isletmeciAdi = this.isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad ?? '—';
    const ocakAdi = this.tasOcaklari.find((t) => t.id === girdi.tasOcagiId)?.ad ?? '—';
    const kayitNo = sonrakiKayitNo(this.islemler, 'E', '', 'KREDI_PLANLAMA');
    const krediYetersiz = girdi.adet > ozet.kalan;

    const kayit: Islem = {
      id: benzersizId('is'),
      kayitNo,
      bent: 'E',
      eIslemTuru: 'KREDI_PLANLAMA',
      baslik: `Patlatma planı — ${ocakAdi}`,
      talepEden: isletmeciAdi,
      birim: aktifKullanici?.birim ?? 'KTPGV Taş Ocağı Birimi',
      birimId: aktifKullanici?.birimId,
      olusturan: aktifKullanici?.rol ?? 'Sistem',
      olusturanKullaniciId: aktifKullanici?.id,
      olusturmaTarihi: new Date().toISOString().slice(0, 10),
      operasyonTarihi: girdi.tarih,
      operasyonSaati: girdi.saat,
      yer: ocakAdi,
      tutar: 0,
      hesaplamaAciklamasi: `Planlanan patlatma: ${girdi.adet}. Kredi planlama aşamasında düşülmez; sonuç “Yapıldı” olarak işlendiğinde düşer.`,
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
      raporNo: girdi.belgeNo || undefined,
      bilgiKaynagi: girdi.bilgiKaynagi,
      raporDosyasi: girdi.dosya ?? null,
      notlar: girdi.aciklama || undefined
    };

    this.islemler = [kayit, ...this.islemler];
    this.krediHareketleri = [
      {
        id: benzersizId('kh'),
        isletmeciId: girdi.isletmeciId,
        tip: 'PLAN',
        adet: girdi.adet,
        kayitNo,
        tasOcagiId: girdi.tasOcagiId,
        tarih: girdi.tarih,
        aciklama: `${ocakAdi} — planlı patlatma, sonuç bekliyor. Kredi düşülmedi.`
      },
      ...this.krediHareketleri
    ];
    this.ajanda = [
      {
        id: benzersizId('aj'),
        kayitNo,
        bent: 'E',
        islemTuru: 'Patlatma planı',
        baslik: `Patlatma — ${ocakAdi}`,
        talepEden: isletmeciAdi,
        birim: aktifKullanici?.birim ?? 'KTPGV Taş Ocağı Birimi',
        birimId: aktifKullanici?.birimId,
        olusturanKullaniciId: aktifKullanici?.id,
        tarih: girdi.tarih,
        saat: girdi.saat,
        yer: ocakAdi,
        durum: 'Sonuç Bekliyor' as const,
        odemeDurumu: krediYetersiz
          ? `Ön ödemeli kredi · Kullanılabilir kredi yetersiz (${ozet.kalan})`
          : `Ön ödemeli kredi · ${girdi.adet} kredi planlandı · Kalan ${ozet.kalan}`,
        isletmeciId: girdi.isletmeciId,
        tasOcagiId: girdi.tasOcagiId,
        planlananAdet: girdi.adet,
        bilgiKaynagi: girdi.bilgiKaynagi,
        raporNo: girdi.belgeNo || undefined
      },
      ...this.ajanda
    ];

    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      'Patlatma planlandı',
      `${kayitNo} · ${ocakAdi} · ${girdi.adet} patlatma · ${formatTarihSaat(girdi.tarih, girdi.saat)}`
    );
    if (krediYetersiz) {
      this.auditYazDahili(
        this.aktifKullaniciAdi(aktifKullanici),
        'Kredi yetersiz uyarısı',
        `${isletmeciAdi} · plan ${kayitNo} · talep ${girdi.adet} / kullanılabilir ${ozet.kalan}`
      );
    }

    return { basarili: true, kayitNo, krediYetersiz };
  }

  /** Yapılmadı / Ertelendi / İptal — kredi hareketine kullanım düşümü YAZILMAZ. */
  patlatmaSonucIsle(aktifKullanici: Kullanici | null, girdi: SonucGirdisi): KayitSonucu {
    const kayit = this.ajanda.find((a) => a.id === girdi.ajandaId);
    if (!kayit) return { basarili: false, mesaj: 'Patlatma kaydı bulunamadı.' };
    if (!this.eBentTakvimYazmaYetkisiVarMi(aktifKullanici)) {
      return { basarili: false, mesaj: 'Patlatma sonucu işleme yetkiniz yok.' };
    }
    if (!ajandaIslemiYapilabilirMi(aktifKullanici, kayit)) {
      return { basarili: false, mesaj: 'Bu ajanda kaydı için işlem yetkiniz yok.' };
    }

    const durum: AjandaDurumu =
      girdi.sonuc === 'YAPILMADI' ? 'Yapılmadı' : girdi.sonuc === 'ERTELENDI' ? 'Ertelendi' : 'İptal Edildi';

    const notParcalari = [girdi.neden, girdi.aciklama].filter(Boolean).join(' · ');

    this.ajanda = this.ajanda.map((a) =>
      a.id === girdi.ajandaId
        ? {
            ...a,
            durum,
            tarih: girdi.yeniTarih || a.tarih,
            saat: girdi.yeniSaat || a.saat,
            bilgiKaynagi: girdi.bilgiKaynagi,
            raporNo: girdi.belgeNo || a.raporNo,
            sonucNotu: notParcalari || undefined,
            odemeDurumu:
              girdi.sonuc === 'ERTELENDI'
                ? `Ertelendi · Yeni tarih ${formatTarihSaat(girdi.yeniTarih || a.tarih, girdi.yeniSaat || a.saat)} · Kredi düşülmedi`
                : `${durum} · Kredi düşülmedi`
          }
        : a
    );

    const eylem =
      girdi.sonuc === 'YAPILMADI'
        ? 'Patlatma yapılmadı'
        : girdi.sonuc === 'ERTELENDI'
        ? 'Patlatma ertelendi'
        : 'Patlatma iptal edildi';
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      eylem,
      `${kayit.kayitNo} · ${kayit.yer}${
        girdi.sonuc === 'ERTELENDI' ? ` · Yeni tarih ${formatTarihSaat(girdi.yeniTarih ?? '', girdi.yeniSaat)}` : ''
      }${notParcalari ? ` · ${notParcalari}` : ''} · Kredi düşülmedi`
    );

    return { basarili: true };
  }

  patlatmaGerceklesmeIsle(aktifKullanici: Kullanici | null, girdi: GerceklesmeGirdisi): GerceklesmeSonucu {
    if (!this.eBentTakvimYazmaYetkisiVarMi(aktifKullanici)) {
      return { basarili: false, mesaj: 'Patlatma gerçekleşme işleme yetkiniz yok.' };
    }
    const ozet = this.krediOzetiHesapla(girdi.isletmeciId);
    if (girdi.adet <= 0) {
      return { basarili: false, mesaj: 'Patlatma adedi sıfırdan büyük olmalıdır.' };
    }
    if (girdi.adet > ozet.kalan) {
      this.auditYazDahili(
        this.aktifKullaniciAdi(aktifKullanici),
        'Kredi yetersiz işlem engellendi',
        `${this.isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad ?? '—'} · patlatma sonucu ${
          girdi.raporNo || '—'
        } · talep ${girdi.adet} / kullanılabilir ${ozet.kalan}`
      );
      return {
        basarili: false,
        mesaj:
          'Kullanılabilir kredi yetersiz. Bu patlatma yapıldı olarak işlenmeden önce işletmeciye kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.'
      };
    }

    const isletmeciAdi = this.isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad ?? '—';
    const ocakAdi = this.tasOcaklari.find((t) => t.id === girdi.tasOcagiId)?.ad ?? '—';
    const kayitNo = sonrakiKayitNo(this.islemler, 'E', '', 'KREDI_GERCEKLESME');

    const kayit: Islem = {
      id: benzersizId('is'),
      kayitNo,
      bent: 'E',
      eIslemTuru: 'KREDI_GERCEKLESME',
      baslik: `Patlatma yapıldı — ${ocakAdi}`,
      talepEden: isletmeciAdi,
      birim: aktifKullanici?.birim ?? 'KTPGV Taş Ocağı Birimi',
      birimId: aktifKullanici?.birimId,
      olusturan: aktifKullanici?.rol ?? 'Sistem',
      olusturanKullaniciId: aktifKullanici?.id,
      olusturmaTarihi: new Date().toISOString().slice(0, 10),
      operasyonTarihi: girdi.tarih,
      operasyonSaati: girdi.saat,
      yer: ocakAdi,
      tutar: 0,
      hesaplamaAciklamasi: `Patlatma sonucu “Yapıldı” olarak işlendi. Önceki kullanılabilir kredi: ${ozet.kalan} · Düşülen: ${girdi.adet} · Kalan: ${ozet.kalan - girdi.adet}`,
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
      raporNo: girdi.raporNo || undefined,
      bildiren: girdi.bildiren || undefined,
      bilgiKaynagi: girdi.bilgiKaynagi,
      patlatmaSonucu: 'YAPILDI',
      raporDosyasi: girdi.raporDosyasi ?? null,
      notlar: girdi.aciklama || undefined
    };

    this.islemler = [kayit, ...this.islemler];
    this.krediHareketleri = [
      {
        id: benzersizId('kh'),
        isletmeciId: girdi.isletmeciId,
        tip: 'KULLANIM',
        adet: girdi.adet,
        kayitNo,
        planKayitNo: girdi.planKayitNo,
        tasOcagiId: girdi.tasOcagiId,
        raporNo: girdi.raporNo,
        bildiren: girdi.bildiren,
        tarih: girdi.tarih,
        aciklama: `${ocakAdi} — patlatma yapıldı olarak işlendi, kredi düşüldü.`
      },
      ...this.krediHareketleri
    ];

    if (girdi.ajandaId) {
      this.ajanda = this.ajanda.map((a) =>
        a.id === girdi.ajandaId
          ? {
              ...a,
              durum: 'Yapıldı' as const,
              raporNo: girdi.raporNo || a.raporNo,
              bilgiKaynagi: girdi.bilgiKaynagi,
              gerceklesmeKayitNo: kayitNo,
              odemeDurumu: `Patlatma yapıldı · ${girdi.adet} kredi düşüldü · Kalan ${ozet.kalan - girdi.adet}`
            }
          : a
      );
    }

    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      'Patlatma yapıldı olarak işlendi',
      `${kayitNo} · ${ocakAdi} · Belge ${girdi.raporNo || '—'}`
    );
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      'Taş ocağı kredi kullanıldı',
      `${isletmeciAdi} · -${girdi.adet} kredi · Kalan ${ozet.kalan - girdi.adet}`
    );

    return {
      basarili: true,
      kayitNo,
      oncekiKredi: ozet.kalan,
      kalanKredi: ozet.kalan - girdi.adet
    };
  }

  // --- Sigorta / işletmeci / taş ocağı master verileri -------------------------------

  sigortalariGetir(): SigortaSirketi[] {
    return this.sigortalar;
  }

  sigortaKaydet(aktifKullanici: Kullanici | null, sirket: SigortaSirketi): void {
    if (!this.sigortaKayitYazmaYetkisiVarMi(aktifKullanici)) {
      return;
    }
    const yeniMi = !this.sigortalar.some((s) => s.id === sirket.id);
    this.sigortalar = yeniMi
      ? [sirket, ...this.sigortalar]
      : this.sigortalar.map((s) => (s.id === sirket.id ? sirket : s));
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      yeniMi ? 'Sigorta şirketi kartı oluşturuldu' : 'Sigorta şirketi kartı güncellendi',
      `${sirket.ad} · ${sirket.aktif ? 'Aktif' : 'Pasif'}`
    );
  }

  isletmecileriGetir(): Isletmeci[] {
    return this.isletmeciler;
  }

  isletmeciKaydet(aktifKullanici: Kullanici | null, isletmeci: Isletmeci): void {
    if (!this.tasOcagiMasterYazmaYetkisiVarMi(aktifKullanici, 'isletmeciler')) {
      return;
    }
    const yeniMi = !this.isletmeciler.some((i) => i.id === isletmeci.id);
    this.isletmeciler = yeniMi
      ? [isletmeci, ...this.isletmeciler]
      : this.isletmeciler.map((i) => (i.id === isletmeci.id ? isletmeci : i));
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      yeniMi ? 'Taş ocağı işletmeci kartı oluşturuldu' : 'Taş ocağı işletmeci kartı güncellendi',
      `${isletmeci.ad} · ${isletmeci.tur === 'SAHIS' ? 'Şahıs' : 'Şirket'}`
    );
  }

  tasOcaklariniGetir(): TasOcagi[] {
    return this.tasOcaklari;
  }

  tasOcagiKaydet(aktifKullanici: Kullanici | null, ocak: TasOcagi): void {
    if (!this.tasOcagiMasterYazmaYetkisiVarMi(aktifKullanici, 'tas-ocaklari')) {
      return;
    }
    const yeniMi = !this.tasOcaklari.some((t) => t.id === ocak.id);
    this.tasOcaklari = yeniMi
      ? [ocak, ...this.tasOcaklari]
      : this.tasOcaklari.map((t) => (t.id === ocak.id ? ocak : t));
    const isletmeciAdi = this.isletmeciler.find((i) => i.id === ocak.isletmeciId)?.ad ?? '—';
    this.auditYazDahili(
      this.aktifKullaniciAdi(aktifKullanici),
      yeniMi ? 'Taş ocağı kartı oluşturuldu' : 'Taş ocağı kartı güncellendi',
      `${ocak.ad} · Bağlı işletmeci: ${isletmeciAdi}`
    );
  }

  // --- Mali yıl arşivi ------------------------------------------------------------------

  arsivleriGetir(): MaliYilArsivi[] {
    return this.arsivler;
  }

  manifestOlustur(aktifKullanici: Kullanici | null, yil: number): void {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'arsiv')) {
      return;
    }
    const hash = `sha256:${Math.random().toString(16).slice(2, 14)}…${Math.random().toString(16).slice(2, 6)}`;
    this.arsivler = this.arsivler.map((a) => (a.yil === yil ? { ...a, manifestHash: hash } : a));
    this.auditYazDahili(this.aktifKullaniciAdi(aktifKullanici), 'Arşiv manifest simülasyonu oluşturuldu', `Mali Yıl ${yil}`);
  }

  arsivDogrula(aktifKullanici: Kullanici | null, yil: number): void {
    if (!this.menuYazmaYetkisiVarMi(aktifKullanici, 'arsiv')) {
      return;
    }
    this.arsivler = this.arsivler.map((a) =>
      a.yil === yil ? { ...a, dogrulandi: true, durum: 'Arşivlendi' as const } : a
    );
    this.auditYazDahili(this.aktifKullaniciAdi(aktifKullanici), 'Arşiv bütünlüğü doğrulandı', `Mali Yıl ${yil}`);
  }
}
