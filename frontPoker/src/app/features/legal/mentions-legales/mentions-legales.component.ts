import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEGAL, LegalSection, isPending, scrollToSection } from '../legal.config';

/**
 * Mentions légales (LCEN, art. 6-III) : /mentions-legales
 */
@Component({
  selector: 'app-mentions-legales',
  imports: [RouterLink],
  templateUrl: './mentions-legales.component.html',
  styleUrl: '../legal-layout.scss',
})
export class MentionsLegalesComponent {
  protected readonly legal = LEGAL;
  protected readonly pending = isPending;
  protected readonly scrollTo = scrollToSection;

  protected readonly sections: LegalSection[] = [
    { id: 'editeur', label: 'Éditeur du site' },
    { id: 'directeur', label: 'Directeur de la publication' },
    { id: 'hebergeur', label: 'Hébergeur' },
    { id: 'propriete', label: 'Propriété intellectuelle' },
    { id: 'responsabilite', label: 'Responsabilité' },
    { id: 'jeu-responsable', label: 'Jeu responsable' },
    { id: 'autres', label: 'Données personnelles et CGU' },
  ];
}
