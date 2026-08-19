import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { BosDurum } from '../components/common/BosDurum';
import { IslemDurumRozeti } from '../components/common/DurumRozeti';
import { DosyaKarti } from '../components/islem/DosyaKarti';
import { DosyaOnizlemeModal } from '../components/islem/DosyaOnizlemeModal';
import { Input } from '../components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../components/ui/Select';
import { bentler } from '../data/bentler';
import { useApp } from '../contexts/AppContext';
import { DekontDosyasi } from '../types';
import { formatTL, formatTarih } from '../utils/currency';

export function Kayitlar() {
  const { islemler, auditEkle, sigortaBul } = useApp();
  const [arama, setArama] = useState('');
  const [bentFiltre, setBentFiltre] = useState('TUMU');
  const [acikSatir, setAcikSatir] = useState<string | null>(null);
  const [onizleme, setOnizleme] = useState<DekontDosyasi | null>(null);

  const filtreli = islemler.filter((i) => {
    const bentUyum = bentFiltre === 'TUMU' || i.bent === bentFiltre;
    const metin = `${i.kayitNo} ${i.baslik} ${i.talepEden} ${i.dekont.dekontNo}`.toLowerCase();
    return bentUyum && metin.includes(arama.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Kayıtlar"
        aciklama="Tüm bentlerdeki işlem kayıtları. Trafik kayıtlarında alt başvurular satır detayında açılır." />
      

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true" />
          
          <Input
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Kayıt no, konu, talep eden veya dekont no"
            className="pl-9"
            aria-label="Kayıtlarda ara" />
          
        </div>
        <Select value={bentFiltre} onValueChange={setBentFiltre}>
          <SelectTrigger className="sm:w-64" aria-label="Bent filtresi">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TUMU">Tüm bentler</SelectItem>
            {bentler.map((b) =>
            <SelectItem key={b.kod} value={b.kod}>
                {b.kod} - {b.baslik}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {filtreli.length === 0 ?
      <BosDurum baslik="Kayıt bulunamadı" aciklama="Arama veya filtre kriterlerini değiştirin." /> :

      <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Kayıt No</th>
                  <th scope="col" className="px-4 py-3 font-medium">Bent</th>
                  <th scope="col" className="px-4 py-3 font-medium">Konu / Talep eden</th>
                  <th scope="col" className="px-4 py-3 font-medium">Tarih</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Tutar</th>
                  <th scope="col" className="px-4 py-3 font-medium">Makbuz</th>
                  <th scope="col" className="px-4 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtreli.map((islem) => {
                const acik = acikSatir === islem.id;
                return (
                  <React.Fragment key={islem.id}>
                      <tr className="hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <button
                          type="button"
                          onClick={() => setAcikSatir(acik ? null : islem.id)}
                          className="flex items-center gap-1.5 font-mono text-xs font-medium text-primary"
                          aria-expanded={acik}>
                          
                            {acik ?
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> :

                          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                          }
                            {islem.kayitNo}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {islem.bent}
                          {islem.fAltTur &&
                        <span className="ml-1 text-xs text-muted-foreground">
                              ({islem.fAltTur === 'TRAFIK' ? 'Trafik' : 'Adli'})
                            </span>
                        }
                          {islem.eIslemTuru &&
                        <span className="ml-1 text-xs text-muted-foreground">
                              ({islem.eIslemTuru === 'KREDI_YUKLEME' ? 'Kredi' : 'Kullanım'})
                            </span>
                        }
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{islem.baslik}</p>
                          <p className="text-xs text-muted-foreground">{islem.talepEden}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatTarih(islem.olusturmaTarihi)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatTL(islem.tutar)}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {islem.makbuzNo ?? <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <IslemDurumRozeti durum={islem.durum} />
                        </td>
                      </tr>
                      {acik &&
                    <tr className="bg-muted/30">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="space-y-2 text-sm">
                                <p className="font-medium text-foreground">Hesaplama ve ödeme</p>
                                <p className="text-muted-foreground">{islem.hesaplamaAciklamasi}</p>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                  <dt>Dekont no</dt>
                                  <dd className="font-mono text-foreground">{islem.dekont.dekontNo}</dd>
                                  <dt>Dekont tarihi (mali)</dt>
                                  <dd className="text-foreground">{formatTarih(islem.dekont.tarih)}</dd>
                                  <dt>Operasyon tarihi</dt>
                                  <dd className="text-foreground">
                                    {islem.operasyonTarihi ?
                                `${formatTarih(islem.operasyonTarihi)}${
                                islem.operasyonSaati ? ` · ${islem.operasyonSaati}` : ''}` :

                                '—'}
                                  </dd>
                                  {islem.yer &&
                              <>
                                      <dt>Yer</dt>
                                      <dd className="text-foreground">{islem.yer}</dd>
                                    </>
                              }
                                  <dt>Banka</dt>
                                  <dd className="text-foreground">{islem.dekont.banka}</dd>
                                  <dt>Ödeme yapan</dt>
                                  <dd className="text-foreground">{islem.dekont.odemeYapan}</dd>
                                  <dt>Oluşturan birim</dt>
                                  <dd className="text-foreground">{islem.birim}</dd>
                                  {islem.sigortaSirketiId &&
                              <>
                                      <dt>Sigorta şirketi</dt>
                                      <dd className="text-foreground">
                                        {sigortaBul(islem.sigortaSirketiId)?.ad}
                                      </dd>
                                    </>
                              }
                                </dl>
                              </div>
                              <div className="space-y-3">
                                {islem.dekont.dosya ?
                            <DosyaKarti
                              dosya={islem.dekont.dosya}
                              goruntule={() => {
                                setOnizleme(islem.dekont.dosya);
                                auditEkle('Dekont dosyası görüntülendi', islem.dekont.dosya!.ad);
                              }} /> :


                            <p className="text-sm text-muted-foreground">
                                    Bu kayıt ön ödemeli kredi kullanımıdır; dekont dosyası bağlı
                                    kredi yükleme kaydındadır.
                                  </p>
                            }
                                {islem.altBasvurular &&
                            <div className="rounded-lg border border-border bg-card p-3">
                                    <p className="text-sm font-medium text-foreground">
                                      Alt başvurular ({islem.altBasvurular.length})
                                    </p>
                                    <ul className="mt-2 space-y-1.5 text-xs">
                                      {islem.altBasvurular.map((alt) =>
                                <li
                                  key={alt.no}
                                  className="border-b border-border/60 pb-1.5 last:border-0">
                                  
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-mono text-foreground">{alt.no}</span>
                                            <span className="font-medium text-foreground">
                                              {formatTL(alt.raporTutari)}
                                            </span>
                                          </div>
                                          <p className="text-muted-foreground">
                                            Plaka {alt.plaka} · Hasar/dosya {alt.hasarDosyaNo} · Kaza{' '}
                                            {formatTarih(alt.kazaTarihi)} · {alt.raporKonusu}
                                          </p>
                                        </li>
                                )}
                                    </ul>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      Alt başvurulara ayrı makbuz kesilmez; ödeme ve makbuz ana TTRF
                                      kaydına bağlıdır.
                                    </p>
                                  </div>
                            }
                              </div>
                            </div>
                          </td>
                        </tr>
                    }
                    </React.Fragment>);

              })}
              </tbody>
            </table>
          </div>
        </div>
      }

      <DosyaOnizlemeModal
        dosya={onizleme}
        acik={!!onizleme}
        kapat={() => setOnizleme(null)} />
      
    </div>);

}