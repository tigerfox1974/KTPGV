import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Eye, EyeOff, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type {
  DekontAlanAdi,
  DekontAlanAdayi,
  DekontAlanDegeri,
  DekontDosyasi,
  DekontKonumluAlan,
  DekontNormalizedBbox
} from '../../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { BilgiRozeti } from '../../common/DurumRozeti';
import { BelgeGoruntuleyici } from './BelgeGoruntuleyici';
import { AlanKontrolPaneli } from './AlanKontrolPaneli';

interface DekontIncelemeCalismaAlaniProps {
  acik: boolean;
  kapat: () => void;
  dosya: Pick<DekontDosyasi, 'ad' | 'boyutKb' | 'previewUrl' | 'tur' | 'kaynakVeri' | 'yontem' | 'yuklemeZamani'>;
  alanlar: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>;
  seciliAlan: DekontAlanAdi;
  beklenenTutar: number;
  tutarKurali: 'ESIT_OLMALI' | 'POZITIF_OLMALI';
  isletmeciAdi?: string;
  kontrolEdilen: number;
  toplamZorunluAlan: number;
  sorunSayisi: { kritik: number; uyari: number };
  sorunlar: Parameters<typeof AlanKontrolPaneli>[0]['sorunlar'];
  tekrarOkunuyor: boolean;
  bolgeSecimModu: boolean;
  seciliBolge?: { sayfa: number; bbox: DekontNormalizedBbox } | null;
  onAlanSec: (alan: DekontAlanAdi) => void;
  onDegerDegistir: (alan: DekontAlanAdi, deger: DekontAlanDegeri) => void;
  onAdaySec: (alan: DekontAlanAdi, aday: DekontAlanAdayi) => void;
  onDogrula: (alan: DekontAlanAdi) => void;
  onDogrulaVeSonraki: (alan: DekontAlanAdi) => void;
  onBelgedenSec: (alan: DekontAlanAdi) => void;
  onBolgeSecildi: (alan: DekontAlanAdi, secim: { sayfa: number; bbox: DekontNormalizedBbox }) => void;
  onBelgedeGoster: (alan: DekontAlanAdi) => void;
  onBolgeTekrarOku: (alan: DekontAlanAdi) => void;
  onNumaralariDegistir: () => void;
  kontrolTamamlanabilir: boolean;
  onKontrolTamamla: () => void;
}

type MobilSekme = 'belge' | 'kontrol';

function odakIcinGirdiMi(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName);
}

export function DekontIncelemeCalismaAlani({
  acik,
  kapat,
  dosya,
  alanlar,
  seciliAlan,
  beklenenTutar,
  tutarKurali,
  isletmeciAdi,
  kontrolEdilen,
  toplamZorunluAlan,
  sorunSayisi,
  sorunlar,
  tekrarOkunuyor,
  bolgeSecimModu,
  seciliBolge,
  onAlanSec,
  onDegerDegistir,
  onAdaySec,
  onDogrula,
  onDogrulaVeSonraki,
  onBelgedenSec,
  onBolgeSecildi,
  onBelgedeGoster,
  onBolgeTekrarOku,
  onNumaralariDegistir,
  kontrolTamamlanabilir,
  onKontrolTamamla
}: DekontIncelemeCalismaAlaniProps) {
  const [panelDar, setPanelDar] = useState(false);
  const [katmanGorunur, setKatmanGorunur] = useState(true);
  const [yalnizSeciliAlan, setYalnizSeciliAlan] = useState(false);
  const [mobilSekme, setMobilSekme] = useState<MobilSekme>('kontrol');
  const [odakNonce, setOdakNonce] = useState(0);
  const [sayfa, setSayfa] = useState(1);

  useEffect(() => {
    if (!acik) return;
    const kisaYol = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        kapat();
        return;
      }
      if (event.key === 'Enter' && !odakIcinGirdiMi(event.target)) {
        event.preventDefault();
        onDogrulaVeSonraki(seciliAlan);
      }
    };
    document.addEventListener('keydown', kisaYol);
    return () => document.removeEventListener('keydown', kisaYol);
  }, [acik, kapat, onDogrulaVeSonraki, seciliAlan]);

  useEffect(() => {
    if (!acik) return;
    setMobilSekme('kontrol');
    setKatmanGorunur(true);
    setYalnizSeciliAlan(false);
    setPanelDar(false);
  }, [acik, dosya.ad]);

  const seciliAlanModeli = alanlar[seciliAlan];
  const ozetMetni = useMemo(() => {
    if (sorunSayisi.kritik > 0) return `${sorunSayisi.kritik} kritik sorun`;
    if (sorunSayisi.uyari > 0) return `${sorunSayisi.uyari} uyarı`;
    return 'Öncelikli sorun görünmüyor';
  }, [sorunSayisi.kritik, sorunSayisi.uyari]);

  const panelProps = {
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
    onAlanSec: (alan: DekontAlanAdi) => {
      onAlanSec(alan);
      setOdakNonce((mevcut) => mevcut + 1);
    },
    onDegerDegistir,
    onAdaySec,
    onDogrula,
    onDogrulaVeSonraki,
    onBelgedeGoster: (alan: DekontAlanAdi) => {
      onBelgedeGoster(alan);
      setOdakNonce((mevcut) => mevcut + 1);
      setMobilSekme('belge');
    },
    onBelgedenSec,
    onBolgeTekrarOku,
    onNumaralariDegistir,
    onKontrolTamamla,
    kontrolTamamlanabilir
  } satisfies Parameters<typeof AlanKontrolPaneli>[0];

  return (
    <Dialog open={acik} onOpenChange={(durum) => !durum && kapat()}>
      <DialogContent className="h-[96vh] max-w-[98vw] overflow-hidden p-0 sm:max-w-[98vw]">
        <DialogHeader className="border-b border-border px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-lg">{dosya.ad}</DialogTitle>
              <DialogDescription>
                {dosya.tur} · {(dosya.boyutKb / 1024).toFixed(2)} MB ·{' '}
                {dosya.yontem === 'PERSONEL' ? 'Personel ekranı' : 'QR/link'} · {dosya.yuklemeZamani}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <BilgiRozeti
                metin={`${kontrolEdilen} / ${toplamZorunluAlan} doğrulandı`}
                ton={kontrolEdilen === toplamZorunluAlan ? 'olumlu' : 'uyari'}
              />
              <BilgiRozeti
                metin={ozetMetni}
                ton={sorunSayisi.kritik > 0 ? 'hata' : sorunSayisi.uyari > 0 ? 'uyari' : 'olumlu'}
              />
              {seciliAlanModeli?.sayfa && <BilgiRozeti metin={`Sayfa ${seciliAlanModeli.sayfa}`} ton="notr" />}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={katmanGorunur ? 'default' : 'outline'}
                onClick={() => setKatmanGorunur((mevcut) => !mevcut)}>
                {katmanGorunur ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                OCR katmanı
              </Button>
              <Button
                size="sm"
                variant={yalnizSeciliAlan ? 'default' : 'outline'}
                onClick={() => setYalnizSeciliAlan((mevcut) => !mevcut)}>
                Yalnız seçili alan
              </Button>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
                <span>Enter: doğrula / sonraki</span>
                <span>·</span>
                <span>Esc: kapat</span>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                size="sm"
                variant={mobilSekme === 'belge' ? 'default' : 'outline'}
                onClick={() => setMobilSekme('belge')}>
                Belge
              </Button>
              <Button
                size="sm"
                variant={mobilSekme === 'kontrol' ? 'default' : 'outline'}
                onClick={() => setMobilSekme('kontrol')}>
                Kontrol
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="hidden lg:inline-flex"
              onClick={() => setPanelDar((mevcut) => !mevcut)}>
              {panelDar ? <PanelRightOpen className="h-4 w-4" aria-hidden="true" /> : <PanelRightClose className="h-4 w-4" aria-hidden="true" />}
              {panelDar ? 'Paneli aç' : 'Paneli daralt'}
            </Button>
          </div>
        </DialogHeader>

        <div
          className={`grid h-[calc(96vh-112px)] min-h-0 grid-cols-1 ${
            panelDar
              ? 'lg:grid-cols-[minmax(0,1fr)_72px]'
              : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]'
          }`}>
          <div className={`${mobilSekme === 'kontrol' ? 'hidden lg:block' : 'block'} min-h-0 border-r border-border bg-slate-900/50`}>
            <div className="h-full p-4">
              <BelgeGoruntuleyici
                dosya={dosya}
                alanlar={alanlar}
                seciliAlan={seciliAlan}
                katmanGorunur={katmanGorunur}
                yalnizSeciliAlan={yalnizSeciliAlan}
                sayfa={sayfa}
                onSayfaChange={setSayfa}
                onAlanSec={(alan) => {
                  onAlanSec(alan);
                  setMobilSekme('kontrol');
                }}
                odakIstegi={{ alan: seciliAlan, nonce: odakNonce }}
                bolgeSecimModu={bolgeSecimModu}
                onBolgeSecildi={(bbox, sayfaNo) => {
                  if (sayfaNo !== sayfa) setSayfa(sayfaNo);
                  onBolgeSecildi(seciliAlan, { bbox, sayfa: sayfaNo });
                  setMobilSekme('kontrol');
                }}
              />
            </div>
          </div>

          <div className={`${mobilSekme === 'belge' ? 'hidden lg:block' : 'block'} min-h-0 bg-background`}>
            {panelDar ? (
              <div className="flex h-full items-center justify-center p-4">
                <Button variant="outline" onClick={() => setPanelDar(false)}>
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Paneli aç
                </Button>
              </div>
            ) : (
              <div className="h-full p-4">
                <AlanKontrolPaneli {...panelProps} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
