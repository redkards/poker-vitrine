<?php

namespace App\Command;

use App\Service\TournamentImporter;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Importe le calendrier des tournois (local ou production) :
 *   php bin/console app:tournaments:import ../docs/calendrier/tournois-2026-2027.json
 */
#[AsCommand(name: 'app:tournaments:import', description: 'Importe le calendrier des tournois depuis un fichier JSON')]
class ImportTournamentsCommand extends Command
{
    public function __construct(private readonly TournamentImporter $importer)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('file', InputArgument::REQUIRED, 'Chemin du fichier JSON');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $result = $this->importer->importFile((string) $input->getArgument('file'));
        } catch (\JsonException|\RuntimeException $e) {
            $io->error($e->getMessage());

            return Command::FAILURE;
        }

        foreach ($result['warnings'] as $warning) {
            $io->warning($warning);
        }
        $io->success(sprintf('%d tournoi(s) ajouté(s), %d mis à jour, %d ignoré(s).', $result['created'], $result['updated'], $result['skipped']));

        return Command::SUCCESS;
    }
}
