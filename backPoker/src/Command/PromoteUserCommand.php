<?php

namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Donne un rôle à un compte existant (inscrit et email vérifié), sans requête SQL manuelle :
 *   php bin/console app:user:promote vous@exemple.fr --role=ROLE_ADMIN
 */
#[AsCommand(name: 'app:user:promote', description: 'Attribue le rôle Modérateur ou Administrateur à un compte')]
class PromoteUserCommand extends Command
{
    private const ALLOWED = ['ROLE_MODERATOR', 'ROLE_ADMIN'];

    public function __construct(
        private readonly UserRepository $users,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email du compte')
            ->addOption('role', null, InputOption::VALUE_REQUIRED, 'ROLE_MODERATOR ou ROLE_ADMIN', 'ROLE_ADMIN')
            ->addOption('revoke', null, InputOption::VALUE_NONE, 'Retirer le rôle au lieu de l’attribuer');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $role = strtoupper((string) $input->getOption('role'));

        if (!\in_array($role, self::ALLOWED, true)) {
            $io->error('Rôle accepté : '.implode(' ou ', self::ALLOWED));

            return Command::FAILURE;
        }

        $user = $this->users->findOneBy(['email' => mb_strtolower(trim((string) $input->getArgument('email')))]);
        if (!$user || $user->isAnonymized()) {
            $io->error('Aucun compte actif avec cet email.');

            return Command::FAILURE;
        }
        if (!$user->isVerified()) {
            $io->error('Ce compte n’a pas encore confirmé son adresse email.');

            return Command::FAILURE;
        }

        $roles = array_values(array_diff($user->getRoles(), ['ROLE_USER', $role]));
        if (!$input->getOption('revoke')) {
            $roles[] = $role;
        }
        $user->setRoles($roles);
        $this->em->flush();

        $io->success(sprintf('%s : rôles = %s', $user->getEmail(), implode(', ', $user->getRoles())));

        return Command::SUCCESS;
    }
}
