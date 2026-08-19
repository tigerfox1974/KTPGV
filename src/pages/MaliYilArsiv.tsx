import React from 'react';
import { FileCheck2, FileDown, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { Button } from '../components/ui/Button';
import { BilgiRozeti } from '../components/common/DurumRozeti';
import { useApp } from '../contexts/AppContext';
import { formatTL } from '../utils/currency';

export function MaliYilArsiv() {
  const { arsivler, manifestOlustur, arsivDogrula, kullanici } = useApp();
  const yetkili = !!kullanici && !kullanici.sadeceGoruntule;

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Mali Yıl Arşiv"
        aciklama="İşlem kayıtları silinmez. Eski mali yıl dosyaları export edilir, manifest ve hash bilgisi tutulur." />
      

      <KuralNotu baslik="Arşiv kuralı">
        Arşiv doğrulanmadan dosya silinmez. Dosya arşivlense bile işlem kaydı, makbuz no, dekont no
        ve audit geçmişi sistemde kalır.
      </KuralNotu>

      <div className="grid gap-4 lg:grid-cols-3">
        {arsivler.map((arsiv) =>
        <article key={arsiv.yil} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Mali Yıl {arsiv.yil}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {arsiv.kayitSayisi} kayıt · {arsiv.makbuzSayisi} makbuz
                </p>
              </div>
              <BilgiRozeti
              metin={arsiv.durum}
              ton={
              arsiv.durum === 'Arşivlendi' ?
              'olumlu' :
              arsiv.durum === 'Arşive Hazır' ?
              'uyari' :
              'notr'
              } />
            
            </div>

            <p className="mt-4 text-sm text-muted-foreground">Toplam tutar</p>
            <p className="font-heading text-xl font-semibold">{formatTL(arsiv.toplamTutar)}</p>

            <dl className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Manifest</dt>
                <dd className="font-mono text-foreground">{arsiv.manifestHash ?? 'Oluşturulmadı'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Bütünlük doğrulaması</dt>
                <dd className="text-foreground">{arsiv.dogrulandi ? 'Doğrulandı' : 'Bekliyor'}</dd>
              </div>
            </dl>

            {yetkili && arsiv.durum !== 'Aktif' &&
          <div className="mt-4 flex flex-wrap gap-2">
                <Button
              size="sm"
              variant="outline"
              disabled={!!arsiv.manifestHash}
              onClick={() => {
                manifestOlustur(arsiv.yil);
                toast.success('Manifest oluşturuldu', {
                  description: `Mali Yıl ${arsiv.yil} · Hash bilgisi kaydedildi.`
                });
              }}>
              
                  <FileDown className="h-4 w-4" aria-hidden="true" />
                  Manifest oluştur
                </Button>
                <Button
              size="sm"
              disabled={!arsiv.manifestHash || arsiv.dogrulandi}
              onClick={() => {
                arsivDogrula(arsiv.yil);
                toast.success('Arşiv bütünlüğü doğrulandı', {
                  description: `Mali Yıl ${arsiv.yil} arşivlendi.`
                });
              }}>
              
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Doğrula ve arşivle
                </Button>
              </div>
          }

            {arsiv.dogrulandi &&
          <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
                <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                Arşiv doğrulandı, dosyalar güvenle taşınabilir.
              </p>
          }
          </article>
        )}
      </div>
    </div>);

}