/**
 * Informations légales du site — UNIQUE fichier à compléter par le propriétaire.
 *
 * Remplacez chaque valeur « [À COMPLÉTER : …] » par l'information réelle.
 * Les pages Mentions légales, Politique de confidentialité et CGU lisent ce fichier.
 * Une valeur non remplie reste affichée surlignée sur le site.
 */
export const LEGAL = {
  editor: {
    /** Nom et prénom (particulier) ou raison sociale (société, association) */
    name: 'Jérémy Duhem',
    /** Ex. : particulier, auto-entrepreneur, SAS au capital de…, association loi 1901 */
    status: 'Particulier',
    address: 'Non publiée (éditeur non professionnel) : coordonnées communiquées à l\'hébergeur, art. 6 III-2 de la LCEN',
    email: 'contact.redcard@redkards-dev.fr',
    /** Adresse dédiée aux demandes relatives aux données personnelles */
    privacyEmail: 'contact.redcard@redkards-dev.fr',
    phone: 'Non publié : contact par email',
    /** Uniquement si l'éditeur est un professionnel ; sinon indiquer « Non applicable » */
    siret: 'Non applicable',
  },
  publicationDirector: 'Jérémy Duhem',
  host: {
    name: 'o2switch',
    address: 'Chemin des Pardiaux, 63000 Clermont-Ferrand, France',
    phone: '04 44 44 60 40',
    siren: '510 909 807 (RCS Clermont-Ferrand), SAS au capital de 100 000 €',
  },
  /** Abonnement Premium (CGV) : à rédiger avant l'ouverture du paiement en ligne */
  premium: {
    prices: '[À COMPLÉTER : prix TTC des formules mensuelle et annuelle, et modalités de paiement]',
    renewal: '[À COMPLÉTER : durée et renouvellement (tacite ou non) de l\'abonnement, information préalable du membre]',
    cancellation: '[À COMPLÉTER : modalités et délai de résiliation, sort de la période en cours]',
    withdrawal:
      '[À COMPLÉTER : droit de rétractation de 14 jours (contenu numérique : conditions de renonciation expresse si accès immédiat) et formulaire de rétractation]',
  },
  lastUpdate: '29 octobre 2026',
  cguVersion: '1.0',
} as const;

/** Vrai si la valeur n'a pas encore été renseignée (affichage surligné). */
export function isPending(value: string): boolean {
  return value.startsWith('[À COMPLÉTER');
}

/** Entrée du sommaire d'une page légale. */
export interface LegalSection {
  id: string;
  label: string;
}

/**
 * Défilement vers une section du sommaire (le routeur n'active pas l'anchorScrolling).
 */
export function scrollToSection(event: Event, id: string): void {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
  history.replaceState(history.state, '', `${location.pathname}#${id}`);
}
