import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftRight, Check, MapPinned, PenSquare, ScanSearch, Wand2 } from 'lucide-react';
import type {
  DekontAlanAdi,
  DekontAlanAdayi,
  DekontAlanDegeri,
  DekontKonumluAlan,
  DekontNormalizedBbox
} from '../../../types';
import { BilgiRozeti } from '../../common/DurumRozeti';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { ParaInput } from '../../ui/ParaInput';
import { formatTL } from '../../../utils/currency';
import { STANDART_BANKA_ADLARI } from '../../../utils/dekontOcr';
import {
  DEKONT_ALAN_ETIKETLERI,
  MONO_ALANLAR,
  alanDegeriBosMu,
  alanDegeriniGoster,
  metinBenzerlikSkoru
} from './helpers';

interface AlanDuzeltmeEditoruProps {
  alanAdi: DekontAlanAdi;
  alan: DekontKonumluAlan | undefined;
  beklenenTutar: number;
  tutarKurali: 'ESIT_OLMALI' | 'POZITIF_OLMALI';
  isletmeciAdi?: string;
  seciliBolge?: { sayfa: number; bbox: DekontNormalizedBbox } | null;
  bolgeSecimModu: boolean;
  tekrarOkunuyor: boolean;
  onDegerDegistir: (alan: DekontAlanAdi, deger: DekontAlanDegeri) => void;
  onAdaySec: (alan: DekontAlanAdi, aday: DekontAlanAdayi) => void;
  onDogrula: (alan: DekontAlanAdi) => void;
  onDogrulaVeSonraki: (alan: DekontAlanAdi) => void;
  onBelgedeGoster: (alan: DekontAlanAdi) => void;
  onBelgedenSec: (alan: DekontAlanAdi) => void;
  onBolgeTekrarOku: (alan: DekontAlanAdi) => void;
  onNumaralariDegistir?: () => void;
}

function AmountDifference({
  beklenenTutar,
  deger,
  tutarKurali
}: {
  beklenenTutar: number;
  deger?: number;
  tutarKurali: 'ESIT_OLMALI' | 'POZITIF_OLMALI';
}) {
  if (!deger || deger <= 0) return null;
  const fark = Number((deger - beklenenTutar).toFixed(2));
  if (tutarKurali === 'ESIT_OLMALI') {
    return (
      <p className={`text-xs ${Math.abs(fark) < 0.01 ? 'text-emerald-700' : 'text-rose-700'}`}>
        {Math.abs(fark) < 0.01
          ? `Sistem tutarı ile eşleşiyor: ${formatTL(deger)}`
          : `Fark: ${formatTL(Math.abs(fark))}`}
      </p>
    );
  }
  return (
    <p className="text-xs text-sky-700">
      Talep hedefi {formatTL(beklenenTutar)} · Dekont {formatTL(deger)} ·{' '}
      {fark === 0 ? 'hedefe eşit' : fark > 0 ? 'fazla ödeme' : 'eksik ödeme'}
    </p>
  );
}

export function AlanDuzeltmeEditoru({
  alanAdi,
  alan,
  beklenenTutar,
  tutarKurali,
  isletmeciAdi,
  seciliBolge,
  bolgeSecimModu,
  tekrarOkunuyor,
  onDegerDegistir,
  onAdaySec,
  onDogrula,
  onDogrulaVeSonraki,
  onBelgedeGoster,
  onBelgedenSec,
  onBolgeTekrarOku,
  onNumaralariDegistir
}: AlanDuzeltmeEditoruProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [bankaArama, setBankaArama] = useState('');

  useEffect(() => {
    setBankaArama('');
  }, [alanAdi]);

  const filteredBanks = useMemo(() => {
    const arama = bankaArama.trim().toLocaleLowerCase('tr-TR');
    if (!arama) return STANDART_BANKA_ADLARI;
    return STANDART_BANKA_ADLARI.filter((banka) =>
      banka.toLocaleLowerCase('tr-TR').includes(arama)
    );
  }, [bankaArama]);

  const guncelTutar = typeof alan?.guncelDeger === 'number' ? alan.guncelDeger : undefined;
  const adBenzerligi =
    alanAdi === 'odemeYapan' && typeof alan?.guncelDeger === 'string' && isletmeciAdi
      ? metinBenzerlikSkoru(String(alan.guncelDeger), isletmeciAdi)
      : 0;

  const ortakActions = (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => onBelgedeGoster(alanAdi)}>
        <MapPinned className="h-4 w-4" aria-hidden="true" />
        Belgede göster
      </Button>
      <Button
        size="sm"
        variant={bolgeSecimModu ? 'default' : 'outline'}
        onClick={() => onBelgedenSec(alanAdi)}>
        <ScanSearch className="h-4 w-4" aria-hidden="true" />
        {bolgeSecimModu ? 'Belgeden seçim açık' : 'Belgeden bölge seç'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={!seciliBolge || tekrarOkunuyor}
        onClick={() => onBolgeTekrarOku(alanAdi)}>
        <Wand2 className="h-4 w-4" aria-hidden="true" />
        {tekrarOkunuyor ? 'OCR tekrar okunuyor…' : 'Seçili bölgeyi tekrar oku'}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => inputRef.current?.focus()}>
        <PenSquare className="h-4 w-4" aria-hidden="true" />
        Manuel gir
      </Button>
    </div>
  );

  const adaylar = alan?.alternatifAdaylar ?? [];
  const supheliKarakterler = alan?.supheliKarakterler ?? [];

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {DEKONT_ALAN_ETIKETLERI[alanAdi]}
            </p>
            <p className="text-xs text-muted-foreground">
              OCR değeri: {alan?.ocrDegeri?.trim() ? alan.ocrDegeri : 'okunamadı'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <BilgiRozeti metin={alan?.kaynak ?? 'KULLANICI'} ton="notr" />
            <BilgiRozeti
              metin={alan?.durum ?? 'KONTROL_GEREKLI'}
              ton={alan?.durum === 'DOGRULANDI' ? 'olumlu' : alan?.durum === 'DUZELTILDI' ? 'notr' : 'uyari'}
            />
            {alan?.guven !== undefined && <BilgiRozeti metin={`Güven ${alan.guven.toFixed(0)}`} ton={alan.guven >= 78 ? 'notr' : 'uyari'} />}
          </div>
        </div>
        {ortakActions}
      </div>

      <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3">
        <Label className="text-xs font-medium text-muted-foreground">
          Doğrudan düzenle / manuel giriş
        </Label>

        {alanAdi === 'odenenTutar' ? (
          <div className="space-y-2">
            <ParaInput
              value={typeof alan?.guncelDeger === 'number' ? alan.guncelDeger : null}
              onValueChange={(deger) => {
                if (deger !== null) onDegerDegistir('odenenTutar', deger);
              }}
              className="mt-1.5"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onDogrulaVeSonraki('odenenTutar');
                }
              }}
            />
            <AmountDifference
              beklenenTutar={beklenenTutar}
              deger={guncelTutar}
              tutarKurali={tutarKurali}
            />
          </div>
        ) : alanAdi === 'tarih' ? (
          <Input
            ref={inputRef}
            type="date"
            value={typeof alan?.guncelDeger === 'string' ? alan.guncelDeger : ''}
            onChange={(event) => onDegerDegistir('tarih', event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onDogrulaVeSonraki('tarih');
              }
            }}
          />
        ) : (
          <Input
            ref={inputRef}
            value={typeof alan?.guncelDeger === 'string' ? alan.guncelDeger : ''}
            onChange={(event) => onDegerDegistir(alanAdi, event.target.value)}
            className={MONO_ALANLAR.has(alanAdi) ? 'font-mono text-xs' : ''}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onDogrulaVeSonraki(alanAdi);
              }
            }}
          />
        )}

        {alanAdi === 'banka' && (
          <div className="space-y-2 rounded-lg border border-border bg-background p-3">
            <Label htmlFor="banka-arama" className="text-xs text-muted-foreground">
              Standart banka listesinden ara
            </Label>
            <Input
              id="banka-arama"
              value={bankaArama}
              onChange={(event) => setBankaArama(event.target.value)}
              placeholder="Banka adı ara"
            />
            <div className="grid max-h-44 gap-1 overflow-y-auto">
              {filteredBanks.map((banka) => (
                <Button
                  key={banka}
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="justify-start"
                  onClick={() => onDegerDegistir('banka', banka)}>
                  {banka}
                </Button>
              ))}
            </div>
          </div>
        )}

        {alanAdi === 'odemeYapan' && isletmeciAdi && (
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-foreground">İşletmeci benzerliği</p>
                <p className="text-xs text-muted-foreground">
                  Seçili işletmeci: {isletmeciAdi}
                </p>
              </div>
              <BilgiRozeti
                metin={`Benzerlik ${Math.round(adBenzerligi * 100)}%`}
                ton={adBenzerligi >= 0.75 ? 'olumlu' : adBenzerligi >= 0.45 ? 'uyari' : 'notr'}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onDegerDegistir('odemeYapan', isletmeciAdi)}>
                İşletmeci adını kullan
              </Button>
            </div>
          </div>
        )}

        {(alanAdi === 'dekontNo' || alanAdi === 'bankaReferansNo') && onNumaralariDegistir && (
          <Button size="sm" variant="outline" onClick={onNumaralariDegistir}>
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Dekont / referans numarasını değiştir
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">Alternatif OCR adayları</p>
          <p className="text-[11px] text-muted-foreground">
            {adaylar.length ? `${adaylar.length} aday` : 'Ek aday bulunamadı'}
          </p>
        </div>
        {adaylar.length ? (
          <div className="space-y-2">
            {adaylar.map((aday) => {
              const adayTutar = typeof aday.deger === 'number' ? aday.deger : undefined;
              return (
                <button
                  key={aday.id}
                  type="button"
                  onClick={() => onAdaySec(alanAdi, aday)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left transition hover:border-primary/40 hover:bg-muted/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-sm font-medium text-foreground ${
                        MONO_ALANLAR.has(alanAdi) ? 'font-mono text-xs' : ''
                      }`}>
                      {aday.deger !== undefined ? alanDegeriniGoster(alanAdi, aday.deger) : aday.degerMetni}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <BilgiRozeti metin={aday.kaynak} ton="notr" />
                      {aday.guven !== undefined && (
                        <BilgiRozeti
                          metin={`Güven ${aday.guven.toFixed(0)}`}
                          ton={aday.guven >= 78 ? 'notr' : 'uyari'}
                        />
                      )}
                    </div>
                  </div>
                  {alanAdi === 'odenenTutar' && adayTutar !== undefined && (
                    <AmountDifference
                      beklenenTutar={beklenenTutar}
                      deger={adayTutar}
                      tutarKurali={tutarKurali}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
            OCR ek aday üretemedi. Belgeden bölge seçerek bu alanı tekrar okutabilirsiniz.
          </p>
        )}
      </div>

      {supheliKarakterler.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-medium">Şüpheli karakterler</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {supheliKarakterler.map((karakter) => (
              <span key={`${karakter.index}-${karakter.karakter}`} className="rounded-full bg-white/80 px-2 py-1 font-mono">
                #{karakter.index + 1} {karakter.karakter} · {Math.round(karakter.guven ?? 0)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => onDogrula(alanAdi)} disabled={alanDegeriBosMu(alan?.guncelDeger)}>
          <Check className="h-4 w-4" aria-hidden="true" />
          Doğrula
        </Button>
        <Button size="sm" onClick={() => onDogrulaVeSonraki(alanAdi)} disabled={alanDegeriBosMu(alan?.guncelDeger)}>
          <Check className="h-4 w-4" aria-hidden="true" />
          Doğrula ve sonraki alana geç
        </Button>
      </div>
    </div>
  );
}
