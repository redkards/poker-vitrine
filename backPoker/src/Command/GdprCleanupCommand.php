<?php

namespace App\Command;

use App\Service\GdprService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Purge RGPD à planifier chaque nuit (cron o2switch) :
 *   php bin/console app:gdpr:cleanup
 */
#[AsCommand(name: 'app:gdpr:cleanup', description: 'Efface les IP de plus de 90 jours et anonymise les comptes inactifs depuis 3 ans')]
class GdprCleanupCommand extends Command
{
    public function __construct(private readonly GdprService $gdpr)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('dry-run', null, InputOption::VALUE_NONE, 'Affiche ce qui serait traité sans rien modifier');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $dryRun = (bool) $input->getOption('dry-run');

        $result = $this->gdpr->cleanup($dryRun);

        $io->{$dryRun ? 'note' : 'success'}(sprintf(
            '%s%d adresse(s) IP effacée(s), %d compte(s) inactif(s) anonymisé(s).',
            $dryRun ? '[Simulation] ' : '',
            $result['ipPurged'],
            $result['accountsAnonymized'],
        ));

        return Command::SUCCESS;
    }
}
