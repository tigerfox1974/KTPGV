import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Circle, Printer, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { BosDurum } from '../components/common/BosDurum';
import { KuralNotu } from '../components/common/KuralNotu';
import { YetkisizUyari } from '../components/common/YetkiKapisi';
import { BilgiRozeti, IslemDurumRozeti } from '../components/common/DurumRozeti';
import { DosyaKarti } from '../components/islem/DosyaKarti';
import { DosyaOnizlemeModal } from '../components/islem/DosyaOnizlemeModal';
import { MakbuzModal } from '../components/islem/MakbuzModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ParaInput } from '../components/ui/ParaInput';
import { Textarea } from '../components/ui/Textarea';
import { useApp } from '../contexts/AppContext';
import { DekontDosyasi, Islem, IslemDurumu } from '../types';
import { formatTL, formatTarih, formatTarihSaat } from '../utils/currency';
import { BENT_ORANLARI } from '../utils/hesaplama';
import { dosyaSec } from '../utils/dosya';

/** Kayıt durumunun mantıksal ilerleme çizgisi — geçmiş ve güncel durum ayrı gösterilir. */
const DURUM_AKISI: {durum: IslemDurumu | 'ARSIVLENDI';etiket: string;}[] = [
{ durum: 'ODEME_BEKLIYOR', etiket: 'Ödeme doğrulama bekliyor' },
{ durum: 'ODEME_DOGRULANDI', etiket: 'Ödeme doğrulandı' },
{ durum: 'MAKBUZ_BEKLIYOR', etiket: 'Makbuz bekliyor' },
{ durum: 'ISLEM_BASLATILABILIR', etiket: 'Makbuz kesildi · İşlem başlatılabilir' },
{ durum: 'TAMAMLANDI', etiket: 'İşlem tamamlandı' },
{ durum: 'ARSIVLENDI', etiket: 'Arşivlendi' }];


function asamaDurumu(islem: Islem, asama: IslemDurumu | 'ARSIVLENDI'): 'gecmis' | 'guncel' | 'bekleyen' {
  if (islem.durum === 'IPTAL') return asama === 'ODEME_BEKLIYOR' ? 'gecmis' : 'bekleyen';
  const sira = DURUM_AKISI.findIndex((a) => a.durum === asama);
  const mevcutSira = DURUM_AKISI.findIndex((a) => a.durum === islem.durum);
  if (mevcutSira === -1) return 'bekleyen';
  if (sira < mevcutSira) return 'gecmis';
  if (sira === mevcutSira) return 'guncel';
  return 'bekleyen';
}

function Bolum({
  baslik,
  aciklama,
  children




}: {baslik: string;aciklama?: string;children: React.ReactNode;}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">{baslik}</h2>
      {aciklama && <p className="mt-0.5 text-sm text-muted-foreground">{aciklama}</p>}
      <div className="mt-4">{children}</div>
    </section>);

}

function Satir({ etiket, deger, mono }: {etiket: string;deger?: React.ReactNode;mono?: boolean;}) {
  return (
    <>
      <dt className="text-muted-foreground">{etiket}</dt>
      <dd className={`text-foreground ${mono ? 'font-mono text-xs' : ''}`}>{deger ?? '—'}</dd>
    </>);

}

export function KayitDetay() {
  const { kayitNo } = useParams();
  const navigate = useNavigate();
  const {
    islemBul,
    islemler,
    islemGorulebilir,
    bau,
    auditKayitlari,
    auditEkle,
    sigortaBul,
    isletmeciBul,
    tasOcagiBul,
    krediOzeti,
    krediHareketleri,
    fazlaOdemeIadeIsle
  } = useApp();
  const [onizleme, setOnizleme] = useState<DekontDosyasi | null>(null);
  const [makbuzAcik, setMakbuzAcik] = useState(false);
  const [iadeFormAcik, setIadeFormAcik] = useState(false);
  const [iadeTutar, setIadeTutar] = useState<number | null>(null);
  const [iadeTarihi, setIadeTarihi] = useState('');
  const [iadeYapilan, setIadeYapilan] = useState('');
  const [iadeBanka, setIadeBanka] = useState('');
  const [iadeDekontNo, setIadeDekontNo] = useState('');
  const [iadeDosya, setIadeDosya] = useState<DekontDosyasi | null>(null);
  const [iadeAciklama, setIadeAciklama] = useState('');

  const islem = islemBul(kayitNo);

  const iadeKaydet = () => {
    if (!islem || !iadeDosya) return;
    const sonuc = fazlaOdemeIadeIsle({
      islemId: islem.id,
      iadeTutar: iadeTutar ?? 0,
      iadeDekontTarihi: iadeTarihi,
      iadeYapilan: iadeYapilan.trim(),
      iadeBankaBilgisi: iadeBanka.trim(),
      iadeDekontNo: iadeDekontNo.trim(),
      iadeDekontDosyasi: iadeDosya,
      iadeAciklama: iadeAciklama.trim()
    });
    if (!sonuc.basarili) {
      toast.error('İade işlenemedi', { description: sonuc.mesaj });
      return;
    }
    toast.success('Fazla ödeme iadesi işlendi', { description: `${islem.kayitNo} · ${formatTL(iadeTutar ?? 0)}` });
    setIadeFormAcik(false);
  };

  if (!islem) {
    return (
      <div className="space-y-6">
        <PageHeader baslik="Kayıt Detayı" />
        <BosDurum
          baslik="Kayıt bulunamadı"
          aciklama="Aradığınız kayıt numarası sistemde bulunmuyor." />
        
        <Button variant="outline" onClick={() => navigate('/kayitlar')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kayıtlara dön
        </Button>
      </div>);

  }

  // Adres elle yazılsa bile yetkisiz kaydın içeriği gösterilmez.
  if (!islemGorulebilir(islem)) {
    return (
      <div className="space-y-6">
        <PageHeader baslik="Kayıt Detayı" />
        <YetkisizUyari
          baslik="Bu kaydı görüntüleme yetkiniz yok"
          aciklama="Kayıt yalnızca ilgili birim, yetkili bent ve rol kapsamındaki kullanıcılara gösterilir. Kayıt silinmemiştir." />
        
        <Button variant="outline" onClick={() => navigate('/kayitlar')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kayıtlara dön
        </Button>
      </div>);

  }

  const trafik = islem.fAltTur === 'TRAFIK';
  const isletmeci = isletmeciBul(islem.isletmeciId);
  const ozet = isletmeci ? krediOzeti(isletmeci.id) : null;
  const oran = BENT_ORANLARI[islem.bent];

  const ilgiliAudit = auditKayitlari.filter(
    (a) => a.hedef.includes(islem.kayitNo) || islem.makbuzNo && a.hedef.includes(islem.makbuzNo)
  );

  // E bendi: bu kredi yükleme kaydına bağlı plan ve gerçekleşme kayıtları
  const bagliPlanlar = isletmeci ?
  islemler.filter((i) => i.isletmeciId === isletmeci.id && i.eIslemTuru === 'KREDI_PLANLAMA') :
  [];
  const bagliGerceklesmeler = isletmeci ?
  islemler.filter((i) => i.isletmeciId === isletmeci.id && i.eIslemTuru === 'KREDI_GERCEKLESME') :
  [];
  const isletmeciHareketleri = isletmeci ?
  krediHareketleri.filter((h) => h.isletmeciId === isletmeci.id) :
  [];

  const islemTuruEtiketi = islem.eIslemTuru ?
  islem.eIslemTuru === 'KREDI_YUKLEME' ?
  'Patlatma kredisi yükleme (mali kayıt)' :
  islem.eIslemTuru === 'KREDI_PLANLAMA' ?
  'Patlatma planı (operasyonel kayıt)' :
  'Patlatma sonucu — Yapıldı (kredi düşüm kaydı)' :
  islem.fAltTur ?
  trafik ?
  'Trafik polis raporu — TTRF ana kaydı' :
  'Adli polis raporu' :
  'Gelir / tahsilat kaydı';

  return (
    <div className="space-y-6">
      <PageHeader
        baslik={islem.kayitNo}
        aciklama={islem.baslik}
        eylem={
        <>
            <Button variant="outline" onClick={() => navigate('/kayitlar')}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kayıtlara dön
            </Button>
            {islem.makbuzNo &&
          <Button
            onClick={() => {
              setMakbuzAcik(true);
              auditEkle('Makbuz görüntülendi', islem.makbuzNo);
            }}>
            
                <Receipt className="h-4 w-4" aria-hidden="true" />
                Makbuzu görüntüle
              </Button>
          }
          </>
        } />
      

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Bolum baslik="1. Kayıt özeti">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <Satir etiket="Kayıt no" deger={islem.kayitNo} mono />
              <Satir etiket="Bent" deger={islem.bent} />
              <Satir
                etiket="Alt tür"
                deger={islem.fAltTur ? trafik ? 'Trafik Polis Raporu' : 'Adli Polis Raporu' : '—'} />
              
              <Satir etiket="İşlem türü" deger={islemTuruEtiketi} />
              <Satir etiket="Durum" deger={<IslemDurumRozeti durum={islem.durum} />} />
              <Satir etiket="Talep eden" deger={islem.talepEden} />
              <Satir etiket="Birim" deger={islem.birim} />
              <Satir etiket="Oluşturan kullanıcı" deger={islem.olusturan} />
              <Satir etiket="Oluşturma tarihi" deger={formatTarih(islem.olusturmaTarihi)} />
            </dl>
          </Bolum>

          <Bolum
            baslik="2. İşlem / operasyon bilgisi"
            aciklama="Operasyon tarihi ajandayı besler; dekont tarihinden bağımsızdır.">
            
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <Satir etiket="İşlem konusu" deger={islem.baslik} />
              <Satir
                etiket="Operasyon tarihi"
                deger={islem.operasyonTarihi ? formatTarih(islem.operasyonTarihi) : '—'} />
              
              <Satir etiket="Operasyon saati" deger={islem.operasyonSaati ?? '—'} />
              <Satir etiket="Yer / adres" deger={islem.yer ?? '—'} />
              {islem.etkinlikAdi && <Satir etiket="Etkinlik / faaliyet" deger={islem.etkinlikAdi} />}
              {islem.polisSayisi !== undefined &&
              <Satir etiket="Polis sayısı" deger={`${islem.polisSayisi} kişi`} />
              }
              {islem.gorevSuresi !== undefined &&
              <Satir etiket="Görev süresi" deger={`${islem.gorevSuresi} saat`} />
              }
              {islem.sigortaSirketiId &&
              <Satir etiket="Sigorta şirketi" deger={sigortaBul(islem.sigortaSirketiId)?.ad} />
              }
              {isletmeci && <Satir etiket="İşletmeci / sahip" deger={isletmeci.ad} />}
              {islem.tasOcagiId &&
              <Satir etiket="Taş ocağı" deger={tasOcagiBul(islem.tasOcagiId)?.ad} />
              }
              {islem.raporNo && <Satir etiket="Gelen rapor no" deger={islem.raporNo} mono />}
              {islem.bildiren && <Satir etiket="Raporu bildiren" deger={islem.bildiren} />}
              {islem.notlar && <Satir etiket="Açıklama / not" deger={islem.notlar} />}
            </dl>
          </Bolum>

          <Bolum baslik="3. Hesaplama bilgisi" aciklama={`Yasa 57/2026 Madde 6 · BAÜ: ${formatTL(bau)}`}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <Satir etiket="BAÜ" deger={formatTL(bau)} />
              <Satir
                etiket="Oran"
                deger={oran ? `%${(oran * 100).toString().replace('.', ',')}` : 'Sabit oran yok'} />
              
              <Satir
                etiket="Adet / kredi"
                deger={
                islem.krediAdedi ?
                `${islem.krediAdedi} kredi` :
                islem.altBasvurular ?
                `${islem.altBasvurular.length} rapor` :
                islem.adliRaporlar ?
                `${islem.adliRaporlar.length} rapor` :
                '—'
                } />
              
              <Satir etiket="Toplam tutar" deger={formatTL(islem.tutar)} />
            </dl>
            <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {islem.hesaplamaAciklamasi}
            </p>
          </Bolum>

          <Bolum baslik="4. Dekont bilgisi">
            {islem.dekont.dosya || islem.dekont.tarih ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <Satir etiket="Dekont no" deger={islem.dekont.dekontNo} mono />
                  <Satir etiket="Banka" deger={islem.dekont.banka} />
                  <Satir
                    etiket="Dekont tarihi"
                    deger={islem.dekont.tarih ? formatTarih(islem.dekont.tarih) : '—'}
                  />
                  <Satir etiket="Ödenen tutar" deger={formatTL(islem.dekont.odenenTutar)} />
                  <Satir etiket="Ödeme yapan" deger={islem.dekont.odemeYapan} />
                </dl>

                {islem.dekont.dosya ? (
                  <DosyaKarti
                    dosya={islem.dekont.dosya}
                    goruntule={() => {
                      const dekontDosya = islem.dekont.dosya;
                      if (!dekontDosya) return;
                      setOnizleme(dekontDosya);
                      auditEkle('Dekont dosyası görüntülendi', dekontDosya.ad);
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Bu kayıt için ayrı dekont dosyası yoktur.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Bu kayıt ödeme doğurmaz. Ödeme ve dekont, işletmecinin patlatma kredisi yükleme
                (EKRD) kaydındadır; kullanım için yeniden dekont istenmez.
              </p>
            )}

            {islem.raporDosyasi && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground">Patlatma belge / rapor dosyası</p>
                <div className="mt-2">
                  <DosyaKarti
                    dosya={islem.raporDosyasi}
                    goruntule={() => {
                      const raporDosya = islem.raporDosyasi;
                      if (raporDosya) setOnizleme(raporDosya);
                    }}
                  />
                </div>
              </div>
            )}
          </Bolum>

          {(islem.dekonttaOdenenTutar !== undefined || islem.fazlaOdemeTutar) &&
          <Bolum baslik="Fazla ödeme / iade / mahsup bilgisi">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                <Satir etiket="Dekontta ödenen" deger={formatTL(islem.dekonttaOdenenTutar ?? islem.dekont.odenenTutar)} />
                <Satir etiket="Krediye mahsup edilen" deger={formatTL(islem.krediyeMahsupEdilenTutar ?? islem.tutar)} />
                <Satir etiket="Fazla ödeme" deger={formatTL(islem.fazlaOdemeTutar ?? 0)} />
                <Satir
                etiket="Durum"
                deger={
                islem.fazlaOdemeDurumu === 'IADE_BEKLIYOR' ? 'İade bekliyor' :
                islem.fazlaOdemeDurumu === 'IADE_EDILDI' ? 'İade edildi' :
                islem.fazlaOdemeDurumu === 'MAHSUP_BAKIYESI' ? 'Mahsup bakiyesi' :
                islem.fazlaOdemeDurumu === 'MAHSUP_EDILDI' ? 'Mahsup edildi' :
                islem.fazlaOdemeDurumu === 'KARAR_BEKLIYOR' ? 'Karar bekliyor' :
                '—'
                } />
                <Satir etiket="İade dekontu" deger={islem.iadeDekontNo ?? '—'} mono={!!islem.iadeDekontNo} />
                <Satir etiket="İade tutarı" deger={islem.iadeTutar ? formatTL(islem.iadeTutar) : '—'} />
                <Satir etiket="Mahsup kullanılan" deger={islem.mahsupKullanilanTutar ? formatTL(islem.mahsupKullanilanTutar) : '—'} />
                <Satir etiket="Mahsup kaynağı" deger={islem.mahsupKaynakKayitNo ?? '—'} mono={!!islem.mahsupKaynakKayitNo} />
                <Satir etiket="Mahsup hedefi" deger={islem.mahsupHedefKayitNo ?? '—'} mono={!!islem.mahsupHedefKayitNo} />
              </dl>
              {islem.iadeDekontDosyasi &&
              <div className="mt-4">
                  <DosyaKarti
                  dosya={islem.iadeDekontDosyasi}
                  goruntule={() => setOnizleme(islem.iadeDekontDosyasi ?? null)} />
                </div>
              }
              <p className="mt-3 text-sm text-muted-foreground">
                Fazla ödeme patlatma kredisi değildir; iade edilebilir veya sonraki ödemeye mahsup edilebilir.
              </p>
              {islem.fazlaOdemeDurumu === 'IADE_BEKLIYOR' &&
              <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">İade işlemi</p>
                    <Button size="sm" variant="outline" onClick={() => setIadeFormAcik(!iadeFormAcik)}>
                      İade işle
                    </Button>
                  </div>
                  {iadeFormAcik &&
                  <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="iade-tutar">İade tutarı</Label>
                        <ParaInput
                        id="iade-tutar"
                        value={iadeTutar}
                        onValueChange={setIadeTutar}
                        className="mt-1.5"
                        aria-invalid={(iadeTutar ?? 0) > (islem.fazlaOdemeTutar ?? 0)} />
                      </div>
                      <div>
                        <Label htmlFor="iade-tarih">İade tarihi</Label>
                        <Input id="iade-tarih" type="date" value={iadeTarihi} onChange={(e) => setIadeTarihi(e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="iade-yapilan">İade yapılan kişi / kurum</Label>
                        <Input id="iade-yapilan" value={iadeYapilan} onChange={(e) => setIadeYapilan(e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="iade-banka">İade banka bilgisi</Label>
                        <Input id="iade-banka" value={iadeBanka} onChange={(e) => setIadeBanka(e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="iade-dekont-no">İade dekont no</Label>
                        <Input id="iade-dekont-no" value={iadeDekontNo} onChange={(e) => setIadeDekontNo(e.target.value)} className="mt-1.5" />
                      </div>
                      <div className="flex items-end">
                        <Button
                        type="button"
                        variant="outline"
                        onClick={() => dosyaSec('PERSONEL', setIadeDosya)}>
                          İade dekont dosyası seç
                        </Button>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="iade-aciklama">Açıklama</Label>
                        <Textarea id="iade-aciklama" value={iadeAciklama} onChange={(e) => setIadeAciklama(e.target.value)} rows={2} className="mt-1.5" />
                      </div>
                      {iadeDosya &&
                      <div className="sm:col-span-2">
                          <DosyaKarti dosya={iadeDosya} goruntule={() => setOnizleme(iadeDosya)} kaldir={() => setIadeDosya(null)} />
                        </div>
                      }
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                        <Button
                        onClick={iadeKaydet}
                        disabled={
                        !iadeDosya ||
                        !iadeTarihi ||
                        !iadeYapilan.trim() ||
                        !iadeBanka.trim() ||
                        !iadeDekontNo.trim() ||
                        (iadeTutar ?? 0) <= 0 ||
                        (iadeTutar ?? 0) > (islem.fazlaOdemeTutar ?? 0)
                        }>
                          İadeyi tamamla
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          İade tutarı fazla ödeme tutarından büyük olamaz; iade dekont dosyası olmadan iade tamamlanmaz.
                        </p>
                      </div>
                    </div>
                  }
                </div>
              }
            </Bolum>
          }

          <Bolum baslik="5. Makbuz / ödeme belgesi">
            {islem.makbuzNo ? (
              <div className="space-y-3">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  <Satir etiket="Makbuz no" deger={islem.makbuzNo} mono />
                  <Satir etiket="Makbuz tarihi" deger={formatTarih(islem.olusturmaTarihi)} />
                  <Satir etiket="Makbuzu oluşturan" deger={islem.makbuzUreten ?? '—'} />
                  <Satir etiket="Makbuz durumu" deger={<BilgiRozeti metin="Kesildi" ton="olumlu" />} />
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMakbuzAcik(true);
                      auditEkle('Makbuz görüntülendi', islem.makbuzNo);
                    }}
                  >
                    <Receipt className="h-4 w-4" aria-hidden="true" />
                    Görüntüle
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    Yazdır
                  </Button>
                </div>
              </div>
            ) : islem.eIslemTuru === 'KREDI_PLANLAMA' || islem.eIslemTuru === 'KREDI_GERCEKLESME' ? (
              <p className="text-sm text-muted-foreground">
                Bu patlatma kaydı, EKRD kredi yükleme kaydında önceden ödenmiş krediden karşılanır.
                Bu nedenle her kullanım için ayrı makbuz üretilmez.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Bu kayda henüz makbuz üretilmemiştir. Makbuz üretimi Ödeme / Makbuz ekranından
                yetkili kullanıcı tarafından yapılır; makbuz numarası sistem tarafından üretilir.
              </p>
            )}
          </Bolum>

          <Bolum
            baslik="6. Durum geçmişi"
            aciklama="Geçmiş aşamalar tamamlanmış, güncel durum işaretli, sonrası bekleyen olarak gösterilir.">
            
            <ol className="space-y-2">
              {DURUM_AKISI.map((asama) => {
                const konum = asamaDurumu(islem, asama.durum);
                return (
                  <li key={asama.durum} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      konum === 'gecmis' ?
                      'border-emerald-200 bg-emerald-50 text-emerald-700' :
                      konum === 'guncel' ?
                      'border-primary bg-primary text-primary-foreground' :
                      'border-border bg-muted text-muted-foreground'}`
                      }>
                      
                      {konum === 'bekleyen' ?
                      <Circle className="h-3 w-3" aria-hidden="true" /> :

                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      }
                    </span>
                    <span
                      className={
                      konum === 'guncel' ?
                      'font-medium text-foreground' :
                      konum === 'gecmis' ?
                      'text-foreground' :
                      'text-muted-foreground'
                      }>
                      
                      {asama.etiket}
                    </span>
                    {konum === 'guncel' && <BilgiRozeti metin="Güncel durum" ton="olumlu" />}
                    {konum === 'gecmis' && <BilgiRozeti metin="Geçmiş" />}
                  </li>);

              })}
              {islem.durum === 'IPTAL' &&
              <li className="flex items-center gap-3 text-sm text-rose-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-rose-200 bg-rose-50">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  İptal edildi
                </li>
              }
            </ol>
          </Bolum>

          <Bolum baslik="7. Audit geçmişi" aciklama="Bu kayda ilişkin sistem hareketleri.">
            {ilgiliAudit.length ?
            <ul className="space-y-2 text-sm">
                {ilgiliAudit.map((a) =>
              <li key={a.id} className="border-b border-border pb-2 last:border-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{a.eylem}</span>
                      <span className="font-mono text-xs text-muted-foreground">{a.zaman}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.kullanici} · {a.hedef}
                    </p>
                  </li>
              )}
              </ul> :

            <p className="text-sm text-muted-foreground">
                Bu kayıt için audit hareketi bulunmuyor.
              </p>
            }
          </Bolum>

          {(islem.altBasvurular || islem.adliRaporlar || isletmeci) &&
          <Bolum baslik="8. Alt kayıtlar / ilişkili kayıtlar">
              {islem.altBasvurular &&
            <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Ana TTRF kaydı {islem.kayitNo} · {islem.altBasvurular.length} rapor
                  </p>
                  <ul className="space-y-2 text-sm">
                    {islem.altBasvurular.map((alt, i) =>
                <li key={alt.no} className="rounded-lg border border-border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-foreground">
                            {i === 0 ? 'Rapor bilgisi' : `Ek rapor ${i + 1}`}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">{alt.no}</span>
                        </div>
                        <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                          <Satir etiket="Plaka" deger={alt.plaka} />
                          <Satir etiket="Hasar / dosya no" deger={alt.hasarDosyaNo} />
                          <Satir etiket="Kaza tarihi" deger={formatTarih(alt.kazaTarihi)} />
                          <Satir etiket="Rapor tutarı" deger={formatTL(alt.raporTutari)} />
                          <Satir etiket="Rapor konusu" deger={alt.raporKonusu} />
                        </dl>
                      </li>
                )}
                  </ul>
                  <KuralNotu>
                    Ek raporlara ayrı makbuz kesilmez; ödeme, dekont ve makbuz ana TTRF kaydına
                    bağlıdır.
                  </KuralNotu>
                </div>
            }

              {islem.adliRaporlar &&
            <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {islem.adliRaporlar.length} adli rapor
                  </p>
                  <ul className="space-y-2 text-sm">
                    {islem.adliRaporlar.map((rapor, i) =>
                <li key={rapor.no} className="rounded-lg border border-border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-foreground">
                            {i === 0 ? 'Adli rapor bilgisi' : `Ek adli rapor ${i + 1}`}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">{rapor.no}</span>
                        </div>
                        <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                          <Satir etiket="Başvuran" deger={rapor.basvuran} />
                          <Satir etiket="Dosya / referans no" deger={rapor.dosyaNo} />
                          <Satir etiket="Olay tarihi" deger={formatTarih(rapor.olayTarihi)} />
                          <Satir etiket="Rapor tutarı" deger={formatTL(rapor.raporTutari)} />
                          <Satir etiket="Rapor konusu" deger={rapor.raporKonusu} />
                        </dl>
                      </li>
                )}
                  </ul>
                </div>
            }

              {isletmeci && ozet &&
            <div className="space-y-3">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                    <Satir etiket="İşletmeci" deger={isletmeci.ad} />
                    <Satir etiket="Yüklenen kredi" deger={`${ozet.yuklenen}`} />
                    <Satir etiket="Kullanılan kredi" deger={`${ozet.kullanilan}`} />
                    <Satir etiket="Kalan kredi" deger={`${ozet.kalan}`} />
                  </dl>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium text-foreground">
                        Planlı patlatmalar (EKPL)
                      </p>
                      {bagliPlanlar.length ?
                  <ul className="mt-1.5 space-y-1 text-xs">
                          {bagliPlanlar.map((p) =>
                    <li key={p.id}>
                              <Link
                        to={`/kayitlar/${p.kayitNo}`}
                        className="font-mono text-primary hover:underline">
                        
                                {p.kayitNo}
                              </Link>{' '}
                              <span className="text-muted-foreground">
                                {tasOcagiBul(p.tasOcagiId)?.ad} ·{' '}
                                {p.operasyonTarihi ? formatTarihSaat(p.operasyonTarihi, p.operasyonSaati) : '—'} ·{' '}
                                {p.krediAdedi} kredi
                              </span>
                            </li>
                    )}
                        </ul> :

                  <p className="mt-1 text-xs text-muted-foreground">Planlı patlatma yok.</p>
                  }
                    </div>

                    <div className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium text-foreground">
                        Yapılan patlatmalar (kredi düşüm kayıtları)
                      </p>
                      {bagliGerceklesmeler.length ?
                  <ul className="mt-1.5 space-y-1 text-xs">
                          {bagliGerceklesmeler.map((g) =>
                    <li key={g.id}>
                              <Link
                        to={`/kayitlar/${g.kayitNo}`}
                        className="font-mono text-primary hover:underline">
                        
                                {g.kayitNo}
                              </Link>{' '}
                              <span className="text-muted-foreground">
                                {tasOcagiBul(g.tasOcagiId)?.ad} · Belge {g.raporNo ?? '—'} · -
                                {g.krediAdedi} kredi
                              </span>
                            </li>
                    )}
                        </ul> :

                  <p className="mt-1 text-xs text-muted-foreground">
                          Yapıldı olarak işlenmiş patlatma yok.
                        </p>
                  }
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">Kredi hareketleri</p>
                    <ul className="mt-1.5 space-y-1 text-xs">
                      {isletmeciHareketleri.map((h) =>
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-foreground">{h.kayitNo}</span>
                          <span
                      className={
                      h.tip === 'YUKLEME' ?
                      'text-emerald-700' :
                      h.tip === 'PLAN' ?
                      'text-amber-700' :
                      'text-rose-700'
                      }>
                      
                            {h.tip === 'YUKLEME' ? '+' : h.tip === 'PLAN' ? '~' : '-'}
                            {h.adet} kredi · {formatTarih(h.tarih)}
                          </span>
                        </li>
                  )}
                    </ul>
                  </div>

                  <KuralNotu>
                    Bu patlatma kullanımları, EKRD kredi yükleme kaydında önceden ödenmiş krediden
                    karşılanır. Bu nedenle her kullanım için ayrı makbuz üretilmez. Kredi taş
                    ocağına değil işletmecinin ortak hesabına bağlıdır.
                  </KuralNotu>
                </div>
            }
            </Bolum>
          }
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">Hızlı özet</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
              <Satir etiket="Tutar" deger={formatTL(islem.tutar)} />
              <Satir etiket="Makbuz" deger={islem.makbuzNo ?? 'Yok'} mono />
              <Satir etiket="Dekont" deger={islem.dekont.dekontNo} mono />
              <Satir etiket="Durum" deger={<IslemDurumRozeti durum={islem.durum} />} />
            </dl>
          </div>
          <KuralNotu baslik="Numara kuralı">
            Kayıt ve makbuz numaraları merkezi sistem tarafından üretilir; kullanıcı tarafından elle
            yazılamaz.
          </KuralNotu>
        </aside>
      </div>

      <DosyaOnizlemeModal dosya={onizleme} acik={!!onizleme} kapat={() => setOnizleme(null)} />
      <MakbuzModal islem={islem} acik={makbuzAcik} kapat={() => setMakbuzAcik(false)} />
    </div>);

}