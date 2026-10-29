<?php

namespace App\Service;

use App\Entity\ForumPost;
use App\Entity\ForumTopic;
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
            ->from(new Address($this->from, 'Poker Winners'))
            ->to(new Address((string) $user->getEmail(), (string) $user->getPseudo()))
            ->subject('Confirmez votre adresse email — Poker Winners')
            ->htmlTemplate('emails/verification.html.twig')
            ->textTemplate('emails/verification.txt.twig')
            ->context([
                'pseudo' => $user->getPseudo(),
                'link' => $link,
                'expiresAt' => $expiresAt,
            ]);

        $this->mailer->send($email);
    }

    /**
     * Nouvelle réponse sur un sujet suivi (sans recopier le message : il peut encore être modéré).
     *
     * @throws \Symfony\Component\Mailer\Exception\TransportExceptionInterface
     */
    public function sendForumReplyNotification(User $subscriber, ForumTopic $topic, ForumPost $post): void
    {
        $link = sprintf('%s/forum/sujet/%d', rtrim($this->frontendUrl, '/'), $topic->getId());

        $email = (new TemplatedEmail())
            ->from(new Address($this->from, 'Poker Winners'))
            ->to(new Address((string) $subscriber->getEmail(), (string) $subscriber->getPseudo()))
            ->subject(sprintf('Nouvelle réponse : %s', $topic->getTitle()))
            ->htmlTemplate('emails/forum_reply.html.twig')
            ->textTemplate('emails/forum_reply.txt.twig')
            ->context([
                'pseudo' => $subscriber->getPseudo(),
                'topicTitle' => $topic->getTitle(),
                'replyAuthor' => $post->getAuthor()?->getPseudo() ?? 'Un membre',
                'link' => $link,
                'settingsLink' => $link,
            ]);

        $this->mailer->send($email);
    }

    /**
     * UC14 — confirmation de la suppression du compte (lien valable 1 h).
     *
     * @throws \Symfony\Component\Mailer\Exception\TransportExceptionInterface
     */
    public function sendAccountDeletionConfirmation(User $user, string $plainToken, \DateTimeImmutable $expiresAt): void
    {
        $link = sprintf('%s/suppression-compte?token=%s', rtrim($this->frontendUrl, '/'), urlencode($plainToken));

        $email = (new TemplatedEmail())
            ->from(new Address($this->from, 'Poker Winners'))
            ->to(new Address((string) $user->getEmail(), (string) $user->getPseudo()))
            ->subject('Confirmez la suppression de votre compte — Poker Winners')
            ->htmlTemplate('emails/account_deletion.html.twig')
            ->textTemplate('emails/account_deletion.txt.twig')
            ->context([
                'pseudo' => $user->getPseudo(),
                'link' => $link,
                'expiresAt' => $expiresAt,
            ]);

        $this->mailer->send($email);
    }
}
