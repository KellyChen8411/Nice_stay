const { pool } = require("./mysqlcon");

const amenityQuery = {};

amenityQuery.getAmenity = async () => {
  let sql = "SELECT id, name FROM amenity";
  const [result] = await pool.query(sql);
  return result;
};

module.exports = amenityQuery;
