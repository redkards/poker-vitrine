<?php

namespace App\Command;

use App\Repository\UserRepository;
use App\Service\Premium\PremiumService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Activation manuelle de l'accès Premium (bêta, sans paiement en ligne) :
 *   php bin/console app:user:premium vous@exemple.fr --months=3
 *   php bin/console app:user:premium vous@exemple.fr --revoke
 */
#[AsCommand(name: 'app:user:premium', description: 'Active (ou retire) l’accès Premium d’un compte')]
class PremiumUserCommand extends Command
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly PremiumService $premium,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email du compte')
            ->addOption('months', null, InputOption::VALUE_REQUIRED, 'Durée ajoutée, en mois (1 à 36)', '1')
            ->addOption('revoke', null, InputOption::VALUE_NONE, 'Retirer l’accès Premium immédiatement');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $user = $this->users->findOneBy(['email' => mb_strtolower(trim((string) $input->getArgument('email')))]);
        if (!$user || $user->isAnonymized()) {
            $io->error('Aucun compte actif avec cet email.');

            return Command::FAILURE;
        }

        if ($input->getOption('revoke')) {
            $this->premium->revoke($user);
            $io->success(sprintf('%s : accès Premium retiré.', $user->getEmail()));

            return Command::SUCCESS;
        }

        $months = filter_var($input->getOption('months'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 36]]);
        if (false === $months) {
            $io->error('--months doit être un entier entre 1 et 36.');

            return Command::FAILURE;
        }

        $this->premium->activate($user, $months);
        $io->success(sprintf('%s : Premium jusqu’au %s.', $user->getEmail(), $user->getPremiumUntil()?->format('d/m/Y H:i')));

        return Command::SUCCESS;
    }
}
