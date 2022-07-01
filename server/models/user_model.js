const { pool } = require("./mysqlcon");

const userQuery = {};

userQuery.checkUserExist = async (email) => {
  let sql = "SELECT * FROM user WHERE email = ?";
  const [result] = await pool.query(sql, email);
  return result;
};

userQuery.createNativeUser = async (values) => {
  let sql =
    "INSERT INTO user (email, name, password, user_role, login_role) VALUES ?";
  const [result] = await pool.query(sql, [values]);
  return result;
};

userQuery.addBlackList = async (values) => {
  let sql = "INSERT INTO blacklist SET ?";
  await pool.query(sql, values);
};

module.exports = userQuery;
