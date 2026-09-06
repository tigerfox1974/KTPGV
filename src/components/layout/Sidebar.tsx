import { NavLink } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { menuGruplari, menuler } from '../../data/menuler';
import { useApp } from '../../contexts/AppContext';

interface SidebarProps {
  acik: boolean;
  kapat: () => void;
}

export function Sidebar({ acik, kapat }: SidebarProps) {
  const { kullanici, menuGorunur } = useApp();
  const gorunurMenuler = menuler.filter((m) => menuGorunur(m.id));

  return (
    <>
      {acik &&
      <div
        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        onClick={kapat}
        aria-hidden="true" />

      }
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0 ${
        acik ? 'translate-x-0' : '-translate-x-full'}`
        }
        aria-label="Ana menü">
        
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold leading-tight">KTPGV</p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              Gelir ve Makbuz Sistemi
            </p>
          </div>
          <button
            type="button"
            onClick={kapat}
            className="rounded-md p-1 hover:bg-white/10 lg:hidden"
            aria-label="Menüyü kapat">
            
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuGruplari.map((grup) => {
            const ogeler = gorunurMenuler.filter((m) => m.grup === grup);
            if (!ogeler.length) return null;
            return (
              <div key={grup} className="mb-5">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {grup}
                </p>
                <ul className="space-y-0.5">
                  {ogeler.map((oge) =>
                  <li key={oge.id}>
                      <NavLink
                      to={oge.yol}
                      onClick={kapat}
                      className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                      isActive ?
                      'bg-sidebar-accent font-medium text-sidebar-accent-foreground' :
                      'text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground'}`

                      }>
                      
                        <oge.ikon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{oge.etiket}</span>
                      </NavLink>
                    </li>
                  )}
                </ul>
              </div>);

          })}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/70">
          <p className="font-medium text-sidebar-foreground">{kullanici?.rol}</p>
          <p className="mt-0.5">{kullanici?.birim}</p>
          <p className="mt-2">
            Yetkili bentler:{' '}
            <span className="font-mono">
              {kullanici?.bentler.length ? kullanici.bentler.join(', ') : 'Yok (görüntüleme)'}
            </span>
          </p>
        </div>
      </aside>
    </>);

}