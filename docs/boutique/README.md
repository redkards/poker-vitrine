# Boutique — v2.0 (en préparation)

Boutique « standard » de livres de formation et d'accessoires de poker, développée sur la branche
`feature/boutique-v2`. **Elle est désactivée par défaut** : même fusionnée dans `main`, elle reste invisible
tant que les deux drapeaux ci-dessous ne sont pas activés.

## Contenu

| Couche | Éléments |
| --- | --- |
| API | `GET /api/shop/products[?category=livre\|accessoire]`, `GET /api/shop/products/{slug}`, `POST /api/shop/orders` (membre à l'email vérifié, 5 commandes / 10 min), `GET /api/me/orders` |
| Données | `product`, `shop_order`, `order_item` (migration `Version20261030100000`) ; montants en centimes TTC, TVA 5,5 % (livres) / 20 % (accessoires) |
| Paiement | `PaymentProviderInterface` ; `FakePaymentProvider` actif (aucun paiement, commande « en attente ») ; `StripeCheckoutPaymentProvider` préparé, **non branché** |
| Back-office | EasyAdmin : section « Boutique (v2.0) » — Produits (CRUD), Commandes (lecture, « Marquer expédiée », « Annuler » avec remise en stock) |
| Front | `/boutique` (filtre catégorie), `/boutique/:slug`, `/boutique/panier` (panier localStorage + adresse + CGV), `/mon-espace/commandes`, `/cgv` |
| RGPD | Commandes incluses dans l'export ; à l'anonymisation, commandes conservées sans lien vers le compte ni téléphone (obligation comptable, voir `GdprService::anonymize`) |

Sécurité : le serveur ne lit que les slugs et quantités envoyés ; prix, TVA et totaux sont recalculés depuis le
catalogue. Le stock est réservé par décrément atomique (`UPDATE … WHERE stock >= :quantité`) dans une
transaction : une commande dont une ligne échoue n'est pas enregistrée. Une annulation remet le stock.

## Activer la boutique

1. **API** : dans `backPoker/.env.local` du serveur, `SHOP_ENABLED=1` (sinon les routes répondent 404).
2. **Front** : `shopEnabled: true` dans `frontPoker/src/environments/environment.ts` (lien du menu, routes,
   CGV, « Mes commandes »), puis rebuild et publication.
3. **Base** : `php bin/console doctrine:migrations:migrate` (crée les 3 tables).
4. **Paiement Stripe** (indispensable avant toute vente réelle) :
   - `composer require stripe/stripe-php` puis compléter `StripeCheckoutPaymentProvider::createCheckout()`
     (création de session avec `buildSessionParameters()`, retour de `$session->url`) ;
   - poser sur le serveur, dans `.env.local` (jamais dans Git) : `STRIPE_SECRET_KEY=sk_live_…`,
     `STRIPE_PUBLIC_KEY=pk_live_…`, `STRIPE_WEBHOOK_SECRET=whsec_…` (tester d'abord avec les clés `sk_test_`) ;
   - créer le webhook `POST /api/stripe/webhook` (déjà public dans `security.yaml`) : vérifier la signature,
     puis sur `checkout.session.completed` appeler `ShopService::markPaid()` ;
   - dans `config/services.yaml`, faire pointer `PaymentProviderInterface` vers `StripeCheckoutPaymentProvider`.
5. Remplacer les produits de démonstration (fixtures) par le vrai catalogue dans le back-office.

## Obligations légales à valider avant ouverture

- **CGV** (`/cgv`) : compléter tous les champs `[À COMPLÉTER]` (frais et délais de livraison, transporteur,
  adresse de retour, frais de retour, RCS, n° de TVA) et faire relire par un professionnel.
- **Médiateur de la consommation** : adhésion obligatoire (Code de la consommation, art. L612-1) ; ses
  coordonnées doivent figurer dans les CGV.
- **TVA** : vérifier le régime (franchise en base ou assujetti), les taux 5,5 % (livres, CGI art. 278-0 bis) et
  20 %, et les règles de vente à distance UE (Belgique, Luxembourg : guichet OSS au-delà de 10 000 € / an).
- **Factures** : à émettre pour chaque vente (numérotation continue, mentions obligatoires) — non développé.
- **Frais de port** : non gérés par l'API (livraison incluse dans les prix) ; à décider avant ouverture.
- **Rétractation 14 jours** : procédure de remboursement chez Stripe ; exception « produits descellés » à valider.
- **Mentions légales / confidentialité** : ajouter le traitement « commandes » (base légale contrat et obligation
  légale, durée 10 ans) et le sous-traitant Stripe ; mettre à jour la phrase « aucune vente » des CGU.
- **Jeu responsable** : les jetons n'ont aucune valeur monétaire (rappelé dans les CGV).
