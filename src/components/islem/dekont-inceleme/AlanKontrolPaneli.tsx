import React from 'react';
import type {
  DekontAlanAdi,
  DekontAlanAdayi,
  DekontAlanDegeri,
  DekontKonumluAlan,
  DekontNormalizedBbox
} from '../../../types';
import { BilgiRozeti } from '../../common/DurumRozeti';
import { Button } from '../../ui/Button';
import { formatTL } from '../../../utils/currency';
import {
  DEKONT_ALAN_ETIKETLERI,
  DEKONT_ALAN_SIRASI,
  MONO_ALANLAR,
  ZORUNLU_DEKONT_ALANLARI,
  DekontSorunu,
  alanDegeriniGoster,
  alanTonSinifi
} from './helpers';
import { AlanDuzeltmeEditoru } from './AlanDuzeltmeEditoru';
import { DekontSorunOzeti } from './DekontSorunOzeti';

interface AlanKontrolPaneliProps {
  alanlar: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>;
  seciliAlan: DekontAlanAdi;
  sorunlar: DekontSorunu[];
  beklenenTutar: number;
  tutarKurali: 'ESIT_OLMALI' | 'POZITIF_OLMALI';
  isletmeciAdi?: string;
  kontrolEdilen: number;
  toplamZorunluAlan: number;
  seciliBolge?: { sayfa: number; bbox: DekontNormalizedBbox } | null;
  bolgeSecimModu: boolean;
  tekrarOkunuyor: boolean;
  onAlanSec: (alan: DekontAlanAdi) => void;
  onDegerDegistir: (alan: DekontAlanAdi, deger: DekontAlanDegeri) => void;
  onAdaySec: (alan: DekontAlanAdi, aday: DekontAlanAdayi) => void;
  onDogrula: (alan: DekontAlanAdi) => void;
  onDogrulaVeSonraki: (alan: DekontAlanAdi) => void;
  onBelgedeGoster: (alan: DekontAlanAdi) => void;
  onBelgedenSec: (alan: DekontAlanAdi) => void;
  onBolgeTekrarOku: (alan: DekontAlanAdi) => void;
  onNumaralariDegistir: () => void;
  onKontrolTamamla: () => void;
  kontrolTamamlanabilir: boolean;
}

export function AlanKontrolPaneli({
  alanlar,
  seciliAlan,
  sorunlar,
  beklenenTutar,
  tutarKurali,
  isletmeciAdi,
  kontrolEdilen,
  toplamZorunluAlan,
  seciliBolge,
  bolgeSecimModu,
  tekrarOkunuyor,
  onAlanSec,
  onDegerDegistir,
  onAdaySec,
  onDogrula,
  onDogrulaVeSonraki,
  onBelgedeGoster,
  onBelgedenSec,
  onBolgeTekrarOku,
  onNumaralariDegistir,
  onKontrolTamamla,
  kontrolTamamlanabilir
}: AlanKontrolPaneliProps) {
  const aktifAlan = alanlar[seciliAlan];

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-card p-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Alan Kontrol Paneli</h3>
            <p className="text-sm text-muted-foreground">
              OCR sonucu öneridir; doğrulama kullanıcı onayı olmadan tamamlanmaz.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <BilgiRozeti
              metin={`${kontrolEdilen} / ${toplamZorunluAlan} zorunlu alan`}
              ton={kontrolEdilen === toplamZorunluAlan ? 'olumlu' : 'uyari'}
            />
            <BilgiRozeti
              metin={tutarKurali === 'POZITIF_OLMALI' ? `Talep hedefi ${formatTL(beklenenTutar)}` : `Beklenen ${formatTL(beklenenTutar)}`}
              ton="notr"
            />
          </div>
        </div>

        <DekontSorunOzeti sorunlar={sorunlar} onSorunSec={onAlanSec} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Alan Listesi</p>
          <p className="text-xs text-muted-foreground">Panel tıklaması belgeye odaklanır.</p>
        </div>
        <div className="grid gap-2">
          {DEKONT_ALAN_SIRASI.map((alanAdi) => {
            const alan = alanlar[alanAdi];
            const secili = alanAdi === seciliAlan;
            const ton = alanTonSinifi(alan);
            return (
              <button
                key={alanAdi}
                type="button"
                onClick={() => onAlanSec(alanAdi)}
                className={`rounded-xl border p-3 text-left transition ${
                  secili
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-background hover:border-primary/30 hover:bg-muted/30'
                }`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${ton.kenarlik}`}>
                      {alan?.durum ?? 'KONTROL_GEREKLI'}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {DEKONT_ALAN_ETIKETLERI[alanAdi]}
                    </span>
                    {ZORUNLU_DEKONT_ALANLARI.includes(alanAdi) && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        Zorunlu
                      </span>
                    )}
                  </div>
                  {alan?.guven !== undefined && (
                    <span className="text-[11px] text-muted-foreground">
                      Güven {alan.guven.toFixed(0)}
                    </span>
                  )}
                </div>
                <p className={`mt-1 truncate text-sm text-muted-foreground ${MONO_ALANLAR.has(alanAdi) ? 'font-mono text-xs' : ''}`}>
                  {alanDegeriniGoster(alanAdi, alan?.guncelDeger)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <AlanDuzeltmeEditoru
        alanAdi={seciliAlan}
        alan={aktifAlan}
        beklenenTutar={beklenenTutar}
        tutarKurali={tutarKurali}
        isletmeciAdi={isletmeciAdi}
        seciliBolge={seciliBolge}
        bolgeSecimModu={bolgeSecimModu}
        tekrarOkunuyor={tekrarOkunuyor}
        onDegerDegistir={onDegerDegistir}
        onAdaySec={onAdaySec}
        onDogrula={onDogrula}
        onDogrulaVeSonraki={onDogrulaVeSonraki}
        onBelgedeGoster={onBelgedeGoster}
        onBelgedenSec={onBelgedenSec}
        onBolgeTekrarOku={onBolgeTekrarOku}
        onNumaralariDegistir={onNumaralariDegistir}
      />

      <div className="sticky bottom-0 mt-auto rounded-xl border border-border bg-card/95 p-3 backdrop-blur">
        <Button className="w-full" disabled={!kontrolTamamlanabilir} onClick={onKontrolTamamla}>
          Dekont kontrolünü tamamla
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Zorunlu alanlar kullanıcı tarafından doğrulanmadan bu adım tamamlanmaz.
        </p>
      </div>
    </div>
  );
}
