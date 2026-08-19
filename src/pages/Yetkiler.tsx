import React from 'react';
import { Check, Minus } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { kullanicilar, yetkiMatrisi } from '../data/kullanicilar';
import { bentler } from '../data/bentler';
import { menuler } from '../data/menuler';
import { useApp } from '../contexts/AppContext';

function Isaret({ dogru }: {dogru: boolean;}) {
  return dogru ?
  <Check className="mx-auto h-4 w-4 text-emerald-700" aria-label="Var" /> :

  <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Yok" />;

}

export function Yetkiler() {
  const { kullanici } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Kullanıcı / Rol / Birim Yetkileri"
        aciklama="Kullanıcının rolü ve birimi; işlem yapabileceği bentleri, görebileceği kayıtları ve makbuz yetkisini belirler." />
      

      <KuralNotu baslik="Aktif oturum">
        {kullanici?.rol} · {kullanici?.birim} · Yetkili bentler:{' '}
        {kullanici?.bentler.length ? kullanici.bentler.join(', ') : 'yok'} · Makbuz:{' '}
        {kullanici?.makbuzUretebilir ? 'üretebilir' : 'üretemez'}
      </KuralNotu>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading text-base font-semibold">Yetki matrisi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Kullanıcı / Rol</th>
                <th scope="col" className="px-4 py-3 font-medium">Birim</th>
                {bentler.map((b) =>
                <th key={b.kod} scope="col" className="px-2 py-3 text-center font-medium">
                    {b.kod}
                  </th>
                )}
                <th scope="col" className="px-3 py-3 text-center font-medium">Makbuz</th>
                <th scope="col" className="px-3 py-3 text-center font-medium">Rapor</th>
                <th scope="col" className="px-3 py-3 text-center font-medium">Ajanda</th>
                <th scope="col" className="px-3 py-3 text-center font-medium">Sadece görüntüle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {kullanicilar.map((k) =>
              <tr key={k.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{k.rol}</p>
                    <p className="font-mono text-xs text-muted-foreground">{k.kullaniciAdi} / 1234</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{k.birim}</td>
                  {bentler.map((b) =>
                <td key={b.kod} className="px-2 py-3 text-center">
                      <Isaret dogru={k.bentler.includes(b.kod)} />
                    </td>
                )}
                  <td className="px-3 py-3 text-center">
                    <Isaret dogru={k.makbuzUretebilir} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Isaret dogru={k.raporGorebilir} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Isaret dogru={k.ajandaKullanabilir} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Isaret dogru={k.sadeceGoruntule} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">Rol kapsamları</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {yetkiMatrisi.map((y) =>
            <li key={y.rol} className="flex flex-col border-b border-border pb-2 last:border-0">
                <span className="font-medium text-foreground">{y.rol}</span>
                <span className="text-muted-foreground">{y.kapsam}</span>
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">Menü erişimi</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kullanıcı değiştiğinde görebileceği menüler değişir.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {kullanicilar.map((k) =>
            <li key={k.id} className="border-b border-border pb-2 last:border-0">
                <p className="font-medium text-foreground">{k.rol}</p>
                <p className="text-xs text-muted-foreground">
                  {k.menuler.
                map((id) => menuler.find((m) => m.id === id)?.etiket).
                filter(Boolean).
                join(' · ')}
                </p>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>);

}