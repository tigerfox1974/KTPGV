import { ShieldAlert } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { useApp } from '../../contexts/AppContext';

/**
 * Menüden gizlemek yetmez: kullanıcı adresi elle yazsa bile yetkisiz ekran açılmaz.
 * Veri silinmez; yalnızca aktif kullanıcının erişimi engellenir.
 */
export function YetkisizUyari({
  baslik = 'Bu ekran için yetkiniz bulunmuyor',
  aciklama = 'Ekranı görüntüleyebilmek için rolünüze veya biriminize bu menünün yetkisi tanımlanmalıdır.'



}: {baslik?: string;aciklama?: string;}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      
      <ShieldAlert className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{baslik}</p>
      <p className="max-w-md text-sm text-muted-foreground">{aciklama}</p>
    </div>);

}

export function YetkiKapisi({
  menu,
  baslik,
  children




}: {menu: string;baslik: string;children: React.ReactNode;}) {
  const { ekranGorulebilir } = useApp();

  if (!ekranGorulebilir(menu)) {
    return (
      <div className="space-y-6">
        <PageHeader baslik={baslik} />
        <YetkisizUyari />
      </div>);

  }

  return <>{children}</>;
}