-- ============================================================================
-- THILINA FURNITURE - ORDER & INVOICE SYSTEM MIGRATION
-- Date: 2026-02-09
-- Description: Migrations for extended Order and OrderItem table structures
--  to support invoice generation with PDF storage
-- ============================================================================

-- ============================================================================
-- ALTER ORDERS TABLE - ADD INVOICE AND CUSTOMER DETAILS FIELDS
-- ============================================================================
ALTER TABLE `orders` ADD COLUMN `invoice_no` VARCHAR(255) UNIQUE NULL;
ALTER TABLE `orders` ADD COLUMN `customer_name` VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE `orders` ADD COLUMN `customer_phone` VARCHAR(20) NOT NULL DEFAULT '';
ALTER TABLE `orders` ADD COLUMN `customer_email` VARCHAR(255) NULL;
ALTER TABLE `orders` ADD COLUMN `delivery_address` TEXT NOT NULL DEFAULT '';
ALTER TABLE `orders` ADD COLUMN `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE `orders` ADD COLUMN `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE `orders` ADD COLUMN `shipping` DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE `orders` ADD COLUMN `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE `orders` ADD COLUMN `payment_method` VARCHAR(50) NOT NULL DEFAULT 'CARD';
ALTER TABLE `orders` ADD COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Pending';
ALTER TABLE `orders` ADD COLUMN `invoice_path` VARCHAR(500) NULL;
ALTER TABLE `orders` MODIFY COLUMN `total_price` DECIMAL(12, 2) NOT NULL;
ALTER TABLE `orders` MODIFY COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'Placed';
ALTER TABLE `orders` ADD COLUMN `order_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add index for faster lookups
ALTER TABLE `orders` ADD INDEX idx_invoice_no (invoice_no);
ALTER TABLE `orders` ADD INDEX idx_customer_phone (customer_phone);
ALTER TABLE `orders` ADD INDEX idx_order_date (order_date);

-- ============================================================================
-- ALTER ORDER_ITEMS TABLE - ADD UNIT PRICE FIELD
-- ============================================================================
ALTER TABLE `order_items` ADD COLUMN `unit_price` DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE `order_items` MODIFY COLUMN `subtotal_price` DECIMAL(12, 2) NOT NULL;

-- Add index for better query performance
ALTER TABLE `order_items` ADD INDEX idx_order_id (order_id);
ALTER TABLE `order_items` ADD INDEX idx_product_id (product_id);

-- ============================================================================
-- VERIFY THE CHANGES
-- ============================================================================
-- Run these SELECT statements to verify the column structure

-- DESC `orders`;
-- DESC `order_items`;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- These are the ALTER statements to rollback if something goes wrong:
/*
ALTER TABLE `orders` DROP COLUMN `invoice_no`;
ALTER TABLE `orders` DROP COLUMN `customer_name`;
ALTER TABLE `orders` DROP COLUMN `customer_phone`;
ALTER TABLE `orders` DROP COLUMN `customer_email`;
ALTER TABLE `orders` DROP COLUMN `delivery_address`;
ALTER TABLE `orders` DROP COLUMN `subtotal`;
ALTER TABLE `orders` DROP COLUMN `tax`;
ALTER TABLE `orders` DROP COLUMN `shipping`;
ALTER TABLE `orders` DROP COLUMN `discount`;
ALTER TABLE `orders` DROP COLUMN `payment_method`;
ALTER TABLE `orders` DROP COLUMN `payment_status`;
ALTER TABLE `orders` DROP COLUMN `invoice_path`;
ALTER TABLE `orders` DROP COLUMN `order_date`;
ALTER TABLE `orders` DROP INDEX idx_invoice_no;
ALTER TABLE `orders` DROP INDEX idx_customer_phone;
ALTER TABLE `orders` DROP INDEX idx_order_date;

ALTER TABLE `order_items` DROP COLUMN `unit_price`;
ALTER TABLE `order_items` DROP INDEX idx_order_id;
ALTER TABLE `order_items` DROP INDEX idx_product_id;
*/

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The Sequelize models have been updated to reflect these new columns
-- 2. Sequelize 'sync' with alter: true will auto-create/update tables if 
--    running from the application startup
-- 3. For production environments, manually run these migration scripts
-- 4. The `invoice_path` field stores the path to the generated PDF file
--    Example: /uploads/invoices/INV-20260209-1234.pdf
-- 5. All prices are stored as DECIMAL(12,2) for precision
-- ============================================================================
