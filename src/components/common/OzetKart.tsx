import React from "react";
import { BoxIcon } from "lucide-react";
interface OzetKartProps {
  etiket: string;
  deger: string;
  altMetin?: string;
  ikon: BoxIcon;
}
export function OzetKart({
  etiket,
  deger,
  altMetin,
  ikon: Ikon
}: OzetKartProps) {
  return <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {etiket}
          </p>
          <p className="mt-2 truncate font-heading text-2xl font-semibold text-foreground">{deger}</p>
          {altMetin && <p className="mt-1 text-xs text-muted-foreground">{altMetin}</p>}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Ikon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>;
}