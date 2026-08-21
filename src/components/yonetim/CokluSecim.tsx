
interface CokluSecimProps {
  baslik: string;
  aciklama?: string;
  secenekler: {deger: string;etiket: string;}[];
  secili: string[];
  degistir: (secili: string[]) => void;
  sutun?: 1 | 2 | 3;
}

/** Bent, menü gibi çoklu yetki alanları için erişilebilir onay kutusu grubu. */
export function CokluSecim({
  baslik,
  aciklama,
  secenekler,
  secili,
  degistir,
  sutun = 2
}: CokluSecimProps) {
  const degistirTek = (deger: string) => {
    degistir(secili.includes(deger) ? secili.filter((s) => s !== deger) : [...secili, deger]);
  };

  const sutunSinifi = sutun === 1 ? '' : sutun === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{baslik}</legend>
      {aciklama && <p className="mt-0.5 text-xs text-muted-foreground">{aciklama}</p>}
      <div className={`mt-2 grid gap-1.5 ${sutunSinifi}`}>
        {secenekler.map((secenek) =>
        <label
          key={secenek.deger}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50">
          
            <input
            type="checkbox"
            checked={secili.includes(secenek.deger)}
            onChange={() => degistirTek(secenek.deger)}
            className="h-4 w-4 rounded border-border accent-[color:var(--primary)]" />
          
            <span className="truncate text-foreground">{secenek.etiket}</span>
          </label>
        )}
      </div>
    </fieldset>);

}

interface YetkiAnahtariProps {
  id: string;
  etiket: string;
  aciklama?: string;
  deger: boolean;
  degistir: (deger: boolean) => void;
}

export function YetkiAnahtari({ id, etiket, aciklama, deger, degistir }: YetkiAnahtariProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm">
      
      <input
        id={id}
        type="checkbox"
        checked={deger}
        onChange={(e) => degistir(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border accent-[color:var(--primary)]" />
      
      <span>
        <span className="block font-medium text-foreground">{etiket}</span>
        {aciklama && <span className="block text-xs text-muted-foreground">{aciklama}</span>}
      </span>
    </label>);

}