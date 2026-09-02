import React from 'react';
import { BadgeCheck, Eye, Receipt } from 'lucide-react';
import { Button } from '../ui/Button';
import { BilgiRozeti } from '../common/DurumRozeti';
import { useApp } from '../../contexts/AppContext';
import { DekontDosyasi, DekontDogrulamaDurumu, Islem } from '../../types';
import { formatTL, formatTarih } from '../../utils/currency';
import { patlatmaBedeli } from '../../utils/hesaplama';
import {
  bagisMakbuzTuruEtiketi,
  dekontDogrulamaDurumuEtiketi,
  krediYuklemeKaydiniCozumle,
  krediYuklemeDekontKimligi } from
'../../utils/krediYukleme';

interface KrediYuklemeTalepPaneliProps {
  islem: Islem;
  dosyaGoruntule?: (dosya: DekontDosyasi) => void;
  odemeDogrula?: (dekontId?: string) => void;
  odemeDogrulanabilir?: boolean;
  makbuzUret?: () => void;
  makbuzUretilebilir?: boolean;
  makbuzGoruntule?: () => void;
}

function durumTonu(durum?: DekontDogrulamaDurumu): 'notr' | 'olumlu' | 'uyari' | 'hata' {
  if (durum === 'DOGRULANDI') return 'olumlu';
  if (durum === 'REDDEDILDI') return 'hata';
  return 'uyari';
}

export function KrediYuklemeTalepPaneli({
  islem,
  dosyaGoruntule,
  odemeDogrula,
  odemeDogrulanabilir = false,
  makbuzUret,
  makbuzUretilebilir = false,
  makbuzGoruntule
}: KrediYuklemeTalepPaneliProps) {
  const { bau } = useApp();
  const analiz = krediYuklemeKaydiniCozumle({
    islem,
    birimKrediBedeli: patlatmaBedeli(bau)
  });

  const ozetKalemleri = [
  { etiket: 'Hedef tutar', deger: formatTL(analiz.krediTalebiOdemeOzeti.hedefTutar) },
  { etiket: 'Doğrulanmış ödeme', deger: formatTL(analiz.krediTalebiOdemeOzeti.dogrulanmisOdemeToplami) },
  { etiket: 'Krediye ayrılan', deger: formatTL(analiz.krediTalebiOdemeOzeti.krediyeAyrilanToplam) },
  { etiket: 'Kullanılabilir kredi', deger: `${analiz.krediTalebiOdemeOzeti.kullanilabilirKrediAdedi} kredi` },
  { etiket: 'Bekleyen bakiye', deger: formatTL(analiz.krediTalebiOdemeOzeti.bekleyenBakiye) },
  { etiket: 'Kalan hedef', deger: formatTL(analiz.krediTalebiOdemeOzeti.kalanHedef) },
  { etiket: 'Genel bağış', deger: formatTL(analiz.krediTalebiOdemeOzeti.genelBagisToplami) }];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {ozetKalemleri.map((kalem) =>
        <div key={kalem.etiket} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{kalem.etiket}</p>
            <p className="mt-1 font-heading text-base font-semibold text-foreground">{kalem.deger}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          Toplam yüklenen dekont: <strong className="text-foreground">{formatTL(analiz.krediTalebiOdemeOzeti.toplamOdenenTutar)}</strong> ·{' '}
          {analiz.guncelDekontlar.length} dekont
        </span>
        <div className="flex flex-wrap gap-2">
          <BilgiRozeti
            metin={`${analiz.dogrulanmisOzeti.kullanilabilirKrediAdedi} kredi hazır`}
            ton={analiz.dogrulanmisOzeti.kullanilabilirKrediAdedi > 0 ? 'olumlu' : 'uyari'} />
          
          <BilgiRozeti
            metin={`${analiz.bekleyenDekontSayisi} dekont bekliyor`}
            ton={analiz.bekleyenDekontSayisi > 0 ? 'uyari' : 'notr'} />
          
          {analiz.krediTalebiOdemeOzeti.genelBagisToplami > 0 &&
          <BilgiRozeti metin={`Genel bağış ${formatTL(analiz.krediTalebiOdemeOzeti.genelBagisToplami)}`} ton="olumlu" />
          }
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {analiz.guncelDekontlar.map((dekont, sira) => {
          const dekontKimligi = krediYuklemeDekontKimligi(dekont, sira);
          const onizlemeDagilimi = analiz.tumDekontOzeti.dekontDagilimlari.find(
            (dagilim) => dagilim.dekontKimligi === dekontKimligi
          );
          const dagilim = dekont.tutarDagilimi ?? onizlemeDagilimi?.tutarDagilimi ?? [];
          const dogrulandi = dekont.dogrulamaDurumu === 'DOGRULANDI' || !!dekont.tutarDagilimi?.length;
          const makbuzlar = dekont.bagisMakbuzlari ?? [];
          return (
            <article key={dekont.id ?? dekontKimligi} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sira + 1}. banka dekontu
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{dekont.dekontNo}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <BilgiRozeti
                    metin={dekontDogrulamaDurumuEtiketi(dekont.dogrulamaDurumu)}
                    ton={durumTonu(dekont.dogrulamaDurumu)} />
                  
                  {makbuzlar.length > 0 &&
                  <BilgiRozeti metin={`${makbuzlar.length} makbuz`} ton="olumlu" />
                  }
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Banka</dt>
                  <dd className="text-foreground">{dekont.banka}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tarih</dt>
                  <dd className="text-foreground">{formatTarih(dekont.tarih)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tutar</dt>
                  <dd className="font-medium text-foreground">{formatTL(dekont.odenenTutar)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ödeyen</dt>
                  <dd className="text-foreground">{dekont.odemeYapan}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Referans</dt>
                  <dd className="font-mono text-xs text-foreground">{dekont.bankaReferansNo ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Dosya</dt>
                  <dd className="text-foreground">{dekont.dosya?.ad ?? '—'}</dd>
                </div>
              </dl>

              <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs font-medium text-foreground">
                  {dogrulandi ? 'Doğrulanan dağılım' : 'Önizleme dağılımı'}
                </p>
                {dagilim.length ? (
                  <ul className="mt-2 space-y-1.5 text-xs">
                    {dagilim.map((kalem) =>
                    <li key={`${dekontKimligi}-${kalem.amac}`} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          {bagisMakbuzTuruEtiketi(kalem.amac)}
                        </span>
                        <span className="text-right text-foreground">
                          {formatTL(kalem.tutar)}
                          {kalem.bagliMakbuzNo && (
                            <span className="block font-mono text-[11px] text-muted-foreground">
                              {kalem.bagliMakbuzNo}
                            </span>
                          )}
                        </span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {dogrulandi ?
                    'Bu dekonttan kredi veya genel bağış dağılımı oluşmadı.' :
                    'Dağılım ve kredi etkisi doğrulama sonrası kesinleşir.'}
                  </p>
                )}
              </div>

              {makbuzlar.length > 0 &&
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-medium text-emerald-900">Bağlı bağış makbuzları</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-emerald-900">
                    {makbuzlar.map((makbuz) =>
                    <li key={`${dekontKimligi}-${makbuz.makbuzNo ?? makbuz.tur}`} className="flex items-center justify-between gap-2">
                        <span>{bagisMakbuzTuruEtiketi(makbuz.tur)}</span>
                        <span className="text-right font-medium">
                          {formatTL(makbuz.tutar)}
                          <span className="block font-mono text-[11px]">{makbuz.makbuzNo ?? '—'}</span>
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              }

              <div className="mt-3 flex flex-wrap gap-2">
                {dekont.dosya && dosyaGoruntule &&
                <Button size="sm" variant="outline" onClick={() => {
                  const dosya = dekont.dosya;
                  if (dosya) dosyaGoruntule(dosya);
                }}>
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Dosyayı görüntüle
                  </Button>
                }
                {odemeDogrula &&
                odemeDogrulanabilir &&
                dekont.dogrulamaDurumu !== 'DOGRULANDI' &&
                dekont.dogrulamaDurumu !== 'REDDEDILDI' &&
                <Button size="sm" variant="outline" onClick={() => odemeDogrula(dekont.id ?? dekontKimligi)}>
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    Dekontu doğrula
                  </Button>
                }
              </div>
            </article>);
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <div className="text-sm text-muted-foreground">
          {analiz.makbuzEksikleri.length > 0 ?
          `${analiz.makbuzEksikleri.length} doğrulanmış dağılım için makbuz bekleniyor.` :
          analiz.bagisMakbuzlari.length > 0 ?
          'Doğrulanmış dağılımların makbuzları üretilmiş durumda.' :
          'Makbuz üretimi için önce dekont doğrulaması gerekir.'}
        </div>
        <div className="flex flex-wrap gap-2">
          {analiz.bagisMakbuzlari.length > 0 && makbuzGoruntule &&
          <Button size="sm" variant="outline" onClick={makbuzGoruntule}>
              <Receipt className="h-4 w-4" aria-hidden="true" />
              Makbuzları görüntüle
            </Button>
          }
          {analiz.makbuzEksikleri.length > 0 && makbuzUret && (
            <Button size="sm" onClick={makbuzUret} disabled={!makbuzUretilebilir}>
              <Receipt className="h-4 w-4" aria-hidden="true" />
              Eksik makbuzları üret
            </Button>)
          }
        </div>
      </div>
    </div>);
}
