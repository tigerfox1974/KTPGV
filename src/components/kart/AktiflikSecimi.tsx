import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

interface AktiflikSecimiProps {
  id: string;
  aktif: boolean;
  degistir: (aktif: boolean) => void;
  aciklama?: string;
}

export function AktiflikSecimi({ id, aktif, degistir, aciklama }: AktiflikSecimiProps) {
  return (
    <div>
      <Label htmlFor={id}>Durum</Label>
      <Select value={aktif ? 'AKTIF' : 'PASIF'} onValueChange={(v) => degistir(v === 'AKTIF')}>
        <SelectTrigger id={id} className="mt-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AKTIF">Aktif</SelectItem>
          <SelectItem value="PASIF">Pasif</SelectItem>
        </SelectContent>
      </Select>
      {aciklama && <p className="mt-1 text-xs text-muted-foreground">{aciklama}</p>}
    </div>);

}