import { Component, computed, input, linkedSignal } from '@angular/core';

export interface StackZone {
  min: number;
  max: number;
  label: string;
  text: string;
}

const MAX_BB = 100;

export const STACK_ZONES: StackZone[] = [
  { min: 0, max: 10, label: 'Moins de 10 BB', text: 'Tapis ou se coucher : une relance engagerait presque tout votre tapis.' },
  { min: 10, max: 15, label: '10 à 15 BB', text: 'Tapis court : on ouvre souvent directement à tapis, ou on se couche.' },
  { min: 15, max: 25, label: '15 à 25 BB', text: "Tapis moyen : on simplifie. Relancer ou se coucher, et relancer à tapis plutôt que payer face à une relance." },
  { min: 25, max: 40, label: '25 à 40 BB', text: 'Zone de transition : on joue encore après le flop, mais on évite de payer trop de relances.' },
  { min: 40, max: Infinity, label: 'Plus de 40 BB', text: 'Tapis profond : de la marge pour jouer après le flop et utiliser les mains spéculatives.' },
];

export function zoneFor(bb: number): StackZone {
  return STACK_ZONES.find((z) => bb >= z.min && bb < z.max) ?? STACK_ZONES[STACK_ZONES.length - 1];
}

/**
 * Jauge de tapis exprimée en grosses blindes, avec calculatrice optionnelle.
 */
@Component({
  selector: 'app-stack-gauge',
  templateUrl: './stack-gauge.component.html',
  styleUrl: './stack-gauge.component.scss',
})
export class StackGaugeComponent {
  readonly bb = input.required<number>();
  readonly interactive = input(true);
  readonly calculator = input<{ chips: number; bigBlind: number } | undefined>(undefined);

  protected readonly max = MAX_BB;
  protected readonly zones = STACK_ZONES;

  protected readonly chips = linkedSignal(() => this.calculator()?.chips ?? 0);
  protected readonly bigBlind = linkedSignal(() => this.calculator()?.bigBlind ?? 0);
  private readonly sliderValue = linkedSignal(() => this.bb());

  protected readonly value = computed(() => {
    if (this.calculator()) {
      const bb = this.bigBlind();
      return bb > 0 ? Math.round((this.chips() / bb) * 10) / 10 : 0;
    }
    return this.sliderValue();
  });
  protected readonly zone = computed(() => zoneFor(this.value()));
  protected readonly percent = computed(() => Math.min(100, (this.value() / MAX_BB) * 100));
  protected readonly display = computed(() => this.value().toLocaleString('fr-FR', { maximumFractionDigits: 1 }));

  protected width(z: StackZone): number {
    return ((Math.min(z.max, MAX_BB) - z.min) / MAX_BB) * 100;
  }

  protected onSlider(event: Event): void {
    this.sliderValue.set(Number((event.target as HTMLInputElement).value));
  }

  protected onChips(event: Event): void {
    this.chips.set(Math.max(0, Number((event.target as HTMLInputElement).value) || 0));
  }

  protected onBigBlind(event: Event): void {
    this.bigBlind.set(Math.max(0, Number((event.target as HTMLInputElement).value) || 0));
  }
}
