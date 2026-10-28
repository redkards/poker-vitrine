<?php

namespace App\Service;

use App\Entity\ConsentLog;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Traitements RGPD. Export et suppression de compte arrivent au Sprint 4.
 */
class GdprService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        #[Autowire(env: 'CGU_VERSION')]
        private readonly string $cguVersion,
    ) {
    }

    public function getCurrentCguVersion(): string
    {
        return $this->cguVersion;
    }

    /**
     * Enregistre l'acceptation des CGU sur l'utilisateur et en garde la preuve (ConsentLog).
     * Le flush est laissé à l'appelant.
     */
    public function recordConsent(User $user, ?string $ipAddress): ConsentLog
    {
        $now = new \DateTimeImmutable();

        $user->setConsentVersion($this->cguVersion);
        $user->setConsentAt($now);

        $log = (new ConsentLog())
            ->setCguVersion($this->cguVersion)
            ->setIpAddress($ipAddress);
        $user->addConsentLog($log);

        $this->em->persist($log);

        return $log;
    }
}
