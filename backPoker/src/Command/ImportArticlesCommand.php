<?php

namespace App\Command;

use App\Repository\UserRepository;
use App\Service\ArticleImporter;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Importe des actualités depuis un fichier JSON, en local ou en production :
 *   php bin/console app:articles:import ../docs/actualites/actualites-2026-10.json --author=admin@pokervitrine.local
 */
#[AsCommand(name: 'app:articles:import', description: 'Importe des actualités depuis un fichier JSON')]
class ImportArticlesCommand extends Command
{
    public function __construct(
        private readonly ArticleImporter $importer,
        private readonly UserRepository $users,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('file', InputArgument::REQUIRED, 'Chemin du fichier JSON')
            ->addOption('author', null, InputOption::VALUE_REQUIRED, 'Email du compte auteur (facultatif)')
            ->addOption('draft', null, InputOption::VALUE_NONE, 'Importer en brouillon (sans date de publication) pour relecture');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $author = null;
        if ($email = $input->getOption('author')) {
            $author = $this->users->findOneBy(['email' => mb_strtolower((string) $email)]);
            if (!$author) {
                $io->error(sprintf('Aucun compte avec l’email %s.', $email));

                return Command::FAILURE;
            }
        }

        try {
            $result = $this->importer->importFile((string) $input->getArgument('file'), $author, (bool) $input->getOption('draft'));
        } catch (\JsonException|\RuntimeException $e) {
            $io->error($e->getMessage());

            return Command::FAILURE;
        }

        foreach ($result['warnings'] as $warning) {
            $io->warning($warning);
        }
        $io->success(sprintf('%d actualité(s) importée(s), %d ignorée(s).', $result['created'], $result['skipped']));

        return Command::SUCCESS;
    }
}
