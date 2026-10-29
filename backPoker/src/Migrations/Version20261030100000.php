<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Boutique v2.0 (branche feature/boutique-v2) : produits, commandes, lignes de commande.
 * SQL issu de doctrine:schema:update --dump-sql sur MariaDB 10.6.
 */
final class Version20261030100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Boutique v2.0 : product, shop_order, order_item';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE product (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(150) NOT NULL, slug VARCHAR(160) NOT NULL, description LONGTEXT DEFAULT NULL, category VARCHAR(20) NOT NULL, price_cents INT NOT NULL, vat_rate VARCHAR(5) NOT NULL, stock INT DEFAULT 0 NOT NULL, image_url VARCHAR(500) DEFAULT NULL, is_published TINYINT DEFAULT 0 NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_PRODUCT_PUBLISHED_CATEGORY (is_published, category), UNIQUE INDEX UNIQ_PRODUCT_SLUG (slug), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE shop_order (id INT AUTO_INCREMENT NOT NULL, reference VARCHAR(24) NOT NULL, status VARCHAR(20) NOT NULL, shipping_name VARCHAR(120) NOT NULL, shipping_line1 VARCHAR(180) NOT NULL, shipping_line2 VARCHAR(180) DEFAULT NULL, shipping_postal_code VARCHAR(10) NOT NULL, shipping_city VARCHAR(120) NOT NULL, shipping_country VARCHAR(2) NOT NULL, shipping_phone VARCHAR(30) DEFAULT NULL, total_excl_tax_cents INT NOT NULL, total_vat_cents INT NOT NULL, total_incl_tax_cents INT NOT NULL, payment_reference VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, paid_at DATETIME DEFAULT NULL, shipped_at DATETIME DEFAULT NULL, user_id INT DEFAULT NULL, INDEX IDX_SHOP_ORDER_CREATED_AT (created_at), UNIQUE INDEX UNIQ_SHOP_ORDER_REFERENCE (reference), INDEX IDX_323FC9CAA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE order_item (id INT AUTO_INCREMENT NOT NULL, product_name VARCHAR(150) NOT NULL, unit_price_incl_tax_cents INT NOT NULL, vat_rate VARCHAR(5) NOT NULL, quantity INT NOT NULL, line_incl_tax_cents INT NOT NULL, line_excl_tax_cents INT NOT NULL, line_vat_cents INT NOT NULL, order_id INT NOT NULL, product_id INT DEFAULT NULL, INDEX IDX_52EA1F098D9F6D38 (order_id), INDEX IDX_52EA1F094584665A (product_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE shop_order ADD CONSTRAINT FK_323FC9CAA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F098D9F6D38 FOREIGN KEY (order_id) REFERENCES shop_order (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F094584665A FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F094584665A');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F098D9F6D38');
        $this->addSql('ALTER TABLE shop_order DROP FOREIGN KEY FK_323FC9CAA76ED395');
        $this->addSql('DROP TABLE order_item');
        $this->addSql('DROP TABLE shop_order');
        $this->addSql('DROP TABLE product');
    }
}
