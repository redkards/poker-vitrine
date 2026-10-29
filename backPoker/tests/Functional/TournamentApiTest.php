<?php

namespace App\Tests\Functional;

use App\Entity\Tournament;
use App\Enum\TournamentZone;
use App\Service\TournamentImporter;

/**
 * Calendrier des tournois : tournois à venir uniquement, filtre par zone, import rejouable.
 */
class TournamentApiTest extends ApiTestCase
{
    private function tournament(string $name, TournamentZone $zone, string $start, string $end, bool $published = true): Tournament
    {
        $t = (new Tournament())->setName($name)->setZone($zone)->setCountry($zone->label())->setCity('Ville')
            ->setStartDate(new \DateTimeImmutable($start))->setEndDate(new \DateTimeImmutable($end))
            ->setIsPublished($published)->setSources([['name' => 'Organisateur', 'url' => 'https://exemple.fr']]);
        $this->em->persist($t);

        return $t;
    }

    public function testUpcomingOnlySortedAndFilteredByZone(): void
    {
        $this->tournament('Passé', TournamentZone::France, '-20 days', '-10 days');
        $this->tournament('En cours', TournamentZone::Belgique, '-2 days', '+3 days');
        $this->tournament('Plus tard', TournamentZone::France, '+30 days', '+35 days');
        $this->tournament('Bientôt', TournamentZone::International, '+5 days', '+9 days');
        $this->tournament('Masqué', TournamentZone::France, '+5 days', '+6 days', false);
        $this->em->flush();

        $all = $this->jsonRequest('GET', '/api/tournaments');
        self::assertResponseIsSuccessful();
        self::assertSame(['En cours', 'Bientôt', 'Plus tard'], array_column($all['items'], 'name'));
        self::assertSame(['france' => 1, 'belgique' => 1, 'international' => 1], array_column($all['zones'], 'count', 'value'));

        $france = $this->jsonRequest('GET', '/api/tournaments?zone=france');
        self::assertSame(['Plus tard'], array_column($france['items'], 'name'));
        self::assertSame('France', $france['items'][0]['zoneLabel']);

        $this->jsonRequest('GET', '/api/tournaments?zone=mars');
        self::assertResponseStatusCodeSame(400);
    }

    public function testImportIsIdempotentAndRejectsInvalidRows(): void
    {
        $file = sys_get_temp_dir().'/tournois-test-'.uniqid().'.json';
        file_put_contents($file, json_encode([
            ['name' => 'Festival test', 'zone' => 'belgique', 'country' => 'Belgique', 'city' => 'Namur', 'startDate' => '2099-01-10', 'endDate' => '2099-01-17', 'url' => 'javascript:alert(1)', 'sources' => [['name' => 'Officiel', 'url' => 'https://exemple.be'], ['name' => 'Piège', 'url' => 'ftp://x']]],
            ['name' => 'Dates inversées', 'zone' => 'france', 'city' => 'Paris', 'startDate' => '2099-02-10', 'endDate' => '2099-02-01'],
            ['name' => 'Zone inconnue', 'zone' => 'lune', 'city' => 'X', 'startDate' => '2099-03-01', 'endDate' => '2099-03-02'],
        ]));

        $importer = static::getContainer()->get(TournamentImporter::class);
        $first = $importer->importFile($file);
        $second = $importer->importFile($file);
        unlink($file);

        self::assertSame(1, $first['created']);
        self::assertSame(2, $first['skipped']);
        self::assertSame(0, $second['created']);
        self::assertSame(1, $second['updated'], 'réimport = mise à jour, pas de doublon');

        $this->em->clear();
        $t = $this->em->getRepository(Tournament::class)->findOneBy(['name' => 'Festival test']);
        self::assertNull($t->getUrl(), 'URL non http(s) refusée');
        self::assertSame([['name' => 'Officiel', 'url' => 'https://exemple.be']], $t->getSources());
    }
}
