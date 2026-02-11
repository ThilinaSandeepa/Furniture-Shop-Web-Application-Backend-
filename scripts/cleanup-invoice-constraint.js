const mysql = require("mysql2/promise");
require("dotenv").config();

async function cleanupInvoiceConstraint() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connected to database");

    // Check if invoice_no column exists
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'invoice_no'"
    );

    if (columns.length > 0) {
      console.log("invoice_no column exists, checking for constraints...");

      // Drop the unique constraint if it exists
      try {
        await connection.query(
          "ALTER TABLE `orders` DROP INDEX `orders_invoice_no_unique`"
        );
        console.log("Dropped unique constraint on invoice_no");
      } catch (err) {
        if (err.code !== "ER_CANT_DROP_FIELD_OR_KEY") {
          console.log("No unique constraint found (expected)");
        }
      }

      // Try alternative constraint names
      try {
        await connection.query(
          "ALTER TABLE `orders` DROP INDEX `idx_invoice_no`"
        );
        console.log("Dropped index idx_invoice_no");
      } catch (err) {
        console.log("No idx_invoice_no index found");
      }

      // Delete orders with empty invoice_no or NULL invoice_no (only if it won't cause referential integrity issues)
      // Actually, let's just update them to NULL which is safe
      try {
        const result = await connection.query(
          "UPDATE `orders` SET `invoice_no` = NULL WHERE `invoice_no` = '' OR `invoice_no` IS NULL"
        );
        console.log(
          `Updated ${result[0].affectedRows || 0} rows with NULL invoice_no`
        );
      } catch (err) {
        console.log("Error updating invoice_no values:", err.message);
      }
    } else {
      console.log("invoice_no column does not exist yet");
    }

    console.log("Cleanup completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error during cleanup:", err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanupInvoiceConstraint();
