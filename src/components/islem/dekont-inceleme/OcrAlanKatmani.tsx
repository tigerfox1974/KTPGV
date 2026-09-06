import type { DekontAlanAdi, DekontKonumluAlan } from '../../../types';
import {
  DEKONT_ALAN_ETIKETLERI,
  alanTonSinifi,
  normalizeBboxForRotation
} from './helpers';

interface OcrAlanKatmaniProps {
  alanlar: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>;
  sayfa: number;
  rotation: 0 | 90 | 180 | 270;
  gorunur: boolean;
  yalnizSeciliAlan: boolean;
  seciliAlan?: DekontAlanAdi;
  onAlanSec?: (alan: DekontAlanAdi) => void;
}

export function OcrAlanKatmani({
  alanlar,
  sayfa,
  rotation,
  gorunur,
  yalnizSeciliAlan,
  seciliAlan,
  onAlanSec
}: OcrAlanKatmaniProps) {
  if (!gorunur) return null;

  const kutular = Object.entries(alanlar).filter(
    (entry): entry is [DekontAlanAdi, DekontKonumluAlan] =>
      !!entry[1] &&
      entry[1].bbox !== undefined &&
      entry[1].sayfa === sayfa &&
      (!yalnizSeciliAlan || entry[0] === seciliAlan)
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {kutular.map(([alanAdi, alan]) => {
        if (!alan.bbox) return null;
        const kutu = normalizeBboxForRotation(alan.bbox, rotation);
        const secili = alanAdi === seciliAlan;
        const ton = alanTonSinifi(alan);
        return (
          <button
            key={alanAdi}
            type="button"
            className={`pointer-events-auto absolute rounded-md border-2 shadow-sm transition ${ton.kenarlik} ${
              secili ? 'ring-2 ring-white/90 ring-offset-1 ring-offset-slate-900' : ''
            }`}
            style={{
              left: `${kutu.x * 100}%`,
              top: `${kutu.y * 100}%`,
              width: `${kutu.width * 100}%`,
              height: `${kutu.height * 100}%`
            }}
            onClick={() => onAlanSec?.(alanAdi)}
            title={DEKONT_ALAN_ETIKETLERI[alanAdi]}>
            <span
              className={`absolute -top-5 left-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${ton.etiket}`}>
              {DEKONT_ALAN_ETIKETLERI[alanAdi]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
