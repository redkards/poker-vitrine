import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEGAL, LegalSection, isPending, scrollToSection } from '../legal.config';

/**
 * Conditions générales de vente de la boutique (v2.0) : /cgv
 * Modèle à compléter et à faire relire avant l'ouverture de la boutique.
 */
@Component({
  selector: 'app-cgv',
  imports: [RouterLink],
  templateUrl: './cgv.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: '../legal-layout.scss',
})
export class CgvComponent {
  protected readonly legal = LEGAL;
  protected readonly pending = isPending;
  protected readonly scrollTo = scrollToSection;

  /** Informations propres à la vente, à renseigner avant l'ouverture */
  protected readonly shop = {
    vatNumber: '[À COMPLÉTER : numéro de TVA intracommunautaire]',
    rcs: '[À COMPLÉTER : immatriculation RCS / RNE]',
    shippingFees: '[À COMPLÉTER : frais de livraison par pays et seuil de gratuité éventuel]',
    shippingDelay: '[À COMPLÉTER : délai d\'expédition et de livraison (ex. expédition sous 2 jours ouvrés)]',
    carrier: '[À COMPLÉTER : transporteur(s)]',
    returnAddress: '[À COMPLÉTER : adresse de retour des produits]',
    mediator: '[À COMPLÉTER : nom, adresse et site web du médiateur de la consommation]',
    lastUpdate: '[À COMPLÉTER : date de mise en ligne des CGV]',
  };

  protected readonly sections: LegalSection[] = [
    { id: 'objet', label: 'Objet et vendeur' },
    { id: 'produits', label: 'Produits' },
    { id: 'prix', label: 'Prix et TVA' },
    { id: 'commande', label: 'Commande' },
    { id: 'paiement', label: 'Paiement' },
    { id: 'livraison', label: 'Livraison' },
    { id: 'retractation', label: 'Droit de rétractation' },
    { id: 'garanties', label: 'Garanties légales' },
    { id: 'donnees', label: 'Données personnelles' },
    { id: 'mediation', label: 'Réclamations et médiation' },
    { id: 'droit', label: 'Droit applicable' },
  ];
}
