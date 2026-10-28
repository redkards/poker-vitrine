<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

class MailService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire(env: 'MAILER_FROM')]
        private readonly string $from,
        #[Autowire(env: 'FRONTEND_URL')]
        private readonly string $frontendUrl,
    ) {
    }

    /**
     * Envoie le lien d'activation (valable 24 h) vers la page Angular /verify-email.
     *
     * @throws \Symfony\Component\Mailer\Exception\TransportExceptionInterface
     */
    public function sendVerificationEmail(User $user, string $plainToken, \DateTimeImmutable $expiresAt): void
    {
        $link = sprintf('%s/verify-email?token=%s', rtrim($this->frontendUrl, '/'), urlencode($plainToken));

        $email = (new TemplatedEmail())
            ->from(new Address($this->from, 'PokerVitrine'))
            ->to(new Address((string) $user->getEmail(), (string) $user->getPseudo()))
            ->subject('Confirmez votre adresse email — PokerVitrine')
            ->htmlTemplate('emails/verification.html.twig')
            ->textTemplate('emails/verification.txt.twig')
            ->context([
                'pseudo' => $user->getPseudo(),
                'link' => $link,
                'expiresAt' => $expiresAt,
            ]);

        $this->mailer->send($email);
    }
}
