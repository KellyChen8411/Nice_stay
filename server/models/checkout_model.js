const { pool } = require("./mysqlcon");

const checkoutQuery = {};

checkoutQuery.getLandlordID = async (house_id) => {
  let sql = "SELECT landlord_id FROM house WHERE id=?";
  const [result] = await pool.query(sql, house_id);
  return result[0].landlord_id;
};

checkoutQuery.createBooking = async (values) => {
  let sql = "INSERT INTO booking SET ?";
  const [result] = await pool.query(sql, values);
  return result;
};

module.exports = checkoutQuery;
