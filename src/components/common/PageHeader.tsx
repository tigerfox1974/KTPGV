
interface PageHeaderProps {
  baslik: string;
  aciklama?: string;
  eylem?: React.ReactNode;
}

export function PageHeader({ baslik, aciklama, eylem }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {baslik}
        </h1>
        {aciklama && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{aciklama}</p>}
      </div>
      {eylem && <div className="flex flex-wrap items-center gap-2">{eylem}</div>}
    </header>);

}