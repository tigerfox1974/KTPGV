import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { BILGI_KAYNAKLARI } from '../../utils/patlatma';
import { BilgiKaynagi } from '../../types';

/**
 * Patlatma bilgisi sözlü, telefonla veya personel bildirimiyle de gelebilir.
 * Bu nedenle bilgi kaynağı seçimi zorunludur; belge/dosya zorunlu değildir.
 */
export function BilgiKaynagiSecimi({
  id,
  deger,
  degistir




}: {id: string;deger: BilgiKaynagi | '';degistir: (deger: BilgiKaynagi) => void;}) {
  return (
    <div>
      <Label htmlFor={id}>Bilgi kaynağı</Label>
      <Select value={deger || undefined} onValueChange={(v) => degistir(v as BilgiKaynagi)}>
        <SelectTrigger id={id} className="mt-1.5">
          <SelectValue placeholder="Lütfen bilgi kaynağı seçiniz" />
        </SelectTrigger>
        <SelectContent>
          {BILGI_KAYNAKLARI.map((k) =>
          <SelectItem key={k.deger} value={k.deger}>
              {k.etiket}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>);

}