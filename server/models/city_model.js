const { pool } = require('./mysqlcon');

const cityQuery = {};

cityQuery.selectAllCity = async ()=>{
    var sql = "SELECT * FROM city";
    const [result] = await pool.query(sql);
    return result;
}

module.exports = cityQuery;

