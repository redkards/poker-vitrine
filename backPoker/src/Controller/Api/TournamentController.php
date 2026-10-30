<?php

namespace App\Controller\Api;

use App\Entity\Tournament;
use App\Enum\TournamentZone;
use App\Repository\TournamentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Calendrier des tournois live à venir (public) : ?zone=france|belgique|international
 */
class TournamentController extends AbstractController
{
    #[Route('/api/tournaments', name: 'api_tournaments', methods: ['GET'])]
    public function list(TournamentRepository $tournaments, #[MapQueryParameter] ?string $zone = null): JsonResponse
    {
        $zoneEnum = $zone ? TournamentZone::tryFrom($zone) : null;
        if ($zone && !$zoneEnum) {
            return $this->json(['message' => 'Zone inconnue (france, belgique, international ou en-ligne).'], Response::HTTP_BAD_REQUEST);
        }

        $all = $tournaments->findUpcoming();
        $counts = array_fill_keys(array_map(static fn (TournamentZone $z) => $z->value, TournamentZone::cases()), 0);
        foreach ($all as $t) {
            ++$counts[$t->getZone()->value];
        }

        $items = $zoneEnum ? array_values(array_filter($all, static fn (Tournament $t) => $t->getZone() === $zoneEnum)) : $all;

        $response = $this->json([
            'items' => array_map(static fn (Tournament $t) => [
                'id' => $t->getId(),
                'name' => $t->getName(),
                'circuit' => $t->getCircuit(),
                'zone' => $t->getZone()->value,
                'zoneLabel' => $t->getZone()->label(),
                'country' => $t->getCountry(),
                'city' => $t->getCity(),
                'venue' => $t->getVenue(),
                'startDate' => $t->getStartDate()->format('Y-m-d'),
                'endDate' => $t->getEndDate()->format('Y-m-d'),
                'mainEventBuyIn' => $t->getMainEventBuyIn(),
                'guarantee' => $t->getGuarantee(),
                'url' => $t->getUrl(),
                'status' => $t->getStatus(),
                'note' => $t->getNote(),
                'sources' => $t->getSources(),
            ], $items),
            'zones' => array_map(static fn (TournamentZone $z) => ['value' => $z->value, 'label' => $z->label(), 'count' => $counts[$z->value]], TournamentZone::cases()),
        ]);

        return $response->setPublic()->setMaxAge(600);
    }
}
