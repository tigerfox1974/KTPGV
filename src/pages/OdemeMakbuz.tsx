import React, { useState } from 'react';
import { BadgeCheck, ChevronDown, ChevronRight, Eye, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { IslemDurumRozeti, BilgiRozeti } from '../components/common/DurumRozeti';
import { MakbuzModal } from '../components/islem/MakbuzModal';
import { DosyaOnizlemeModal } from '../components/islem/DosyaOnizlemeModal';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { DekontDosyasi, Islem } from '../types';
import { formatTL } from '../utils/currency';

export function OdemeMakbuz() {
  const { kullanici, islemler, makbuzUret, odemeDogrula, auditEkle } = useApp();
  const [makbuzIslem, setMakbuzIslem] = useState<Islem | null>(null);
  const [onizleme, setOnizleme] = useState<DekontDosyasi | null>(null);
  const [acikSatir, setAcikSatir] = useState<string | null>(null);

  if (!kullanici) return null;

  const uret = (islem: Islem) => {
    if (!kullanici.makbuzUretebilir) {
      toast.error('Makbuz üretme yetkiniz yok', {
        description: 'Makbuz yalnızca Merkez Admin, Vakıf Muhasebe ve yetki verilmiş birimlerce üretilir.'
      });
      return;
    }
    if (islem.makbuzNo) {
      toast.error('Bu kayda zaten makbuz üretilmiş', { description: islem.makbuzNo });
      return;
    }
    const no = makbuzUret(islem.id);
    if (no) {
      auditEkle('Makbuz üretildi', `${no} / ${islem.kayitNo}`);
      toast.success('Makbuz üretildi', { description: `Makbuz no: ${no} (sistem tarafından üretildi)` });
    }
  };

  const dogrula = (islem: Islem) => {
    odemeDogrula(islem.id);
    auditEkle('Ödeme doğrulandı', islem.kayitNo);
    toast.success('Ödeme doğrulandı', { description: islem.kayitNo });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Ödeme / Makbuz"
        aciklama="Ana mali işlem merkezi. Trafik kayıtlarında tek ana TTRF satırı görünür, alt başvurular açılır detayda listelenir." />
      

      <KuralNotu baslik="Makbuz yetkisi">
        {kullanici.makbuzUretebilir ?
        `${kullanici.rol} makbuz üretme yetkisine sahiptir. Makbuz numarası sistem tarafından benzersiz üretilir, elle yazılamaz.` :
        `${kullanici.rol} makbuz üretemez. Bu ekranda yalnızca ödeme ve makbuz durumu izlenebilir.`}
      </KuralNotu>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Kayıt No</th>
                <th scope="col" className="px-4 py-3 font-medium">Bent</th>
                <th scope="col" className="px-4 py-3 font-medium">Talep eden / Ödeme yapan</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Tutar</th>
                <th scope="col" className="px-4 py-3 font-medium">Dekont</th>
                <th scope="col" className="px-4 py-3 font-medium">Ödeme durumu</th>
                <th scope="col" className="px-4 py-3 font-medium">Makbuz</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {islemler.map((islem) => {
                const acik = acikSatir === islem.id;
                return (
                  <React.Fragment key={islem.id}>
                    <tr className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        {islem.altBasvurular ?
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
                          </button> :

                        <span className="font-mono text-xs">{islem.kayitNo}</span>
                        }
                      </td>
                      <td className="px-4 py-3">{islem.bent}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{islem.talepEden}</p>
                        <p className="text-xs text-muted-foreground">{islem.dekont.odemeYapan}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatTL(islem.tutar)}</td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs">{islem.dekont.dekontNo}</p>
                        {islem.dekont.dosya ?
                        <button
                          type="button"
                          onClick={() => {
                            setOnizleme(islem.dekont.dosya);
                            auditEkle('Dekont dosyası görüntülendi', islem.dekont.dosya!.ad);
                          }}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          
                            <Eye className="h-3 w-3" aria-hidden="true" />
                            Dosyayı görüntüle
                          </button> :

                        <span className="text-xs text-muted-foreground">Ön ödemeli kredi</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <IslemDurumRozeti durum={islem.durum} />
                      </td>
                      <td className="px-4 py-3">
                        {islem.makbuzNo ?
                        <div className="space-y-1">
                            <p className="font-mono text-xs">{islem.makbuzNo}</p>
                            <BilgiRozeti metin="Üretildi" ton="olumlu" />
                          </div> :

                        <BilgiRozeti metin="Makbuz bekliyor" ton="uyari" />
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {islem.durum === 'ODEME_BEKLIYOR' && !kullanici.sadeceGoruntule &&
                          <Button size="sm" variant="outline" onClick={() => dogrula(islem)}>
                              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                              Ödemeyi doğrula
                            </Button>
                          }
                          {islem.makbuzNo ?
                          <Button size="sm" variant="outline" onClick={() => setMakbuzIslem(islem)}>
                              <Receipt className="h-4 w-4" aria-hidden="true" />
                              Makbuzu görüntüle
                            </Button> :

                          <Button
                            size="sm"
                            onClick={() => uret(islem)}
                            disabled={
                            !kullanici.makbuzUretebilir ||
                            islem.durum === 'ODEME_BEKLIYOR' ||
                            islem.eIslemTuru === 'KREDI_KULLANIM'
                            }>
                            
                              <Receipt className="h-4 w-4" aria-hidden="true" />
                              Makbuz üret
                            </Button>
                          }
                        </div>
                      </td>
                    </tr>
                    {acik && islem.altBasvurular &&
                    <tr className="bg-muted/30">
                        <td colSpan={8} className="px-4 py-4">
                          <p className="text-sm font-medium text-foreground">
                            Alt başvurular ({islem.altBasvurular.length}) — ayrı makbuz kesilmez
                          </p>
                          <ul className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                            {islem.altBasvurular.map((alt) =>
                          <li
                            key={alt.no}
                            className="rounded-md border border-border bg-card px-3 py-2">
                            
                                <p className="font-mono text-foreground">{alt.no}</p>
                                <p className="text-muted-foreground">
                                  {alt.dosyaKonusu} · {alt.plaka}
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
      </div>

      <MakbuzModal islem={makbuzIslem} acik={!!makbuzIslem} kapat={() => setMakbuzIslem(null)} />
      <DosyaOnizlemeModal dosya={onizleme} acik={!!onizleme} kapat={() => setOnizleme(null)} />
    </div>);

}