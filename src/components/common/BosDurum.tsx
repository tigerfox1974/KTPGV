import { Inbox } from 'lucide-react';

export function BosDurum({ baslik, aciklama }: {baslik: string;aciklama?: string;}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{baslik}</p>
      {aciklama && <p className="max-w-md text-sm text-muted-foreground">{aciklama}</p>}
    </div>);

}