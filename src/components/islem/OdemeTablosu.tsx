import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronDown, ChevronRight, Eye, Receipt } from 'lucide-react';
import { Button } from '../ui/Button';
import { BilgiRozeti, IslemDurumRozeti } from '../common/DurumRozeti';
import { BosDurum } from '../common/BosDurum';
import { KrediYuklemeTalepPaneli } from './KrediYuklemeTalepPaneli';
import { useApp } from '../../contexts/AppContext';
import { DekontDosyasi, Islem } from '../../types';
import { formatTL, formatTarih } from '../../utils/currency';
import { krediYuklemeKaydiniCozumle } from '../../utils/krediYukleme';
import { patlatmaBedeli } from '../../utils/hesaplama';

/** EKRD kredi yükleme kaydının bağlı patlatma hareketleri — ana tabloyu kirletmeden detayda. */
function KrediYuklemeDetayi({
  islem,
  dosyaGoruntule,
  makbuzGoruntule,
  makbuzUret,
  makbuzUretilebilir,
  odemeDogrula,
  odemeDogrulanabilir
}: {
  islem: Islem;
  dosyaGoruntule: (dosya: DekontDosyasi) => void;
  makbuzGoruntule: (islem: Islem) => void;
  makbuzUret: (islem: Islem) => void;
  makbuzUretilebilir: (islem: Islem) => boolean;
  odemeDogrula: (islem: Islem, dekontId?: string) => void;
  odemeDogrulanabilir: (islem: Islem) => boolean;
}) {
  const { islemler, krediHareketleri, tasOcagiBul } = useApp();
  if (!islem.isletmeciId) return null;
  const planlar = islemler.filter(
    (i) => i.isletmeciId === islem.isletmeciId && i.eIslemTuru === 'KREDI_PLANLAMA'
  );
  const gerceklesenler = islemler.filter(
    (i) => i.isletmeciId === islem.isletmeciId && i.eIslemTuru === 'KREDI_GERCEKLESME'
  );
  const hareketler = krediHareketleri.filter((h) => h.isletmeciId === islem.isletmeciId);

  return (
    <div className="space-y-3">
      <KrediYuklemeTalepPaneli
        islem={islem}
        dosyaGoruntule={dosyaGoruntule}
        makbuzGoruntule={() => makbuzGoruntule(islem)}
        makbuzUret={() => makbuzUret(islem)}
        makbuzUretilebilir={makbuzUretilebilir(islem)}
        odemeDogrula={(dekontId) => odemeDogrula(islem, dekontId)}
        odemeDogrulanabilir={odemeDogrulanabilir(islem)} />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs font-medium text-foreground">Bağlı planlı patlatmalar</p>
          {planlar.length ?
          <ul className="mt-1.5 space-y-1 text-xs">
              {planlar.map((p) =>
            <li key={p.id} className="text-muted-foreground">
                  <Link to={`/kayitlar/${p.kayitNo}`} className="font-mono text-primary hover:underline">
                    {p.kayitNo}
                  </Link>{' '}
                  {tasOcagiBul(p.tasOcagiId)?.ad} · {p.krediAdedi} kredi
                </li>
            )}
            </ul> :

          <p className="mt-1 text-xs text-muted-foreground">Planlı patlatma yok.</p>
          }
        </div>

        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs font-medium text-foreground">Bağlı yapılan patlatmalar</p>
          {gerceklesenler.length ?
          <ul className="mt-1.5 space-y-1 text-xs">
              {gerceklesenler.map((g) =>
            <li key={g.id} className="text-muted-foreground">
                  <Link to={`/kayitlar/${g.kayitNo}`} className="font-mono text-primary hover:underline">
                    {g.kayitNo}
                  </Link>{' '}
                  {tasOcagiBul(g.tasOcagiId)?.ad} · -{g.krediAdedi} kredi
                </li>
            )}
            </ul> :

          <p className="mt-1 text-xs text-muted-foreground">Yapılan patlatma yok.</p>
          }
        </div>

        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs font-medium text-foreground">Kredi hareketleri</p>
          <ul className="mt-1.5 space-y-1 text-xs">
            {hareketler.map((h) =>
            <li key={h.id} className="flex justify-between gap-2 text-muted-foreground">
                <span className="font-mono">{h.kayitNo}</span>
                <span>
                  {h.tip === 'YUKLEME' ? '+' : h.tip === 'PLAN' ? '~' : '-'}
                  {h.adet}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Doğrulanan dekontların ürettiği kullanılabilir krediler işletmecinin ortak hesabına yazılır.
        Patlatma plan ve kullanım kayıtlarında yeniden makbuz kesilmez.
      </p>
    </div>);

}

interface OdemeTablosuProps {
  islemler: Islem[];
  /** Kayıt bazlı makbuz üretme yetkisi (rol + birim + bent + kayıt durumu). */
  makbuzUretilebilir: (islem: Islem) => boolean;
  /** Kayıt bazlı ödeme doğrulama yetkisi. */
  odemeDogrulanabilir: (islem: Islem) => boolean;
  dosyaGoruntule: (dosya: DekontDosyasi) => void;
  makbuzGoruntule: (islem: Islem) => void;
  makbuzUret: (islem: Islem) => void;
  odemeDogrula: (islem: Islem, dekontId?: string) => void;
}

function bentEtiketi(islem: Islem): string {
  if (islem.bent === 'E' && islem.eIslemTuru === 'KREDI_YUKLEME') return 'E / Kredi Yükleme';
  if (islem.bent === 'F' && islem.fAltTur === 'TRAFIK') return 'F / Trafik';
  if (islem.bent === 'F' && islem.fAltTur === 'ADLI') return 'F / Adli';
  return islem.bent;
}

function odemeDurumuEtiketi(islem: Islem): string | null {
  if (islem.durum === 'ODEME_BEKLIYOR') return 'Ödeme doğrulama bekliyor';
  if (!islem.makbuzNo) return 'Makbuz aşamasında';
  return null;
}

function makbuzEtiketi(islem: Islem): string {
  return islem.durum === 'ODEME_BEKLIYOR' ? 'Ödeme kontrolünde' : 'Eksik makbuz (eski kayıt)';
}

export function OdemeTablosu({
  islemler,
  makbuzUretilebilir,
  odemeDogrulanabilir,
  dosyaGoruntule,
  makbuzGoruntule,
  makbuzUret,
  odemeDogrula
}: OdemeTablosuProps) {
  const { bau } = useApp();
  const [acikSatir, setAcikSatir] = useState<string | null>(null);

  if (!islemler.length) {
    return <BosDurum baslik="Bu listede kayıt bulunmuyor" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">Kayıt No</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">Bent</th>
              <th scope="col" className="min-w-[220px] px-4 py-3 font-medium">Talep eden / Ödeme yapan</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-medium">Tutar</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">Dekont</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">Ödeme durumu</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">Makbuz</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {islemler.map((islem) => {
              const acik = acikSatir === islem.id;
              const krediYukleme = islem.eIslemTuru === 'KREDI_YUKLEME';
              const detayVar = !!islem.altBasvurular || krediYukleme;
              const krediAnalizi =
              krediYukleme ?
              krediYuklemeKaydiniCozumle({
                islem,
                birimKrediBedeli: patlatmaBedeli(bau)
              }) :
              null;
              const dekontSayisi = krediAnalizi?.guncelDekontlar.length ?? 1;
              const makbuzSayisi = krediAnalizi?.bagisMakbuzlari.length ?? (islem.makbuzNo ? 1 : 0);
              const odemeDurumu = krediAnalizi ?
              krediAnalizi.bekleyenDekontSayisi > 0 ?
              `${krediAnalizi.bekleyenDekontSayisi} dekont doğrulama bekliyor` :
              krediAnalizi.dogrulanmisOzeti.kullanilabilirKrediAdedi > 0 ?
              'Doğrulanan ödeme krediye işlendi' :
              'Doğrulandı' :
              odemeDurumuEtiketi(islem);
              return (
                <Fragment key={islem.id}>
                  <tr className="hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {detayVar &&
                        <button
                          type="button"
                          onClick={() => setAcikSatir(acik ? null : islem.id)}
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                          aria-expanded={acik}
                          aria-label={acik ? 'Detayı kapat' : 'Detayı aç'}>
                          
                            {acik ?
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> :

                          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                          </button>
                        }
                        <Link
                          to={`/kayitlar/${islem.kayitNo}`}
                          className="whitespace-nowrap font-mono text-xs font-medium text-primary hover:underline">
                          
                          {islem.kayitNo}
                        </Link>
                      </div>
                      {islem.altBasvurular &&
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {islem.altBasvurular.length} rapor · tek ana kayıt
                        </p>
                      }
                      {krediYukleme && dekontSayisi > 1 &&
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {dekontSayisi} bağlı banka dekontu
                        </p>
                      }
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {bentEtiketi(islem)}
                    </td>
                    <td className="min-w-[220px] px-4 py-3">
                      <p className="font-medium text-foreground">{islem.talepEden}</p>
                      <p className="text-xs text-muted-foreground">{islem.dekont.odemeYapan}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{formatTL(islem.tutar)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="whitespace-nowrap font-mono text-xs">{islem.dekont.dekontNo}</p>
                      {islem.dekont.tarih &&
                      <p className="text-[11px] text-muted-foreground">
                          {formatTarih(islem.dekont.tarih)}
                        </p>
                      }
                      {krediYukleme && dekontSayisi > 1 &&
                      <p className="text-[11px] text-muted-foreground">
                          +{dekontSayisi - 1} tamamlayıcı dekont
                        </p>
                      }
                      {islem.dekont.dosya ?
                      <button
                        type="button"
                        onClick={() => {
                          const dosya = islem.dekont.dosya;
                          if (dosya) dosyaGoruntule(dosya);
                        }}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          Dosyayı görüntüle
                        </button> :

                      <span className="text-xs text-muted-foreground">Ön ödemeli kredi</span>
                      }
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {odemeDurumu ? <BilgiRozeti metin={odemeDurumu} ton="notr" /> : <IslemDurumRozeti durum={islem.durum} />}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {krediAnalizi ? makbuzSayisi > 0 ?
                      <div className="space-y-1">
                          <p className="whitespace-nowrap font-mono text-xs">{islem.makbuzNo ?? krediAnalizi.bagisMakbuzlari[0]?.makbuzNo ?? '—'}</p>
                          <BilgiRozeti
                          metin={krediAnalizi.makbuzEksikleri.length > 0 ? `${makbuzSayisi} üretildi · ${krediAnalizi.makbuzEksikleri.length} bekliyor` : `${makbuzSayisi} makbuz üretildi`}
                          ton={krediAnalizi.makbuzEksikleri.length > 0 ? 'uyari' : 'olumlu'} />

                        </div> :
                      <BilgiRozeti
                        metin={krediAnalizi.dogrulanmisOzeti.dogrulanmisOdemeToplami > 0 ? 'Eksik makbuz (eski kayıt)' : 'Dekont kontrolünde'}
                        ton="uyari" /> :
                      islem.makbuzNo ?
                      <div className="space-y-1">
                          <p className="whitespace-nowrap font-mono text-xs">{islem.makbuzNo}</p>
                          <BilgiRozeti metin={islem.makbuzUreten ?? 'Üretildi'} ton="olumlu" />
                        </div> :

                      <BilgiRozeti metin={makbuzEtiketi(islem)} ton="uyari" />
                      }
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-nowrap justify-end gap-1.5">
                        {krediAnalizi ?
                        <>
                            {makbuzSayisi > 0 &&
                          <Button size="sm" variant="outline" className="whitespace-nowrap" onClick={() => makbuzGoruntule(islem)}>
                              <Receipt className="h-4 w-4" aria-hidden="true" />
                              Makbuzları görüntüle
                            </Button>
                          }
                            {krediAnalizi.makbuzEksikleri.length > 0 &&
                          <Button
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => makbuzUret(islem)}
                            disabled={!makbuzUretilebilir(islem)}>
                              <Receipt className="h-4 w-4" aria-hidden="true" />
                              Eksik makbuzu tamamla
                            </Button>
                          }
                          </> :
                        <>
                            {odemeDogrulanabilir(islem) &&
                          <Button size="sm" variant="outline" className="whitespace-nowrap" onClick={() => odemeDogrula(islem)}>
                              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                              Ödemeyi doğrula
                            </Button>
                          }
                            {islem.makbuzNo ?
                          <Button size="sm" variant="outline" className="whitespace-nowrap" onClick={() => makbuzGoruntule(islem)}>
                              <Receipt className="h-4 w-4" aria-hidden="true" />
                              Makbuzu görüntüle
                            </Button> :
                          <Button
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => makbuzUret(islem)}
                            disabled={!makbuzUretilebilir(islem)}>
                              <Receipt className="h-4 w-4" aria-hidden="true" />
                              Eksik makbuzu tamamla
                            </Button>
                          }
                          </>}
                      </div>
                    </td>
                  </tr>
                  {acik && krediYukleme &&
                  <tr className="bg-muted/30">
                      <td colSpan={8} className="px-4 py-4">
                        <KrediYuklemeDetayi
                          islem={islem}
                          dosyaGoruntule={dosyaGoruntule}
                          makbuzGoruntule={makbuzGoruntule}
                          makbuzUret={makbuzUret}
                          makbuzUretilebilir={makbuzUretilebilir}
                          odemeDogrula={odemeDogrula}
                          odemeDogrulanabilir={odemeDogrulanabilir} />
                      </td>
                    </tr>
                  }
                  {acik && islem.altBasvurular &&
                  <tr className="bg-muted/30">
                      <td colSpan={8} className="px-4 py-4">
                        <p className="text-sm font-medium text-foreground">
                          Raporlar ({islem.altBasvurular.length}) — ayrı ödeme satırı ve ayrı makbuz
                          yoktur
                        </p>
                        <ul className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                          {islem.altBasvurular.map((alt) =>
                        <li
                          key={alt.no}
                          className="rounded-md border border-border bg-card px-3 py-2">
                          
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-foreground">{alt.no}</p>
                                <p className="font-medium">{formatTL(alt.raporTutari)}</p>
                              </div>
                              <p className="text-muted-foreground">
                                Plaka {alt.plaka} · {alt.hasarDosyaNo}
                              </p>
                              <p className="text-muted-foreground">
                                Kaza {formatTarih(alt.kazaTarihi)} · {alt.raporKonusu}
                              </p>
                            </li>
                        )}
                        </ul>
                      </td>
                    </tr>
                  }
                </Fragment>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}