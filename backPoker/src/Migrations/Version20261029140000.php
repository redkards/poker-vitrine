<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261029140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Calendrier des tournois live';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE tournament (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(180) NOT NULL, circuit VARCHAR(120) DEFAULT NULL, zone VARCHAR(20) NOT NULL, country VARCHAR(80) NOT NULL, city VARCHAR(120) NOT NULL, venue VARCHAR(180) DEFAULT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, main_event_buy_in VARCHAR(60) DEFAULT NULL, guarantee VARCHAR(120) DEFAULT NULL, url VARCHAR(500) DEFAULT NULL, status VARCHAR(20) DEFAULT \'confirme\' NOT NULL, note LONGTEXT DEFAULT NULL, sources JSON NOT NULL, is_published TINYINT DEFAULT 1 NOT NULL, INDEX IDX_TOURNAMENT_DATES (end_date, start_date), UNIQUE INDEX UNIQ_TOURNAMENT_NAME_START (name, start_date), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE tournament');
    }
}
