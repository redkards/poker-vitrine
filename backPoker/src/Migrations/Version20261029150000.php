<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261029150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Signalements des messages du forum (v1.1)';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE forum_post_report (id INT AUTO_INCREMENT NOT NULL, reason VARCHAR(20) NOT NULL, comment VARCHAR(500) DEFAULT NULL, created_at DATETIME NOT NULL, resolved_at DATETIME DEFAULT NULL, post_id INT NOT NULL, reporter_id INT NOT NULL, resolved_by_id INT DEFAULT NULL, INDEX IDX_FORUM_POST_REPORT_RESOLVED_AT (resolved_at), UNIQUE INDEX UNIQ_FORUM_POST_REPORT (post_id, reporter_id), INDEX IDX_F23910434B89032C (post_id), INDEX IDX_F2391043E1CFE6F5 (reporter_id), INDEX IDX_F23910436713A32B (resolved_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE forum_post_report ADD CONSTRAINT FK_F23910434B89032C FOREIGN KEY (post_id) REFERENCES forum_post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE forum_post_report ADD CONSTRAINT FK_F2391043E1CFE6F5 FOREIGN KEY (reporter_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE forum_post_report ADD CONSTRAINT FK_F23910436713A32B FOREIGN KEY (resolved_by_id) REFERENCES `user` (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE forum_post_report DROP FOREIGN KEY FK_F23910434B89032C');
        $this->addSql('ALTER TABLE forum_post_report DROP FOREIGN KEY FK_F2391043E1CFE6F5');
        $this->addSql('ALTER TABLE forum_post_report DROP FOREIGN KEY FK_F23910436713A32B');
        $this->addSql('DROP TABLE forum_post_report');
    }
}
