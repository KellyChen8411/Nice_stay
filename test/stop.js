const { requester } = require("./setup");
const { pool } = require("../server/models/mysqlcon");

after(async function () {
  await pool.end();
  requester.close();
});
