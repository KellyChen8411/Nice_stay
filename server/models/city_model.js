const { pool } = require("./mysqlcon");

const cityQuery = {};

cityQuery.selectAllCity = async () => {
  let sql = "SELECT * FROM city";
  const [result] = await pool.query(sql);
  return result;
};

cityQuery.selectAllRegion = async () => {
  let sql = "SELECT a.regions, b.name as city FROM (SELECT  city_id, json_arrayagg(name) as regions FROM region group by city_id) a left join city b on a.city_id=b.id";
  const [result] = await pool.query(sql);
  return result;
}

module.exports = cityQuery;
