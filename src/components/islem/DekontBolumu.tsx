import React, { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { ParaInput } from '../ui/ParaInput';
import { DosyaKarti } from './DosyaKarti';
import { DosyaOnizlemeModal } from './DosyaOnizlemeModal';
import { QrDekontPaneli } from './QrDekontPaneli';
import { KuralNotu } from '../common/KuralNotu';
import { DekontDosyasi, Islem } from '../../types';
import { dosyaSec } from '../../utils/dosya';
import { formatTL } from '../../utils/currency';
import { dekontOcrOku, DekontOcrSonucu, normalizeDekontNo } from '../../utils/dekontOcr';

export interface DekontFormu {
  dekontNo: string;
  banka: string;
  tarih: string;
  odenenTutar: number | null;
  odemeYapan: string;
}

export const BOS_DEKONT: DekontFormu = {
  dekontNo: '',
  banka: '',
  tarih: '',
  odenenTutar: null,
  odemeYapan: ''
};

interface DekontBolumuProps {
  form: DekontFormu;
  guncelle: <K extends keyof DekontFormu>(alan: K, deger: DekontFormu[K]) => void;
  dosya: DekontDosyasi | null;
  dosyaAta: (dosya: DekontDosyasi | null) => void;
  kaynakEtiketi: string;
  beklenenTutar: number;
  qrOdenecekTutarGoster?: boolean;
  auditEkle: (eylem: string, hedef: string) => void;
  mevcutIslemler: Islem[];
  ocrBilgisi: (sonuc: Pick<DekontOcrSonucu, 'durum' | 'okunanAlanlar' | 'guven'>) => void;
  gelistirilmisMi: boolean;
}

export function DekontBolumu({
  form,
  guncelle,
  dosya,
  dosyaAta,
  kaynakEtiketi,
  beklenenTutar,
  qrOdenecekTutarGoster = false,
  auditEkle,
  mevcutIslemler,
  ocrBilgisi,
  gelistirilmisMi
}: DekontBolumuProps) {
  const [onizleme, setOnizleme] = useState(false);
  const [ocrDurumu, setOcrDurumu] = useState<'BEKLIYOR' | 'OKUNUYOR' | 'BASARILI' | 'KISMI' | 'BASARISIZ'>('BEKLIYOR');
  const sonDuplicateAudit = useRef('');
  const odenen = form.odenenTutar ?? 0;
  const fark = Number((odenen - beklenenTutar).toFixed(2));
  const tutarUyumlu = odenen > 0 && Math.abs(fark) < 0.01;
  const normalizedNo = normalizeDekontNo(form.dekontNo);
  const duplicateKaydi = normalizedNo && form.banka.trim()
    ? mevcutIslemler.find((islem) =>
      normalizeDekontNo(islem.dekont.dekontNo) === normalizedNo &&
      islem.dekont.banka.trim().toLocaleUpperCase('tr-TR') === form.banka.trim().toLocaleUpperCase('tr-TR'))
    : undefined;
  const hashDuplicateKaydi = dosya?.dekontHash
    ? mevcutIslemler.find((islem) => islem.dekont.dosya?.dekontHash === dosya.dekontHash)
    : undefined;
  const benzerKaydi = form.tarih && odenen > 0 && form.odemeYapan.trim()
    ? mevcutIslemler.find((islem) =>
      islem.dekont.banka.trim().toLocaleUpperCase('tr-TR') === form.banka.trim().toLocaleUpperCase('tr-TR') &&
      islem.dekont.tarih === form.tarih &&
      Math.abs(islem.dekont.odenenTutar - odenen) < 0.01 &&
      islem.dekont.odemeYapan.trim().toLocaleUpperCase('tr-TR') === form.odemeYapan.trim().toLocaleUpperCase('tr-TR'))
    : undefined;
  const gelecekTarih = !!form.tarih && form.tarih > new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!gelistirilmisMi) return;
    if (!dosya) {
      setOcrDurumu('BEKLIYOR');
      ocrBilgisi({ durum: 'BASARISIZ', okunanAlanlar: [], guven: {} });
      return;
    }
    let iptal = false;
    setOcrDurumu('OKUNUYOR');
    void dekontOcrOku(dosya).then((sonuc) => {
      if (iptal) return;
      setOcrDurumu(sonuc.durum);
      ocrBilgisi(sonuc);
      Object.entries(sonuc.alanlar).forEach(([alan, deger]) => {
        if (deger !== undefined) guncelle(alan as keyof typeof form, deger as never);
      });
      auditEkle(sonuc.durum === 'BASARISIZ' ? 'OCR başarısız oldu' : 'OCR ile dekont bilgileri okundu', dosya.ad);
    }).catch(() => {
      if (iptal) return;
      setOcrDurumu('BASARISIZ');
      ocrBilgisi({ durum: 'BASARISIZ', okunanAlanlar: [], guven: {} });
      auditEkle('OCR başarısız oldu', dosya.ad);
    });
    return () => { iptal = true; };
  // OCR is intentionally triggered only when the uploaded file changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dosya, gelistirilmisMi]);

  useEffect(() => {
    const anahtar = duplicateKaydi ? `no:${duplicateKaydi.id}` : hashDuplicateKaydi ? `hash:${hashDuplicateKaydi.id}` : benzerKaydi ? `benzer:${benzerKaydi.id}` : '';
    if (!anahtar || anahtar === sonDuplicateAudit.current) return;
    sonDuplicateAudit.current = anahtar;
    if (duplicateKaydi) auditEkle('Mükerrer dekont tespit edildi', `${duplicateKaydi.kayitNo} · ${duplicateKaydi.dekont.dekontNo}`);
    else if (hashDuplicateKaydi) auditEkle('Mükerrer dijital dekont tespit edildi', hashDuplicateKaydi.kayitNo);
    else if (benzerKaydi) auditEkle('Benzer ödeme uyarısı oluştu', benzerKaydi.kayitNo);
  }, [duplicateKaydi, hashDuplicateKaydi, benzerKaydi, auditEkle]);

  if (!gelistirilmisMi) {
    return (
      <div className="space-y-6">
        <section className="space-y-4" aria-labelledby="dekont-baslik">
          <div>
            <h2 id="dekont-baslik" className="font-heading text-base font-semibold text-foreground">Ödeme / Dekont</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tüm alanlar zorunludur. Ödenen tutar hesaplanan tutarla eşleşmeden ve dekont dosyası yüklenmeden işlem kaydedilemez.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><Label htmlFor="dekont-no">Dekont no</Label><Input id="dekont-no" value={form.dekontNo} onChange={(e) => guncelle('dekontNo', e.target.value)} placeholder="Örn. 987654321" className="mt-1.5" /></div>
            <div><Label htmlFor="dekont-banka">Banka</Label><Input id="dekont-banka" value={form.banka} onChange={(e) => guncelle('banka', e.target.value)} placeholder="Örn. Kıbrıs Vakıflar Bankası" className="mt-1.5" /></div>
            <div><Label htmlFor="dekont-tarih">Dekont tarihi (mali belge tarihi)</Label><Input id="dekont-tarih" type="date" value={form.tarih} onChange={(e) => guncelle('tarih', e.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="dekont-tutar">Ödenen tutar (TL)</Label><ParaInput id="dekont-tutar" value={form.odenenTutar} onValueChange={(deger) => guncelle('odenenTutar', deger)} placeholder="0,00 TL" className="mt-1.5" /><p className="mt-1 text-xs text-muted-foreground">Hesaplanan tutar: {formatTL(beklenenTutar)}</p></div>
            <div className="sm:col-span-2"><Label htmlFor="dekont-odeyen">Ödeme yapan kişi / kurum</Label><Input id="dekont-odeyen" value={form.odemeYapan} onChange={(e) => guncelle('odemeYapan', e.target.value)} placeholder="Örn. Kıbrıs Sigorta Ltd." className="mt-1.5" /></div>
          </div>
          {odenen > 0 && !tutarUyumlu && <div role="alert" className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p className="font-medium">Dekont tutarı hesaplanan tutarla eşleşmiyor.</p><p>Hesaplanan tutar: {formatTL(beklenenTutar)}</p><p>Dekontta ödenen: {formatTL(odenen)}</p><p>Fark: {formatTL(Math.abs(fark))}</p></div>}
          {tutarUyumlu && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">Ödenen tutar hesaplanan tutarla eşleşiyor: {formatTL(odenen)}</p>}
        </section>
        <section className="space-y-3 rounded-xl border border-border p-4" aria-labelledby="dosya-baslik">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="dosya-baslik" className="font-heading text-base font-semibold text-foreground">Dijital Dosya</h2><p className="mt-1 text-xs text-muted-foreground">Dijital dekont dosyası · PDF, JPG veya PNG · En fazla 5 MB</p></div>{!dosya && <Button type="button" variant="outline" size="sm" onClick={() => dosyaSec('PERSONEL', (d) => { dosyaAta(d); auditEkle('Dekont yüklendi', `${d.ad} (Personel ekranı)`); })}><Upload className="h-4 w-4" aria-hidden="true" />Yöntem 1 — Personel dosya yükleme</Button>}</div>
          {dosya ? <DosyaKarti dosya={dosya} goruntule={() => { setOnizleme(true); auditEkle('Dekont dosyası görüntülendi', dosya.ad); }} kaldir={() => { dosyaAta(null); auditEkle('Kayıt öncesi dekont kaldırıldı', dosya.ad); }} /> : <QrDekontPaneli kaynakEtiketi={kaynakEtiketi} odenecekTutar={qrOdenecekTutarGoster ? formatTL(beklenenTutar) : undefined} dosyaAta={(d) => { dosyaAta(d); auditEkle('Dekont yüklendi', `${d.ad} (QR/link)`); }} qrOlusturuldu={() => auditEkle('QR/link oluşturuldu', kaynakEtiketi)} />}
          <KuralNotu ton="uyari">Kayıt öncesinde yanlış dosya “Dosyayı kaldır” ile silinebilir. Kayıt tamamlandıktan sonra serbest silme yoktur; silme işlemi yetki ve audit log gerektirir.</KuralNotu>
          <DosyaOnizlemeModal dosya={dosya} acik={onizleme} kapat={() => setOnizleme(false)} />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4" aria-labelledby="dekont-baslik">
        <div>
          <h2 id="dekont-baslik" className="font-heading text-base font-semibold text-foreground">
            Ödeme / Dekont
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tüm alanlar zorunludur. Ödenen tutar hesaplanan tutarla eşleşmeden ve dekont dosyası
            yüklenmeden işlem kaydedilemez.
          </p>
        </div>

        <section className="space-y-3 rounded-xl border border-border p-4" aria-labelledby="dosya-baslik">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="dosya-baslik" className="font-heading text-base font-semibold text-foreground">A — Dijital Dekont</h2>
              <p className="mt-1 text-xs text-muted-foreground">PDF, JPG veya PNG · En fazla 5 MB</p>
            </div>
            {!dosya &&
            <Button type="button" variant="outline" size="sm" onClick={() => dosyaSec('PERSONEL', (d) => {
              dosyaAta(d);
              auditEkle('Dekont dosyası yüklendi', `${d.ad} (Personel ekranı)`);
            })}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Yöntem 1 — Personel dosya yükleme
            </Button>}
          </div>
          {dosya ? <DosyaKarti dosya={dosya} goruntule={() => { setOnizleme(true); auditEkle('Dekont dosyası görüntülendi', dosya.ad); }} kaldir={() => { dosyaAta(null); auditEkle('Kayıt öncesi dekont kaldırıldı', dosya.ad); }} /> :
          <QrDekontPaneli kaynakEtiketi={kaynakEtiketi} odenecekTutar={qrOdenecekTutarGoster ? formatTL(beklenenTutar) : undefined} dosyaAta={(d) => { dosyaAta(d); auditEkle('Dekont dosyası yüklendi', `${d.ad} (QR/link)`); }} qrOlusturuldu={() => auditEkle('QR/link oluşturuldu', kaynakEtiketi)} />}
          {dosya && <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">{ocrDurumu === 'OKUNUYOR' ? 'Dekont okunuyor…' : ocrDurumu === 'BASARILI' ? 'Dekont bilgileri otomatik okundu. Lütfen bilgileri kontrol ediniz.' : ocrDurumu === 'KISMI' ? 'Bazı bilgiler otomatik okunamadı. Eksik veya hatalı alanları kontrol edip tamamlayınız.' : 'Dekont otomatik okunamadı. Bilgileri manuel olarak girebilirsiniz.'}</p>}
          <DosyaOnizlemeModal dosya={dosya} acik={onizleme} kapat={() => setOnizleme(false)} />
        </section>

        {!dosya && <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Önce dijital dekontu yükleyiniz. Sistem dekont üzerindeki bilgileri otomatik okumaya çalışacaktır.</p>}

        {dosya && <>
        <section className="space-y-3" aria-labelledby="bilgi-baslik">
          <div>
            <h2 id="bilgi-baslik" className="font-heading text-base font-semibold text-foreground">B — Dekont Bilgileri</h2>
            <p className="mt-1 text-xs text-muted-foreground">Sistem dekont üzerindeki bilgileri otomatik okumaya çalışmıştır. Kayıt öncesinde bilgileri kontrol ediniz.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="dekont-no">Dekont no</Label>
            <Input
              id="dekont-no"
              value={form.dekontNo}
              onChange={(e) => guncelle('dekontNo', e.target.value)}
              placeholder="Örn. 987654321"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="dekont-banka">Banka</Label>
            <Input
              id="dekont-banka"
              value={form.banka}
              onChange={(e) => guncelle('banka', e.target.value)}
              placeholder="Örn. Kıbrıs Vakıflar Bankası"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="dekont-tarih">Dekont tarihi (mali belge tarihi)</Label>
            <Input
              id="dekont-tarih"
              type="date"
              value={form.tarih}
              onChange={(e) => guncelle('tarih', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="dekont-tutar">Ödenen tutar (TL)</Label>
            <ParaInput
              id="dekont-tutar"
              value={form.odenenTutar}
              onValueChange={(deger) => guncelle('odenenTutar', deger)}
              placeholder="0,00 TL"
              className="mt-1.5"
              aria-invalid={odenen > 0 && !tutarUyumlu} />
            
            <p className="mt-1 text-xs text-muted-foreground">
              Hesaplanan tutar: {formatTL(beklenenTutar)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="dekont-odeyen">Ödeme yapan kişi / kurum</Label>
            <Input
              id="dekont-odeyen"
              value={form.odemeYapan}
              onChange={(e) => guncelle('odemeYapan', e.target.value)}
              placeholder="Örn. Kıbrıs Sigorta Ltd."
              className="mt-1.5" />
            
          </div>
          </div>

        {odenen > 0 && !tutarUyumlu &&
        <div
          role="alert"
          className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          
            <p className="font-medium">
              {fark < 0 ?
            'Eksik ödeme nedeniyle kayıt oluşturulamaz.' :
            'Fazla ödeme tespit edildi.'}
            </p>
            <p>Hesaplanan tutar: {formatTL(beklenenTutar)}</p>
            <p>Ödenen tutar: {formatTL(odenen)}</p>
            <p>
              Fark: {formatTL(Math.abs(fark))}{' '}
              {fark < 0 ?
            '(eksik)' :
            '(fazla) — Ödenen tutar hesaplanan tutardan fazladır. Mali onay/politika gerektirir.'}
            </p>
          </div>
        }

        {tutarUyumlu &&
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
            Ödenen tutar hesaplanan tutarla eşleşiyor: {formatTL(odenen)}
          </p>
        }
      </section>
      <section className="space-y-2 rounded-xl border border-border p-4" aria-labelledby="dogrulama-baslik">
        <h2 id="dogrulama-baslik" className="font-heading text-base font-semibold text-foreground">C — Dekont Doğrulama</h2>
        <div className="grid gap-1.5 text-sm">
          <p className={duplicateKaydi || hashDuplicateKaydi ? 'text-rose-700' : 'text-emerald-700'}>{duplicateKaydi || hashDuplicateKaydi ? '✕ Dekont daha önce kullanılmış' : '✓ Dekont ve dijital dosya daha önce kullanılmamış'}</p>
          <p className={!form.dekontNo.trim() ? 'text-rose-700' : 'text-emerald-700'}>{form.dekontNo.trim() ? '✓ Dekont numarası mevcut' : '✕ Dekont numarası eksik'}</p>
          <p className={!form.banka.trim() ? 'text-rose-700' : 'text-emerald-700'}>{form.banka.trim() ? '✓ Banka bilgisi mevcut' : '✕ Banka bilgisi eksik'}</p>
          <p className={gelecekTarih ? 'text-rose-700' : form.tarih ? 'text-emerald-700' : 'text-rose-700'}>{gelecekTarih ? '✕ Dekont tarihi gelecekte olamaz' : form.tarih ? '✓ Dekont tarihi geçerli' : '✕ Dekont tarihi eksik'}</p>
          <p className={!form.odemeYapan.trim() ? 'text-rose-700' : 'text-emerald-700'}>{form.odemeYapan.trim() ? '✓ Ödeme yapan bilgisi mevcut' : '✕ Ödeme yapan bilgisi eksik'}</p>
          <p className={!tutarUyumlu ? 'text-rose-700' : 'text-emerald-700'}>{tutarUyumlu ? '✓ Dekont tutarı hesaplanan tutarla eşleşiyor' : `✕ Dekont tutarı hesaplanan tutarla eşleşmiyor · Hesaplanan: ${formatTL(beklenenTutar)} · Dekontta ödenen: ${formatTL(odenen)} · Fark: ${formatTL(Math.abs(fark))}`}</p>
          {duplicateKaydi && <p className="text-rose-700">Kullanıldığı kayıt: <Link className="underline" to={`/kayitlar/${duplicateKaydi.kayitNo}`}>{duplicateKaydi.kayitNo}</Link></p>}
          {hashDuplicateKaydi && <p className="text-rose-700">Dijital dosya kullanıldığı kayıt: {hashDuplicateKaydi.kayitNo}</p>}
          {benzerKaydi && !duplicateKaydi && !hashDuplicateKaydi && <p className="text-amber-700">Benzer bir ödeme kaydı bulundu: {benzerKaydi.kayitNo}. Lütfen kontrol ediniz.</p>}
        </div>
      </section>
      <KuralNotu ton="uyari">Kayıt öncesinde yanlış dosya “Dosyayı kaldır” ile silinebilir. OCR başarısız olsa da bilgiler manuel tamamlanabilir.</KuralNotu>
      </>}
      </section>
    </div>);

}