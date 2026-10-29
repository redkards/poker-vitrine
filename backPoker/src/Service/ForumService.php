<?php

namespace App\Service;

use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumPostReport;
use App\Entity\ForumSubscription;
use App\Entity\ForumTopic;
use App\Entity\User;
use App\Enum\ReportReason;
use App\Repository\ForumPostReportRepository;
use App\Repository\ForumSubscriptionRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

/**
 * UC7 — Poster sur le forum : création de sujets, réponses, abonnements et notifications.
 */
class ForumService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ForumSubscriptionRepository $subscriptions,
        private readonly ForumPostReportRepository $reports,
        private readonly MailService $mailService,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * Crée le sujet et son premier message ; l'auteur est abonné automatiquement.
     */
    public function createTopic(ForumCategory $category, User $author, string $title, string $content): ForumTopic
    {
        $topic = (new ForumTopic())
            ->setCategory($category)
            ->setAuthor($author)
            ->setTitle($title);
        $topic->addPost((new ForumPost())->setAuthor($author)->setContent($content));

        $this->em->persist($topic);
        $this->em->persist(new ForumSubscription($author, $topic));
        $this->em->flush();

        return $topic;
    }

    /**
     * @throws \LogicException si le sujet est verrouillé
     */
    public function reply(ForumTopic $topic, User $author, string $content): ForumPost
    {
        if ($topic->isLocked()) {
            throw new \LogicException('Ce sujet est verrouillé.');
        }

        $post = (new ForumPost())->setAuthor($author)->setContent($content);
        $topic->addPost($post);

        if (!$this->subscriptions->findOneFor($author, $topic)) {
            $this->em->persist(new ForumSubscription($author, $topic));
        }

        $this->em->persist($post);
        $this->em->flush();

        $this->notifySubscribers($topic, $post, $author);

        return $post;
    }

    public function isSubscribed(User $user, ForumTopic $topic): bool
    {
        return null !== $this->subscriptions->findOneFor($user, $topic);
    }

    public function subscribe(User $user, ForumTopic $topic): void
    {
        if (!$this->isSubscribed($user, $topic)) {
            $this->em->persist(new ForumSubscription($user, $topic));
            $this->em->flush();
        }
    }

    public function unsubscribe(User $user, ForumTopic $topic): void
    {
        if ($subscription = $this->subscriptions->findOneFor($user, $topic)) {
            $this->em->remove($subscription);
            $this->em->flush();
        }
    }

    private function notifySubscribers(ForumTopic $topic, ForumPost $post, User $author): void
    {
        foreach ($this->subscriptions->findSubscribersToNotify($topic, $author) as $subscriber) {
            try {
                $this->mailService->sendForumReplyNotification($subscriber, $topic, $post);
            } catch (TransportExceptionInterface $e) {
                // Une notification perdue ne doit pas bloquer la publication du message
                $this->logger->warning('Echec notification forum', ['topicId' => $topic->getId(), 'error' => $e->getMessage()]);
            }
        }
    }

    public function hasReported(User $user, ForumPost $post): bool
    {
        return null !== $this->reports->findOneBy(['post' => $post, 'reporter' => $user]);
    }

    /**
     * Enregistre un signalement (file de modération). Renvoie null si le membre l'a déjà signalé
     * (contrainte d'unicité, y compris en cas de double clic concurrent).
     */
    public function report(ForumPost $post, User $reporter, ReportReason $reason, ?string $comment): ?ForumPostReport
    {
        if ($this->hasReported($reporter, $post)) {
            return null;
        }

        $report = new ForumPostReport($post, $reporter, $reason, $comment);
        try {
            $this->em->persist($report);
            $this->em->flush();
        } catch (UniqueConstraintViolationException) {
            return null;
        }

        return $report;
    }
}
