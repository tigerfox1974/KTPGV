import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronDown, ChevronRight, Eye, Receipt } from 'lucide-react';
import { Button } from '../ui/Button';
import { BilgiRozeti, IslemDurumRozeti } from '../common/DurumRozeti';
import { BosDurum } from '../common/BosDurum';
import { useApp } from '../../contexts/AppContext';
import { DekontDosyasi, Islem } from '../../types';
import { formatTL, formatTarih } from '../../utils/currency';

/** EKRD kredi yükleme kaydının bağlı patlatma hareketleri — ana tabloyu kirletmeden detayda. */
function KrediYuklemeDetayi({ islem }: {islem: Islem;}) {
  const { islemler, krediOzeti, krediHareketleri, tasOcagiBul } = useApp();
  if (!islem.isletmeciId) return null;
  const ozet = krediOzeti(islem.isletmeciId);
  const planlar = islemler.filter(
    (i) => i.isletmeciId === islem.isletmeciId && i.eIslemTuru === 'KREDI_PLANLAMA'
  );
  const gerceklesenler = islemler.filter(
    (i) => i.isletmeciId === islem.isletmeciId && i.eIslemTuru === 'KREDI_GERCEKLESME'
  );
  const hareketler = krediHareketleri.filter((h) => h.isletmeciId === islem.isletmeciId);
  const fazlaOdemeDurumu = islem.fazlaOdemeDurumu === 'IADE_BEKLIYOR' ? 'İade bekliyor' :
  islem.fazlaOdemeDurumu === 'IADE_EDILDI' ? 'İade edildi' :
  islem.fazlaOdemeDurumu === 'MAHSUP_BAKIYESI' ? 'Mahsup bakiyesi' :
  islem.fazlaOdemeDurumu === 'MAHSUP_EDILDI' ? 'Mahsup edildi' :
  islem.fazlaOdemeDurumu === 'KARAR_BEKLIYOR' ? 'Karar bekliyor' :
  '—';

  return (
    <div className="space-y-3">
      {(islem.dekonttaOdenenTutar !== undefined || islem.fazlaOdemeTutar) &&
      <div className="rounded-md border border-border bg-card p-3 text-sm">
          <p className="text-xs font-medium text-foreground">Fazla ödeme / iade / mahsup bilgisi</p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-muted-foreground">Dekontta ödenen</dt><dd className="font-medium">{formatTL(islem.dekonttaOdenenTutar ?? islem.dekont.odenenTutar)}</dd></div>
            <div><dt className="text-muted-foreground">Krediye mahsup edilen</dt><dd className="font-medium">{formatTL(islem.krediyeMahsupEdilenTutar ?? islem.tutar)}</dd></div>
            <div><dt className="text-muted-foreground">Yüklenen kredi</dt><dd className="font-medium">{islem.krediAdedi ?? 0} kredi</dd></div>
            <div><dt className="text-muted-foreground">Fazla ödeme</dt><dd className="font-medium">{formatTL(islem.fazlaOdemeTutar ?? 0)}</dd></div>
            <div><dt className="text-muted-foreground">Durum</dt><dd className="font-medium">{fazlaOdemeDurumu}</dd></div>
            {islem.iadeDekontNo && <div><dt className="text-muted-foreground">İade dekontu</dt><dd className="font-mono text-xs">{islem.iadeDekontNo}</dd></div>}
            {islem.mahsupKullanilanTutar && <div><dt className="text-muted-foreground">Mahsup kullanılan</dt><dd className="font-medium">{formatTL(islem.mahsupKullanilanTutar)}</dd></div>}
            {islem.mahsupKaynakKayitNo && <div><dt className="text-muted-foreground">Mahsup kaynağı</dt><dd className="font-mono text-xs">{islem.mahsupKaynakKayitNo}</dd></div>}
            {islem.mahsupHedefKayitNo && <div><dt className="text-muted-foreground">Mahsup hedefi</dt><dd className="font-mono text-xs">{islem.mahsupHedefKayitNo}</dd></div>}
          </dl>
        </div>
      }
      <div className="flex flex-wrap gap-4 text-sm">
        <span>
          <span className="text-muted-foreground">Yüklenen kredi: </span>
          <strong className="text-foreground">{ozet.yuklenen}</strong>
        </span>
        <span>
          <span className="text-muted-foreground">Kullanılan kredi: </span>
          <strong className="text-foreground">{ozet.kullanilan}</strong>
        </span>
        <span>
          <span className="text-muted-foreground">Kalan kredi: </span>
          <strong className="text-primary">{ozet.kalan}</strong>
        </span>
      </div>

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
        Bu patlatma kullanımları, kredi yükleme kaydında önceden ödenmiş krediden karşılanır. Bu
        nedenle her kullanım için ayrı makbuz üretilmez.
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
  odemeDogrula: (islem: Islem) => void;
}

function bentEtiketi(islem: Islem): string {
  if (islem.bent === 'E' && islem.eIslemTuru === 'KREDI_YUKLEME') return 'E / Kredi Yükleme';
  if (islem.bent === 'F' && islem.fAltTur === 'TRAFIK') return 'F / Trafik';
  if (islem.bent === 'F' && islem.fAltTur === 'ADLI') return 'F / Adli';
  return islem.bent;
}

function odemeDurumuEtiketi(islem: Islem): string | null {
  if (islem.durum === 'ODEME_BEKLIYOR') return 'Ödeme doğrulama bekliyor';
  if (!islem.makbuzNo && islem.durum !== 'ODEME_BEKLIYOR') return 'Makbuz aşamasında';
  return null;
}

function makbuzEtiketi(islem: Islem): string {
  return islem.durum === 'ODEME_BEKLIYOR' ? 'Ödeme doğrulanınca' : 'Makbuz bekliyor';
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
              const odemeDurumu = odemeDurumuEtiketi(islem);
              return (
                <React.Fragment key={islem.id}>
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
                      {islem.makbuzNo ?
                      <div className="space-y-1">
                          <p className="whitespace-nowrap font-mono text-xs">{islem.makbuzNo}</p>
                          <BilgiRozeti metin={islem.makbuzUreten ?? 'Üretildi'} ton="olumlu" />
                        </div> :

                      <BilgiRozeti metin={makbuzEtiketi(islem)} ton="uyari" />
                      }
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-nowrap justify-end gap-1.5">
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
                            Makbuz üret
                          </Button>
                        }
                      </div>
                    </td>
                  </tr>
                  {acik && krediYukleme &&
                  <tr className="bg-muted/30">
                      <td colSpan={8} className="px-4 py-4">
                        <KrediYuklemeDetayi islem={islem} />
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
                </React.Fragment>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}