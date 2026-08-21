import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, MapPin, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { AjandaDurumRozeti, BilgiRozeti } from '../components/common/DurumRozeti';
import { KuralNotu } from '../components/common/KuralNotu';
import { BosDurum } from '../components/common/BosDurum';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { AjandaDurumu, AjandaKaydi } from '../types';
import { formatTarihSaat } from '../utils/currency';

const DURUMLAR: AjandaDurumu[] = [
'Planlandı',
'Sonuç Bekliyor',
'İşlem Başlatılabilir',
'Görev Tamamlandı',
'Ertelendi',
'İptal Edildi'];


export function Ajanda() {
  const {
    kullanici,
    gorunurAjanda,
    ajandaIslemiYapilabilir,
    tumVeriGorebilir,
    ajandaDurumGuncelle,
    auditEkle
  } = useApp();

  if (!kullanici) return null;

  const siraliAjanda = [...gorunurAjanda].sort((a, b) => a.tarih.localeCompare(b.tarih));

  const durumDegistir = (id: string, kayitNo: string, durum: AjandaDurumu) => {
    ajandaDurumGuncelle(id, durum);
    auditEkle('Ajanda durumu değiştirildi', `${kayitNo} · ${durum}`);
    if (durum === 'Ertelendi') auditEkle('Taş ocağı kullanım kaydı ertelendi', kayitNo);
    if (durum === 'İptal Edildi') auditEkle('Taş ocağı kullanım kaydı iptal edildi', kayitNo);
    if (durum === 'İşlem Başlatılabilir') auditEkle('İşlem başlatılabilir yapıldı', kayitNo);
    toast.success('Ajanda durumu güncellendi', { description: `${kayitNo} · ${durum}` });
  };

  /** E bendi patlatma kaydı, Ajanda ekranında doğrudan sonuç işlemeden Takvim akışına yönlendirilir. */
  const patlatmaTakvimiYonlendirme = (kayit: AjandaKaydi) =>
  kayit.bent === 'E' &&
  !!kayit.isletmeciId &&
  !!kayit.tasOcagiId &&
  !kayit.gerceklesmeKayitNo &&
  kayit.durum !== 'İptal Edildi' &&
  kayit.durum !== 'Yapılmadı' &&
  kayit.durum !== 'Yapıldı' &&
  kayit.durum !== 'Görev Tamamlandı';

  const genelDurumButonlariGorunur = (kayit: AjandaKaydi) =>
    !(kayit.bent === 'E' && !!kayit.isletmeciId && !!kayit.tasOcagiId && !kayit.gerceklesmeKayitNo);

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Ajanda"
        aciklama={
        tumVeriGorebilir ?
        'Operasyonel görev ve işlem takibi. Kartlardaki tarih operasyon tarihidir; dekont tarihi ajandaya yazılmaz.' :
        `Yalnızca ${kullanici.birim} biriminin ve yetkili olduğunuz bentlerin görev kayıtları listelenir.`
        } />
      

      <KuralNotu baslik="Ajanda ve kredi düşüm kuralı">
        Patlatma planlama E bendi için ajandaya düşer; kredi yükleme değil. Kredi yalnızca Patlatma
        Takvimi ekranında “Yapıldı” sonucunda düşer.
      </KuralNotu>

      {kullanici.sadeceGoruntule &&
      <KuralNotu baslik="Sadece görüntüleme" ton="uyari">
          Bu kullanıcı ajanda durumunu değiştiremez ve patlatma sonucunu işleyemez.
        </KuralNotu>
      }

      {siraliAjanda.length === 0 ?
      <BosDurum
        baslik="Yetkiniz kapsamında görüntülenebilecek ajanda kaydı bulunmuyor"
        aciklama="Ajanda yalnızca kendi biriminizin ve yetkili olduğunuz bentlerin operasyonel görevlerini gösterir." /> :


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
                      {formatTarihSaat(kayit.tarih, kayit.saat)}
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

              {kayit.gerceklesmeKayitNo &&
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <BilgiRozeti metin={`Kredi düşüldü · ${kayit.gerceklesmeKayitNo}`} ton="olumlu" />
                  {kayit.raporNo && <BilgiRozeti metin={`Rapor ${kayit.raporNo}`} />}
                </div>
          }

              {ajandaIslemiYapilabilir(kayit) && patlatmaTakvimiYonlendirme(kayit) &&
          <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Patlatma sonucunu Patlatma Takvimi ekranından işleyin.
                  </p>
                  <Link to="/patlatma-takvimi" className="mt-2 inline-flex">
                    <Button size="sm">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Patlatma Takvimine Git
                    </Button>
                  </Link>
                </div>
          }

              {ajandaIslemiYapilabilir(kayit) && genelDurumButonlariGorunur(kayit) &&
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