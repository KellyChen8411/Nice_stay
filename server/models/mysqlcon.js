require("dotenv").config();
const mysql = require("mysql2/promise");
const env = process.env.NODE_ENV || "production";

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // timezone: 'utc'
});

const poolTest = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST_TEST_NEW,
  user: process.env.DB_USER_TEST_NEW,
  password: process.env.DB_PASSWORD_TEST_NEW,
  database: process.env.DB_DATABASE_TEST_NEW,
  // timezone: 'utc'
});

if (env === "test") {
  module.exports = {
    pool: poolTest,
  };
} else {
  module.exports = {
    pool,
  };
}
