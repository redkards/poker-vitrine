/** Profil public d'un membre (GET /api/members/{pseudo}) : jamais d'email */
export interface MemberProfile {
  pseudo: string;
  createdAt: string | null;
  postCount: number;
}

/** Libellé affiché à la place d'un compte anonymisé (GdprService::ANONYMOUS_LABEL) */
export const ANONYMOUS_PSEUDO = 'Utilisateur supprimé';

/** Un pseudo n'a de profil public que s'il respecte le format de l'API et n'est pas anonymisé */
export function hasPublicProfile(pseudo: string | null | undefined): pseudo is string {
  return !!pseudo && pseudo !== ANONYMOUS_PSEUDO && /^[\w\-.]{3,50}$/.test(pseudo);
}
