<?php

namespace App\Service;

use App\Entity\Tournament;
use App\Enum\TournamentZone;
use App\Repository\TournamentRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Import du calendrier depuis docs/calendrier/*.json.
 * Format : [{ name, circuit, zone, country, city, venue, startDate, endDate, mainEventBuyIn,
 *             guarantee, url, status, note, sources[{name, url}] }]
 * Un tournoi déjà présent (même nom, même date de début) est mis à jour : l'import est rejouable.
 */
class TournamentImporter
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly TournamentRepository $tournaments,
    ) {
    }

    /**
     * @return array{created: int, updated: int, skipped: int, warnings: list<string>}
     *
     * @throws \JsonException|\RuntimeException
     */
    public function importFile(string $file): array
    {
        if (!is_file($file)) {
            throw new \RuntimeException(sprintf('Fichier introuvable : %s', $file));
        }

        $items = json_decode((string) file_get_contents($file), true, 512, \JSON_THROW_ON_ERROR);
        $created = $updated = $skipped = 0;
        $warnings = [];

        foreach ($items as $i => $item) {
            $zone = TournamentZone::tryFrom((string) ($item['zone'] ?? ''));
            $start = $this->date($item['startDate'] ?? null);
            $end = $this->date($item['endDate'] ?? null);
            $name = trim((string) ($item['name'] ?? ''));

            if (!$zone || !$start || !$end || '' === $name || $end < $start) {
                $warnings[] = sprintf('Élément %d ignoré : zone, nom ou dates invalides.', $i + 1);
                ++$skipped;
                continue;
            }

            $tournament = $this->tournaments->findOneBy(['name' => $name, 'startDate' => $start]);
            $tournament ? ++$updated : ++$created;
            $tournament ??= new Tournament();

            $url = (string) ($item['url'] ?? '');
            $tournament
                ->setName($name)
                ->setCircuit($item['circuit'] ?? null)
                ->setZone($zone)
                ->setCountry((string) ($item['country'] ?? $zone->label()))
                ->setCity((string) ($item['city'] ?? ''))
                ->setVenue($item['venue'] ?? null)
                ->setStartDate($start)
                ->setEndDate($end)
                ->setMainEventBuyIn($item['mainEventBuyIn'] ?? null)
                ->setGuarantee($item['guarantee'] ?? null)
                ->setUrl(preg_match('#^https?://#', $url) ? $url : null)
                ->setStatus(Tournament::STATUS_TO_CONFIRM === ($item['status'] ?? null) ? Tournament::STATUS_TO_CONFIRM : Tournament::STATUS_CONFIRMED)
                ->setNote($item['note'] ?? null)
                ->setSources(array_values(array_filter(
                    array_map(static fn ($s) => ['name' => (string) ($s['name'] ?? ''), 'url' => (string) ($s['url'] ?? '')], $item['sources'] ?? []),
                    static fn ($s) => (bool) preg_match('#^https?://#', $s['url']),
                )));

            $this->em->persist($tournament);
        }

        $this->em->flush();

        return ['created' => $created, 'updated' => $updated, 'skipped' => $skipped, 'warnings' => $warnings];
    }

    private function date(mixed $value): ?\DateTimeImmutable
    {
        return \is_string($value) ? (\DateTimeImmutable::createFromFormat('!Y-m-d', $value) ?: null) : null;
    }
}
