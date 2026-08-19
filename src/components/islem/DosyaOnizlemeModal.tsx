import React from 'react';
import { FileText, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
'../ui/Dialog';
import { DekontDosyasi } from '../../types';

interface DosyaOnizlemeModalProps {
  dosya: DekontDosyasi | null;
  acik: boolean;
  kapat: () => void;
}

export function DosyaOnizlemeModal({ dosya, acik, kapat }: DosyaOnizlemeModalProps) {
  if (!dosya) return null;
  const gorsel = dosya.tur === 'JPG' || dosya.tur === 'PNG';

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dosya.ad}</DialogTitle>
          <DialogDescription>
            {dosya.tur} · {(dosya.boyutKb / 1024).toFixed(2)} MB ·{' '}
            {dosya.yontem === 'PERSONEL' ? 'Personel ekranı' : 'QR/link'} · {dosya.yuklemeZamani}
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 text-muted-foreground">
          {gorsel ?
          <ImageIcon className="h-10 w-10" aria-hidden="true" /> :

          <FileText className="h-10 w-10" aria-hidden="true" />
          }
          <p className="text-sm font-medium text-foreground">
            {gorsel ? 'Görsel önizleme' : 'PDF önizleme'}
          </p>
          <p className="max-w-xs text-center text-xs">
            Demo ortamında dosya içeriği simüle edilir. Gerçek sistemde dosya güvenli storage
            üzerinden yetkili kullanıcıya açılır ve görüntüleme audit log’a yazılır.
          </p>
        </div>
      </DialogContent>
    </Dialog>);

}