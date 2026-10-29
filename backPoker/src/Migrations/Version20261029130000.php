<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261029130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Schéma initial MariaDB 10.6 (remplace les migrations PostgreSQL des sprints 0 à 4)';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE article (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(180) NOT NULL, slug VARCHAR(200) NOT NULL, category VARCHAR(50) DEFAULT NULL, scope VARCHAR(20) DEFAULT \'france\' NOT NULL, excerpt VARCHAR(400) NOT NULL, content LONGTEXT NOT NULL, image_url VARCHAR(500) DEFAULT NULL, published_at DATETIME DEFAULT NULL, author_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_23A0E66989D9B62 (slug), INDEX IDX_ARTICLE_PUBLISHED_AT (published_at), INDEX IDX_23A0E66F675F31B (author_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE consent_log (id INT AUTO_INCREMENT NOT NULL, cgu_version VARCHAR(20) NOT NULL, ip_address VARCHAR(45) DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_CONSENT_LOG_CREATED_AT (created_at), INDEX IDX_30113729A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE forum_category (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(100) NOT NULL, description VARCHAR(255) DEFAULT NULL, slug VARCHAR(120) NOT NULL, position INT DEFAULT 0 NOT NULL, UNIQUE INDEX UNIQ_21BF9426989D9B62 (slug), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE forum_post (id INT AUTO_INCREMENT NOT NULL, content LONGTEXT NOT NULL, created_at DATETIME NOT NULL, is_moderated TINYINT DEFAULT 0 NOT NULL, topic_id INT NOT NULL, author_id INT DEFAULT NULL, INDEX IDX_FORUM_POST_CREATED_AT (created_at), INDEX IDX_996BCC5A1F55203D (topic_id), INDEX IDX_996BCC5AF675F31B (author_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE forum_subscription (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, topic_id INT NOT NULL, UNIQUE INDEX UNIQ_FORUM_SUBSCRIPTION (user_id, topic_id), INDEX IDX_9B189294A76ED395 (user_id), INDEX IDX_9B1892941F55203D (topic_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE forum_topic (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(150) NOT NULL, created_at DATETIME NOT NULL, last_post_at DATETIME NOT NULL, is_pinned TINYINT DEFAULT 0 NOT NULL, is_locked TINYINT DEFAULT 0 NOT NULL, category_id INT NOT NULL, author_id INT DEFAULT NULL, INDEX IDX_FORUM_TOPIC_LAST_POST_AT (last_post_at), INDEX IDX_853478CC12469DE2 (category_id), INDEX IDX_853478CCF675F31B (author_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE refresh_tokens (refresh_token VARCHAR(128) NOT NULL, username VARCHAR(255) NOT NULL, valid DATETIME NOT NULL, id INT AUTO_INCREMENT NOT NULL, UNIQUE INDEX UNIQ_9BACE7E1C74F2195 (refresh_token), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) DEFAULT NULL, password VARCHAR(255) NOT NULL, pseudo VARCHAR(50) NOT NULL, roles JSON NOT NULL, is_verified TINYINT DEFAULT 0 NOT NULL, verification_token VARCHAR(64) DEFAULT NULL, verification_token_expires_at DATETIME DEFAULT NULL, consent_version VARCHAR(20) NOT NULL, consent_at DATETIME NOT NULL, created_at DATETIME NOT NULL, last_login_at DATETIME DEFAULT NULL, deletion_token VARCHAR(64) DEFAULT NULL, deletion_token_expires_at DATETIME DEFAULT NULL, anonymized_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_USER_EMAIL (email), UNIQUE INDEX UNIQ_USER_PSEUDO (pseudo), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE video (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(180) NOT NULL, description LONGTEXT DEFAULT NULL, youtube_url VARCHAR(255) NOT NULL, category VARCHAR(50) NOT NULL, level VARCHAR(20) NOT NULL, published_at DATETIME DEFAULT NULL, INDEX IDX_VIDEO_PUBLISHED_AT (published_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE video_favorite (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, video_id INT NOT NULL, UNIQUE INDEX UNIQ_VIDEO_FAVORITE (user_id, video_id), INDEX IDX_C047BC65A76ED395 (user_id), INDEX IDX_C047BC6529C1004E (video_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE article ADD CONSTRAINT FK_23A0E66F675F31B FOREIGN KEY (author_id) REFERENCES `user` (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE consent_log ADD CONSTRAINT FK_30113729A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE forum_post ADD CONSTRAINT FK_996BCC5A1F55203D FOREIGN KEY (topic_id) REFERENCES forum_topic (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE forum_post ADD CONSTRAINT FK_996BCC5AF675F31B FOREIGN KEY (author_id) REFERENCES `user` (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE forum_subscription ADD CONSTRAINT FK_9B189294A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE forum_subscription ADD CONSTRAINT FK_9B1892941F55203D FOREIGN KEY (topic_id) REFERENCES forum_topic (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE forum_topic ADD CONSTRAINT FK_853478CC12469DE2 FOREIGN KEY (category_id) REFERENCES forum_category (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE forum_topic ADD CONSTRAINT FK_853478CCF675F31B FOREIGN KEY (author_id) REFERENCES `user` (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE video_favorite ADD CONSTRAINT FK_C047BC65A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE video_favorite ADD CONSTRAINT FK_C047BC6529C1004E FOREIGN KEY (video_id) REFERENCES video (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE article DROP FOREIGN KEY FK_23A0E66F675F31B');
        $this->addSql('ALTER TABLE consent_log DROP FOREIGN KEY FK_30113729A76ED395');
        $this->addSql('ALTER TABLE forum_post DROP FOREIGN KEY FK_996BCC5A1F55203D');
        $this->addSql('ALTER TABLE forum_post DROP FOREIGN KEY FK_996BCC5AF675F31B');
        $this->addSql('ALTER TABLE forum_subscription DROP FOREIGN KEY FK_9B189294A76ED395');
        $this->addSql('ALTER TABLE forum_subscription DROP FOREIGN KEY FK_9B1892941F55203D');
        $this->addSql('ALTER TABLE forum_topic DROP FOREIGN KEY FK_853478CC12469DE2');
        $this->addSql('ALTER TABLE forum_topic DROP FOREIGN KEY FK_853478CCF675F31B');
        $this->addSql('ALTER TABLE video_favorite DROP FOREIGN KEY FK_C047BC65A76ED395');
        $this->addSql('ALTER TABLE video_favorite DROP FOREIGN KEY FK_C047BC6529C1004E');
        $this->addSql('DROP TABLE article');
        $this->addSql('DROP TABLE consent_log');
        $this->addSql('DROP TABLE forum_category');
        $this->addSql('DROP TABLE forum_post');
        $this->addSql('DROP TABLE forum_subscription');
        $this->addSql('DROP TABLE forum_topic');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE video');
        $this->addSql('DROP TABLE video_favorite');
    }
}
