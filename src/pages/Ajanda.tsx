import React from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { AjandaDurumRozeti } from '../components/common/DurumRozeti';
import { KuralNotu } from '../components/common/KuralNotu';
import { BosDurum } from '../components/common/BosDurum';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { AjandaDurumu } from '../types';
import { formatTarih } from '../utils/currency';

const DURUMLAR: AjandaDurumu[] = [
'Planlandı',
'İşlem Başlatılabilir',
'Görev Tamamlandı',
'Ertelendi',
'İptal Edildi'];


export function Ajanda() {
  const { kullanici, ajanda, ajandaDurumGuncelle, auditEkle } = useApp();
  if (!kullanici) return null;

  const siraliAjanda = [...ajanda].sort((a, b) => a.tarih.localeCompare(b.tarih));

  const durumDegistir = (id: string, kayitNo: string, durum: AjandaDurumu) => {
    ajandaDurumGuncelle(id, durum);
    if (durum === 'Ertelendi') auditEkle('Taş ocağı kullanım kaydı ertelendi', kayitNo);
    if (durum === 'İptal Edildi') auditEkle('Taş ocağı kullanım kaydı iptal edildi', kayitNo);
    if (durum === 'İşlem Başlatılabilir') auditEkle('İşlem başlatılabilir yapıldı', kayitNo);
    toast.success('Ajanda durumu güncellendi', { description: `${kayitNo} · ${durum}` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Ajanda"
        aciklama="Operasyonel görev ve işlem takibi. Banka/mali işlemler ajandaya düşmez." />
      

      <KuralNotu baslik="Ajanda kuralı">
        Otomatik düşen bentler: C, Ç, D, E kullanım kayıtları ve F. A ve B bentleri ajandaya düşmez.
        E bendinde kredi yükleme ajandaya düşmez, patlatma kullanımı düşer.
      </KuralNotu>

      {siraliAjanda.length === 0 ?
      <BosDurum baslik="Ajandada kayıt yok" /> :

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {siraliAjanda.map((kayit) =>
        <li key={kayit.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{kayit.kayitNo}</p>
                  <h2 className="mt-0.5 font-heading text-sm font-semibold text-foreground">
                    {kayit.baslik}
                  </h2>
                </div>
                <AjandaDurumRozeti durum={kayit.durum} />
              </div>

              <dl className="mt-3 space-y-1 text-xs">
                <div className="flex gap-2">
                  <dt className="w-16 text-muted-foreground">Bent</dt>
                  <dd className="text-foreground">{kayit.bent}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 text-muted-foreground">Tarih</dt>
                  <dd className="text-foreground">
                    {formatTarih(kayit.tarih)} · {kayit.saat}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 text-muted-foreground">Birim</dt>
                  <dd className="text-foreground">{kayit.birim}</dd>
                </div>
              </dl>

              <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {kayit.detay}
              </p>

              {kullanici.ajandaKullanabilir &&
          <div className="mt-4 flex flex-wrap gap-1.5">
                  {DURUMLAR.filter((d) => d !== kayit.durum).map((d) =>
            <Button
              key={d}
              size="xs"
              variant="outline"
              onClick={() => durumDegistir(kayit.id, kayit.kayitNo, d)}>
              
                      {d}
                    </Button>
            )}
                </div>
          }
            </li>
        )}
        </ul>
      }
    </div>);

}