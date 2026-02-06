const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const dbName = process.env.DB_NAME;

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // SQL Query print vena eka navaththanna.
  }
);

// Database eka already exicts da kiyala balanna . Already exicts nattam auto create venna .
async function checkAndCreateDatabase() {
  try {
    const tempSequelize = new Sequelize({
      dialect: "mysql",
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Database eka exictsda kiyala balanna .
    const result = await tempSequelize.query(`SHOW DATABASES LIKE '${dbName}'`);

    if (result[0].length === 0) {
      console.log(`Database '${dbName}' does not exist. Creating it...`);

      // Database eka exicts nattam create venna .
      await tempSequelize.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }

    // Temporary connection eka close karanna.
    await tempSequelize.close();

    sequelize.config.database = dbName;
    await sequelize.authenticate();
    console.log("Database connection successful!");
  } catch (error) {
    console.error("Error checking or creating the database:", error);
  }
}

// checkAndCreateDatabase function eka run karanna .
checkAndCreateDatabase();

module.exports = sequelize;
