import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEGAL, LegalSection, isPending, scrollToSection } from '../legal.config';

/**
 * Politique de confidentialité (RGPD, art. 13) : /confidentialite
 */
@Component({
  selector: 'app-confidentialite',
  imports: [RouterLink],
  templateUrl: './confidentialite.component.html',
  styleUrl: '../legal-layout.scss',
})
export class ConfidentialiteComponent {
  protected readonly legal = LEGAL;
  protected readonly pending = isPending;
  protected readonly scrollTo = scrollToSection;

  protected readonly sections: LegalSection[] = [
    { id: 'responsable', label: 'Responsable du traitement' },
    { id: 'donnees', label: 'Données collectées et finalités' },
    { id: 'bases-legales', label: 'Bases légales' },
    { id: 'durees', label: 'Durées de conservation' },
    { id: 'destinataires', label: 'Destinataires' },
    { id: 'droits', label: 'Vos droits et comment les exercer' },
    { id: 'cnil', label: 'Réclamation auprès de la CNIL' },
    { id: 'cookies', label: 'Cookies et stockage local' },
    { id: 'securite', label: 'Sécurité' },
    { id: 'modifications', label: 'Modification de la politique' },
  ];
}
