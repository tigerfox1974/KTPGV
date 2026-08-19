import React from 'react';
import { LogOut, Menu, Settings2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useApp } from '../../contexts/AppContext';
import { formatTL } from '../../utils/currency';

export function Topbar({ menuAc }: {menuAc: () => void;}) {
  const { kullanici, cikis, bau, bauGuncelle } = useApp();
  const [ayarAcik, setAyarAcik] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={menuAc}
          aria-label="Menüyü aç">
          
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            Kıbrıs Türk Polis Güçlendirme Vakfı
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Mali Yıl 2026 · Yasa 57/2026 Madde 6 gelir bentleri · Demo/prototip
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            BAÜ: <span className="font-medium text-foreground">{formatTL(bau)}</span>
          </span>
        </div>

        {kullanici?.bauGuncelleyebilir &&
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAyarAcik((a) => !a)}
          aria-expanded={ayarAcik}>
          
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sistem Ayarı</span>
          </Button>
        }

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-foreground">{kullanici?.adSoyad}</p>
          <p className="text-xs text-muted-foreground">{kullanici?.rol}</p>
        </div>

        <Button variant="ghost" size="icon" onClick={cikis} aria-label="Çıkış yap">
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {ayarAcik && kullanici?.bauGuncelleyebilir &&
      <div className="border-t border-border bg-muted/40 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-xs">
              <Label htmlFor="bau-ayar">Brüt Asgari Ücret (BAÜ)</Label>
              <Input
              id="bau-ayar"
              type="number"
              min={0}
              step={100}
              value={bau}
              onChange={(e) => bauGuncelle(Number(e.target.value))}
              className="mt-1.5" />
            
            </div>
            <p className="text-xs text-muted-foreground sm:pb-2">
              BAÜ sistem ayarıdır ve yalnızca Merkez Admin güncelleyebilir. Değer değiştiğinde tüm
              bent hesaplamaları yeniden hesaplanır; değişiklik audit log’a yazılır.
            </p>
          </div>
        </div>
      }
    </header>);

}