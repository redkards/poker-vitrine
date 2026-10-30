<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261030120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Abonnement Premium : user.premium_until, video.premium, table premium_subscription';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE premium_subscription (id INT AUTO_INCREMENT NOT NULL, plan VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, price_cents INT NOT NULL, started_at DATETIME DEFAULT NULL, ends_at DATETIME DEFAULT NULL, provider_reference VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT DEFAULT NULL, INDEX IDX_PREMIUM_SUBSCRIPTION_STATUS (status), INDEX IDX_B228622DA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE premium_subscription ADD CONSTRAINT FK_B228622DA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE `user` ADD premium_until DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE video ADD premium TINYINT DEFAULT 0 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE premium_subscription DROP FOREIGN KEY FK_B228622DA76ED395');
        $this->addSql('DROP TABLE premium_subscription');
        $this->addSql('ALTER TABLE `user` DROP premium_until');
        $this->addSql('ALTER TABLE video DROP premium');
    }
}
