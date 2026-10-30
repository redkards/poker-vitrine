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
    name: '[À COMPLÉTER : nom et prénom ou raison sociale de l\'éditeur]',
    /** Ex. : particulier, auto-entrepreneur, SAS au capital de…, association loi 1901 */
    status: '[À COMPLÉTER : statut juridique de l\'éditeur]',
    address: '[À COMPLÉTER : adresse postale de l\'éditeur]',
    email: '[À COMPLÉTER : email de contact]',
    /** Adresse dédiée aux demandes relatives aux données personnelles */
    privacyEmail: '[À COMPLÉTER : email du contact RGPD]',
    phone: '[À COMPLÉTER : numéro de téléphone]',
    /** Uniquement si l'éditeur est un professionnel ; sinon indiquer « Non applicable » */
    siret: '[À COMPLÉTER : numéro SIRET (si professionnel) ou « Non applicable »]',
  },
  publicationDirector: '[À COMPLÉTER : nom du directeur ou de la directrice de la publication]',
  host: {
    name: 'o2switch',
    address: '[À COMPLÉTER : adresse d\'o2switch — à copier depuis les mentions légales de o2switch.fr]',
    phone: '[À COMPLÉTER : téléphone d\'o2switch — à copier depuis les mentions légales de o2switch.fr]',
    siren: '[À COMPLÉTER : SIREN d\'o2switch — à copier depuis les mentions légales de o2switch.fr]',
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
