import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle2,
  LayoutGrid,
  List,
  Plus,
  Wallet,
  XCircle } from
'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { OzetKart } from '../components/common/OzetKart';
import { BosDurum } from '../components/common/BosDurum';
import { AjandaDurumRozeti, BilgiRozeti } from '../components/common/DurumRozeti';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../components/ui/Select';
import { PatlatmaPlanFormu } from '../components/tasocagi/PatlatmaPlanFormu';
import {
  PatlatmaBaslangici,
  PatlatmaYapildiModali } from
'../components/tasocagi/PatlatmaYapildiModali';
import { PatlatmaSonucModali, SonucTuru } from '../components/tasocagi/PatlatmaSonucModali';
import { useApp } from '../contexts/AppContext';
import { AjandaKaydi } from '../types';
import { bilgiKaynagiEtiketi } from '../utils/patlatma';

type ZamanFiltresi = 'TUMU' | 'BUGUN' | 'YARIN' | 'HAFTA' | 'AY' | 'ARALIK';
type DurumFiltresi =
'TUMU' |
'SONUC_BEKLEYEN' |
'YAPILDI' |
'YAPILMADI' |
'ERTELENDI' |
'IPTAL' |
'KREDI_YETERSIZ';

const ZAMAN_SECENEKLERI: {deger: ZamanFiltresi;etiket: string;}[] = [
{ deger: 'TUMU', etiket: 'Tüm tarihler' },
{ deger: 'BUGUN', etiket: 'Bugün' },
{ deger: 'YARIN', etiket: 'Yarın' },
{ deger: 'HAFTA', etiket: 'Bu hafta' },
{ deger: 'AY', etiket: 'Bu ay' },
{ deger: 'ARALIK', etiket: 'Tarih aralığı' }];


const DURUM_SECENEKLERI: {deger: DurumFiltresi;etiket: string;}[] = [
{ deger: 'TUMU', etiket: 'Tüm durumlar' },
{ deger: 'SONUC_BEKLEYEN', etiket: 'Sonuç bekleyenler' },
{ deger: 'YAPILDI', etiket: 'Yapıldı' },
{ deger: 'YAPILMADI', etiket: 'Yapılmadı' },
{ deger: 'ERTELENDI', etiket: 'Ertelendi' },
{ deger: 'IPTAL', etiket: 'İptal edildi' },
{ deger: 'KREDI_YETERSIZ', etiket: 'Kredi yetersiz' }];


function isoGun(fark: number): string {
  const d = new Date();
  d.setDate(d.getDate() + fark);
  return d.toISOString().slice(0, 10);
}

function haftaSonu(): string {
  return isoGun(7);
}

function ayinSonu(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

/** Taş ocağı işlemlerinin günlük çalışma ekranı. */
export function PatlatmaTakvimi() {
  const {
    kullanici,
    gorunurAjanda,
    ajandaIslemiYapilabilir,
    isletmeciler,
    tasOcaklari,
    krediOzeti
  } = useApp();

  const [planAcik, setPlanAcik] = useState(false);
  const [yapildiBaslangici, setYapildiBaslangici] = useState<PatlatmaBaslangici | null>(null);
  const [sonucTuru, setSonucTuru] = useState<SonucTuru>('YAPILMADI');
  const [sonucKaydi, setSonucKaydi] = useState<AjandaKaydi | null>(null);
  const [gorunum, setGorunum] = useState<'KART' | 'LISTE'>('KART');
  const [zaman, setZaman] = useState<ZamanFiltresi>('TUMU');
  const [durum, setDurum] = useState<DurumFiltresi>('TUMU');
  const [isletmeciFiltre, setIsletmeciFiltre] = useState('TUMU');
  const [ocakFiltre, setOcakFiltre] = useState('TUMU');
  const [baslangicTarihi, setBaslangicTarihi] = useState(isoGun(0));
  const [bitisTarihi, setBitisTarihi] = useState(isoGun(30));

  const patlatmalar = useMemo(
    () => gorunurAjanda.filter((a) => a.bent === 'E' && !!a.isletmeciId),
    [gorunurAjanda]
  );

  const krediYetersizMi = (kayit: AjandaKaydi) => {
    if (kayit.gerceklesmeKayitNo) return false;
    if (kayit.durum === 'İptal Edildi' || kayit.durum === 'Yapılmadı') return false;
    const ozet = krediOzeti(kayit.isletmeciId ?? '');
    return (kayit.planlananAdet ?? 1) > ozet.kalan;
  };

  const sonucBekliyorMu = (kayit: AjandaKaydi) =>
  !kayit.gerceklesmeKayitNo && (
  kayit.durum === 'Planlandı' || kayit.durum === 'Sonuç Bekliyor' || kayit.durum === 'Ertelendi');

  const filtreli = patlatmalar.
  filter((k) => {
    if (isletmeciFiltre !== 'TUMU' && k.isletmeciId !== isletmeciFiltre) return false;
    if (ocakFiltre !== 'TUMU' && k.tasOcagiId !== ocakFiltre) return false;

    if (zaman === 'BUGUN' && k.tarih !== isoGun(0)) return false;
    if (zaman === 'YARIN' && k.tarih !== isoGun(1)) return false;
    if (zaman === 'HAFTA' && (k.tarih < isoGun(0) || k.tarih > haftaSonu())) return false;
    if (zaman === 'AY' && (k.tarih < isoGun(0) || k.tarih > ayinSonu())) return false;
    if (zaman === 'ARALIK' && (k.tarih < baslangicTarihi || k.tarih > bitisTarihi)) return false;

    if (durum === 'SONUC_BEKLEYEN') return sonucBekliyorMu(k);
    if (durum === 'YAPILDI') return k.durum === 'Yapıldı' || k.durum === 'Görev Tamamlandı';
    if (durum === 'YAPILMADI') return k.durum === 'Yapılmadı';
    if (durum === 'ERTELENDI') return k.durum === 'Ertelendi';
    if (durum === 'IPTAL') return k.durum === 'İptal Edildi';
    if (durum === 'KREDI_YETERSIZ') return krediYetersizMi(k);
    return true;
  }).
  sort((a, b) => `${a.tarih}${a.saat}`.localeCompare(`${b.tarih}${b.saat}`));

  const bugunSayisi = patlatmalar.filter((k) => k.tarih === isoGun(0)).length;
  const bekleyenSayisi = patlatmalar.filter(sonucBekliyorMu).length;
  const yapilanSayisi = patlatmalar.filter(
    (k) => k.durum === 'Yapıldı' || k.durum === 'Görev Tamamlandı'
  ).length;
  const kalanKrediToplami = isletmeciler.reduce((t, i) => t + krediOzeti(i.id).kalan, 0);

  if (!kullanici) return null;

  const yapabilir = (kayit: AjandaKaydi) => ajandaIslemiYapilabilir(kayit);
  const sonuclanabilir = (kayit: AjandaKaydi) => sonucBekliyorMu(kayit) && yapabilir(kayit);

  const yapildiAc = (kayit: AjandaKaydi) =>
  setYapildiBaslangici({
    isletmeciId: kayit.isletmeciId ?? '',
    tasOcagiId: kayit.tasOcagiId ?? '',
    planKayitNo: kayit.kayitNo,
    ajandaId: kayit.id,
    tarih: kayit.tarih,
    saat: kayit.saat,
    adet: kayit.planlananAdet ?? 1
  });

  const sonucAc = (kayit: AjandaKaydi, tur: SonucTuru) => {
    setSonucTuru(tur);
    setSonucKaydi(kayit);
  };

  const kartButonlari = (kayit: AjandaKaydi) =>
  <div className="flex flex-wrap gap-1.5">
      <Button size="sm" onClick={() => yapildiAc(kayit)}>
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Yapıldı
      </Button>
      <Button size="sm" variant="outline" onClick={() => sonucAc(kayit, 'YAPILMADI')}>
        Yapılmadı
      </Button>
      <Button size="sm" variant="outline" onClick={() => sonucAc(kayit, 'ERTELENDI')}>
        Ertelendi
      </Button>
      <Button size="sm" variant="ghost" onClick={() => sonucAc(kayit, 'IPTAL')}>
        <XCircle className="h-4 w-4" aria-hidden="true" />
        İptal
      </Button>
    </div>;


  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Patlatma Takvimi"
        aciklama="Taş ocağı patlatmalarının günlük çalışma ekranı. Kredi yalnızca “Yapıldı” işlendiğinde düşer."
        eylem={
        !kullanici.sadeceGoruntule && kullanici.ajandaKullanabilir ?
        <Button onClick={() => setPlanAcik(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Patlatma Planla
            </Button> :
        undefined
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OzetKart etiket="Bugünkü patlatma" deger={String(bugunSayisi)} ikon={CalendarClock} />
        <OzetKart etiket="Sonuç bekleyen" deger={String(bekleyenSayisi)} ikon={CalendarClock} />
        <OzetKart etiket="Yapıldı" deger={String(yapilanSayisi)} ikon={CheckCircle2} />
        <OzetKart
          etiket="Toplam kalan kredi"
          deger={String(kalanKrediToplami)}
          ikon={Wallet}
          altMetin="İşletmeci hesaplarındaki ortak kredi" />
        
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label htmlFor="pt-zaman">Tarih</Label>
            <Select value={zaman} onValueChange={(v) => setZaman(v as ZamanFiltresi)}>
              <SelectTrigger id="pt-zaman" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZAMAN_SECENEKLERI.map((z) =>
                <SelectItem key={z.deger} value={z.deger}>
                    {z.etiket}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pt-durum">Durum</Label>
            <Select value={durum} onValueChange={(v) => setDurum(v as DurumFiltresi)}>
              <SelectTrigger id="pt-durum" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURUM_SECENEKLERI.map((d) =>
                <SelectItem key={d.deger} value={d.deger}>
                    {d.etiket}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pt-isletmeci">İşletmeci</Label>
            <Select
              value={isletmeciFiltre}
              onValueChange={(v) => {
                setIsletmeciFiltre(v);
                setOcakFiltre('TUMU');
              }}>
              
              <SelectTrigger id="pt-isletmeci" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TUMU">Tüm işletmeciler</SelectItem>
                {isletmeciler.map((i) =>
                <SelectItem key={i.id} value={i.id}>
                    {i.ad}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pt-ocak">Taş ocağı</Label>
            <Select value={ocakFiltre} onValueChange={setOcakFiltre}>
              <SelectTrigger id="pt-ocak" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TUMU">Tüm ocaklar</SelectItem>
                {tasOcaklari.
                filter((t) => isletmeciFiltre === 'TUMU' || t.isletmeciId === isletmeciFiltre).
                map((t) =>
                <SelectItem key={t.id} value={t.id}>
                      {t.ad}
                    </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          {zaman === 'ARALIK' &&
          <>
              <div>
                <Label htmlFor="pt-baslangic">Başlangıç</Label>
                <Input
                id="pt-baslangic"
                type="date"
                value={baslangicTarihi}
                onChange={(e) => setBaslangicTarihi(e.target.value)}
                className="mt-1.5" />
              
              </div>
              <div>
                <Label htmlFor="pt-bitis">Bitiş</Label>
                <Input
                id="pt-bitis"
                type="date"
                value={bitisTarihi}
                onChange={(e) => setBitisTarihi(e.target.value)}
                className="mt-1.5" />
              
              </div>
            </>
          }
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">{filtreli.length} patlatma listeleniyor</p>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant={gorunum === 'KART' ? 'default' : 'outline'}
              onClick={() => setGorunum('KART')}>
              
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Kart
            </Button>
            <Button
              size="sm"
              variant={gorunum === 'LISTE' ? 'default' : 'outline'}
              onClick={() => setGorunum('LISTE')}>
              
              <List className="h-4 w-4" aria-hidden="true" />
              Liste
            </Button>
          </div>
        </div>
      </div>

      <KuralNotu baslik="Kredi kuralı">
        Planlama aşamasında kredi düşülmez; yalnız “sonuç bekleyen” olarak izlenir. Kredi, patlatma
        “Yapıldı” olarak işlendiğinde işletmecinin ortak hesabından düşer. Yapılmadı, ertelendi ve
        iptal sonuçlarında kredi düşülmez.
      </KuralNotu>

      {kullanici.sadeceGoruntule &&
      <KuralNotu baslik="Sadece görüntüleme" ton="uyari">
          Bu kullanıcı patlatma planlayamaz ve sonuç işleyemez; yalnız kartları ve detayları
          görebilir.
        </KuralNotu>
      }

      {filtreli.length === 0 ?
      <BosDurum
        baslik="Bu filtrede patlatma bulunmuyor"
        aciklama="Tarih, durum veya işletmeci filtresini değiştirin ya da yeni bir patlatma planlayın." /> :

      gorunum === 'KART' ?
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtreli.map((kayit) => {
          const ozet = krediOzeti(kayit.isletmeciId ?? '');
          const yetersiz = krediYetersizMi(kayit);
          return (
            <article
              key={kayit.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
              
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {kayit.yer || 'Taş ocağı'}
                    </h3>
                    <p className="text-sm text-muted-foreground">İşletmeci: {kayit.talepEden}</p>
                  </div>
                  <AjandaDurumRozeti durum={kayit.durum} />
                </div>

                <p className="text-sm font-medium text-foreground">
                  {kayit.tarih} · {kayit.saat}
                </p>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Planlanan patlatma</dt>
                  <dd className="text-right font-medium text-foreground">
                    {kayit.planlananAdet ?? 1}
                  </dd>
                  <dt className="text-muted-foreground">Kalan kredi</dt>
                  <dd className="text-right font-medium text-foreground">{ozet.kalan}</dd>
                  <dt className="text-muted-foreground">Sonuç bekleyen kredi</dt>
                  <dd className="text-right font-medium text-foreground">{ozet.planlanan}</dd>
                  <dt className="text-muted-foreground">Bilgi kaynağı</dt>
                  <dd className="text-right font-medium text-foreground">
                    {bilgiKaynagiEtiketi(kayit.bilgiKaynagi)}
                  </dd>
                  {kayit.raporNo &&
                <>
                      <dt className="text-muted-foreground">Belge no</dt>
                      <dd className="text-right font-medium text-foreground">{kayit.raporNo}</dd>
                    </>
                }
                </dl>

                {yetersiz && <BilgiRozeti metin="Kredi Yetersiz" ton="hata" />}
                {kayit.sonucNotu &&
              <p className="text-sm text-muted-foreground">{kayit.sonucNotu}</p>
              }

                <div className="mt-auto space-y-2 border-t border-border pt-3">
                  {sonuclanabilir(kayit) && kartButonlari(kayit)}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {kayit.kayitNo}
                      {kayit.gerceklesmeKayitNo ? ` → ${kayit.gerceklesmeKayitNo}` : ''}
                    </span>
                    <Link
                    to={`/kayitlar/${kayit.kayitNo}`}
                    className="text-sm font-medium text-primary hover:underline">
                    
                      Detay
                    </Link>
                  </div>
                </div>
              </article>);

        })}
        </div> :

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Saat</th>
                <th className="px-4 py-3 font-medium">İşletmeci</th>
                <th className="px-4 py-3 font-medium">Taş ocağı</th>
                <th className="px-4 py-3 font-medium">Adet</th>
                <th className="px-4 py-3 font-medium">Kalan kredi</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Son işlem</th>
                <th className="px-4 py-3 text-right font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtreli.map((kayit) => {
              const ozet = krediOzeti(kayit.isletmeciId ?? '');
              return (
                <tr key={kayit.id} className="align-top">
                    <td className="px-4 py-3 text-foreground">{kayit.tarih}</td>
                    <td className="px-4 py-3 text-foreground">{kayit.saat}</td>
                    <td className="px-4 py-3 text-foreground">{kayit.talepEden}</td>
                    <td className="px-4 py-3 text-foreground">{kayit.yer}</td>
                    <td className="px-4 py-3 text-foreground">{kayit.planlananAdet ?? 1}</td>
                    <td className="px-4 py-3 text-foreground">{ozet.kalan}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <AjandaDurumRozeti durum={kayit.durum} />
                        {krediYetersizMi(kayit) &&
                      <BilgiRozeti metin="Kredi Yetersiz" ton="hata" />
                      }
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {kayit.sonucNotu || kayit.odemeDurumu}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-end gap-2">
                        {sonuclanabilir(kayit) && kartButonlari(kayit)}
                        <Link
                        to={`/kayitlar/${kayit.kayitNo}`}
                        className="text-sm font-medium text-primary hover:underline">
                        
                          Detay
                        </Link>
                      </div>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }

      <PatlatmaPlanFormu acik={planAcik} kapat={() => setPlanAcik(false)} />
      <PatlatmaYapildiModali
        acik={!!yapildiBaslangici}
        kapat={() => setYapildiBaslangici(null)}
        baslangic={yapildiBaslangici} />
      
      <PatlatmaSonucModali
        acik={!!sonucKaydi}
        kapat={() => setSonucKaydi(null)}
        tur={sonucTuru}
        kayit={sonucKaydi} />
      
    </div>);

}