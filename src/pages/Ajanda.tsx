import React from 'react';
import { CalendarClock, MapPin, Wallet } from 'lucide-react';
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
    auditEkle('Ajanda durumu değiştirildi', `${kayitNo} · ${durum}`);
    if (durum === 'Ertelendi') auditEkle('Taş ocağı kullanım kaydı ertelendi', kayitNo);
    if (durum === 'İptal Edildi') auditEkle('Taş ocağı kullanım kaydı iptal edildi', kayitNo);
    if (durum === 'İşlem Başlatılabilir') auditEkle('İşlem başlatılabilir yapıldı', kayitNo);
    toast.success('Ajanda durumu güncellendi', { description: `${kayitNo} · ${durum}` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Ajanda"
        aciklama="Operasyonel görev ve işlem takibi. Kartlardaki tarih operasyon tarihidir; dekont tarihi ajandaya yazılmaz." />
      

      <KuralNotu baslik="Ajanda kuralı">
        Ajandaya düşenler: C, Ç, D, E kredi kullanımı ve F. Ajandaya düşmeyenler: A, B ve E kredi
        yükleme. Kredi yükleme mali işlemdir, patlatma kullanımı operasyonel işlemdir.
      </KuralNotu>

      {siraliAjanda.length === 0 ?
      <BosDurum baslik="Ajandada kayıt yok" /> :

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {siraliAjanda.map((kayit) =>
        <li
          key={kayit.id}
          className="flex flex-col rounded-xl border border-border bg-card p-5">
          
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{kayit.kayitNo}</p>
                  <h2 className="mt-0.5 font-heading text-sm font-semibold text-foreground">
                    {kayit.baslik}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {kayit.bent} bendi · {kayit.islemTuru}
                  </p>
                </div>
                <AjandaDurumRozeti durum={kayit.durum} />
              </div>

              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="sr-only">Operasyon tarihi</dt>
                    <dd className="font-medium text-foreground">
                      {formatTarih(kayit.tarih)} · {kayit.saat}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="sr-only">Yer</dt>
                    <dd className="text-foreground">{kayit.yer}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="sr-only">Ödeme / kredi durumu</dt>
                    <dd className="text-foreground">{kayit.odemeDurumu}</dd>
                  </div>
                </div>
              </dl>

              <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                Talep eden / işletmeci: {kayit.talepEden} · Birim: {kayit.birim}
              </p>

              {kullanici.ajandaKullanabilir &&
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
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