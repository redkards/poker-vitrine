import { Pipe, PipeTransform } from '@angular/core';

const FORMAT = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

/** Montant en centimes → « 24,90 € » */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(cents: number | null | undefined): string {
    return FORMAT.format((cents ?? 0) / 100);
  }
}
