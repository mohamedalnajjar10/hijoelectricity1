const { Sequelize } = require("sequelize");

// Validate required environment variables
const requiredEnvVars = ["DATABASE_HOST", "USER_NAME", "PASSWORD", "DATABASE"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(", ")}`,
  );
  process.exit(1);
}

// Create Sequelize connection with pooling
const connection = new Sequelize({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT
    ? parseInt(process.env.DATABASE_PORT, 10)
    : 3306,
  username: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  dialect: process.env.DIALECT || "mysql",

  // Logging - only in development
  logging: process.env.NODE_ENV === "development" ? console.log : false,

  // Connection pool settings for better performance
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },

  // Model definition defaults
  define: {
    freezeTableName: true,
    timestamps: true,
    underscored: false,
  },

  // Timezone settings
  timezone: "+00:00",

  // Retry settings for connection issues
  retry: {
    max: 3,
    match: [/Deadlock/i, /ETIMEDOUT/, /ECONNRESET/, /ECONNREFUSED/],
  },
});

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    await connection.authenticate();
    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Unable to connect to database:", error.message);
    return false;
  }
};

module.exports = { connection, testConnection };
