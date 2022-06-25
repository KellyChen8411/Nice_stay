const cityQuery = require("../models/city_model");

const selectAllCity = async (req, res) => {
  const citys = await cityQuery.selectAllCity();
  res.json(citys);
};

module.exports = {
  selectAllCity,
};
