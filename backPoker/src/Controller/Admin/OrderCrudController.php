<?php

namespace App\Controller\Admin;

use App\Entity\Order;
use App\Enum\OrderStatus;
use App\Exception\ShopException;
use App\Service\ShopService;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminRoute;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Boutique (v2.0) — Commandes. Lecture seule : elles sont créées par les clients et ne se
 * suppriment pas (pièces comptables). Seules les transitions de statut sont possibles.
 */
#[IsGranted('ROLE_ADMIN')]
class OrderCrudController extends AbstractCrudController
{
    public function __construct(
        private readonly ShopService $shop,
        private readonly AdminUrlGenerator $urls,
    ) {
    }

    public static function getEntityFqcn(): string
    {
        return Order::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Commande')
            ->setEntityLabelInPlural('Commandes')
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setSearchFields(['reference', 'shippingName', 'shippingCity', 'user.email', 'user.pseudo']);
    }

    public function configureActions(Actions $actions): Actions
    {
        $ship = Action::new('ship', 'Marquer expédiée', 'fa fa-truck')
            ->linkToCrudAction('ship')
            ->renderAsForm()
            ->askConfirmation('Marquer la commande %entity_id% comme expédiée ?')
            ->displayIf(static fn (Order $o) => OrderStatus::Payee === $o->getStatus());
        $cancel = Action::new('cancel', 'Annuler', 'fa fa-ban')
            ->linkToCrudAction('cancel')
            ->renderAsForm()
            ->askConfirmation('Annuler la commande ? Les articles retournent en stock ; un éventuel remboursement se fait chez le prestataire de paiement.')
            ->displayIf(static fn (Order $o) => \in_array($o->getStatus(), [OrderStatus::EnAttente, OrderStatus::Payee], true));

        return $actions
            ->disable(Action::NEW, Action::EDIT, Action::DELETE)
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_DETAIL, $ship)
            ->add(Crud::PAGE_DETAIL, $cancel);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters->add(ChoiceFilter::new('status', 'Statut')->setChoices(OrderStatus::choices()));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield TextField::new('reference', 'Référence');
        yield AssociationField::new('user', 'Membre')->setHelp('Vide si le compte a été supprimé (RGPD).');
        yield ChoiceField::new('status', 'Statut')->setChoices(OrderStatus::choices())->renderAsBadges([
            OrderStatus::EnAttente->value => 'warning',
            OrderStatus::Payee->value => 'success',
            OrderStatus::Expediee->value => 'info',
            OrderStatus::Annulee->value => 'secondary',
        ]);
        yield MoneyField::new('totalInclTaxCents', 'Total TTC')->setCurrency('EUR')->setStoredAsCents(true);
        yield MoneyField::new('totalExclTaxCents', 'Total HT')->setCurrency('EUR')->setStoredAsCents(true)->onlyOnDetail();
        yield MoneyField::new('totalVatCents', 'TVA')->setCurrency('EUR')->setStoredAsCents(true)->onlyOnDetail();
        yield CollectionField::new('items', 'Articles')->onlyOnDetail();
        yield TextField::new('shippingAddress', 'Adresse de livraison')->onlyOnDetail();
        yield TextField::new('shippingPhone', 'Téléphone')->onlyOnDetail();
        yield TextField::new('paymentReference', 'Référence paiement')->onlyOnDetail();
        yield DateTimeField::new('createdAt', 'Passée le');
        yield DateTimeField::new('paidAt', 'Payée le')->onlyOnDetail();
        yield DateTimeField::new('shippedAt', 'Expédiée le')->onlyOnDetail();
    }

    #[AdminRoute('/{id}/ship', 'ship', options: ['methods' => ['POST']])]
    public function ship(#[MapEntity(id: 'id')] Order $order): Response
    {
        return $this->transition($order, fn () => $this->shop->markShipped($order), 'Commande marquée expédiée.');
    }

    #[AdminRoute('/{id}/cancel', 'cancel', options: ['methods' => ['POST']])]
    public function cancel(#[MapEntity(id: 'id')] Order $order): Response
    {
        return $this->transition($order, fn () => $this->shop->cancel($order), 'Commande annulée, stock remis à jour.');
    }

    private function transition(Order $order, callable $operation, string $success): Response
    {
        try {
            $operation();
            $this->addFlash('success', $success);
        } catch (ShopException $e) {
            $this->addFlash('danger', $e->getMessage());
        }

        return $this->redirect($this->urls->setController(self::class)->setAction(Action::DETAIL)->setEntityId($order->getId())->generateUrl());
    }
}
