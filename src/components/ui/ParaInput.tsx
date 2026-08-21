import { useEffect, useState } from 'react';
import { Input } from './Input';
import { formatTL, paraDuzenlemeMetni, parseTL } from '../../utils/currency';

export interface ParaInputProps extends
  Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  /** Sayısal değer; boş alan için null. */
  value: number | null;
  onValueChange: (deger: number | null) => void;
}

/**
 * TL formatlı kontrollü para giriş alanı.
 * Odak dışında "70.893,00 TL", odakta "70893,00" gösterir.
 * Negatif tutar kabul edilmez; iç hesaplamalar sayısal değer üzerinden yürür.
 */
export function ParaInput({ value, onValueChange, ...props }: ParaInputProps) {
  const [odakli, setOdakli] = useState(false);
  const [metin, setMetin] = useState(value === null ? '' : formatTL(value));

  useEffect(() => {
    if (odakli) return;
    setMetin(value === null ? '' : formatTL(value));
  }, [value, odakli]);

  return (
    <Input
      inputMode="decimal"
      autoComplete="off"
      {...props}
      value={metin}
      onFocus={(olay) => {
        setOdakli(true);
        setMetin(paraDuzenlemeMetni(value));
        props.onFocus?.(olay);
      }}
      onChange={(olay) => {
        const yazilan = olay.target.value;
        setMetin(yazilan);
        onValueChange(yazilan.trim() === '' ? null : parseTL(yazilan));
      }}
      onBlur={(olay) => {
        setOdakli(false);
        const sayi = parseTL(metin);
        if (metin.trim() === '' || sayi === null) {
          setMetin('');
          onValueChange(null);
        } else {
          setMetin(formatTL(sayi));
          onValueChange(sayi);
        }
        props.onBlur?.(olay);
      }} />);


}