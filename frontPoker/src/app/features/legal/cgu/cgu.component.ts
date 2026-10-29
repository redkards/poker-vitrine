import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEGAL, LegalSection, isPending, scrollToSection } from '../legal.config';

/**
 * Conditions générales d'utilisation (version LEGAL.cguVersion) : /cgu
 */
@Component({
  selector: 'app-cgu',
  imports: [RouterLink],
  templateUrl: './cgu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: '../legal-layout.scss',
})
export class CguComponent {
  protected readonly legal = LEGAL;
  protected readonly pending = isPending;
  protected readonly scrollTo = scrollToSection;

  protected readonly sections: LegalSection[] = [
    { id: 'objet', label: 'Objet' },
    { id: 'acces', label: 'Accès au site' },
    { id: 'compte', label: 'Inscription et compte' },
    { id: 'forum', label: 'Règles du forum' },
    { id: 'moderation', label: 'Modération' },
    { id: 'contenus', label: 'Propriété des contenus publiés' },
    { id: 'responsabilite', label: 'Responsabilité' },
    { id: 'jeu-responsable', label: 'Jeu responsable' },
    { id: 'donnees', label: 'Données personnelles' },
    { id: 'suppression', label: 'Suppression du compte' },
    { id: 'evolution', label: 'Évolution des CGU' },
    { id: 'droit', label: 'Droit applicable' },
    { id: 'contact', label: 'Contact' },
  ];
}
