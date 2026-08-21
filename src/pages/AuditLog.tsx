import { useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { BosDurum } from '../components/common/BosDurum';
import { KuralNotu } from '../components/common/KuralNotu';
import { Input } from '../components/ui/Input';
import { useApp } from '../contexts/AppContext';
import { formatTarihSaat } from '../utils/currency';

export function AuditLog() {
  const { gorunurAuditKayitlari, tumVeriGorebilir } = useApp();
  const [arama, setArama] = useState('');

  const filtreli = gorunurAuditKayitlari.filter((k) =>
  `${k.kullanici} ${k.eylem} ${k.hedef}`.toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Audit Log"
        aciklama="Giriş, kayıt, dekont, QR/link, makbuz, kredi ve arşiv hareketlerinin denetim izi." />
      

      <KuralNotu>
        Kayıt sonrası dekont silme, makbuz üretme ve kredi hareketleri gibi kritik işlemler audit
        log’a yazılır ve geri alınamaz.
      </KuralNotu>

      {!tumVeriGorebilir &&
      <KuralNotu baslik="Görünürlük kapsamı" ton="uyari">
          Yalnızca kendi işlemleriniz ve görüntüleme yetkiniz olan kayıtlarla ilişkili audit
          hareketleri listelenir. Tüm denetim izini Merkez Admin ve Denetçi görebilir.
        </KuralNotu>
      }

      <div className="relative sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true" />
        
        <Input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Kullanıcı, eylem veya hedef ara"
          className="pl-9"
          aria-label="Audit log içinde ara" />
        
      </div>

      {filtreli.length === 0 ?
      <BosDurum baslik="Kayıt bulunamadı" /> :

      <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Zaman</th>
                  <th scope="col" className="px-4 py-3 font-medium">Kullanıcı</th>
                  <th scope="col" className="px-4 py-3 font-medium">Eylem</th>
                  <th scope="col" className="px-4 py-3 font-medium">Hedef</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtreli.map((kayit) =>
              <tr key={kayit.id} className="hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                      {formatTarihSaat(kayit.zaman)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{kayit.kullanici}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{kayit.eylem}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {kayit.hedef}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>);

}