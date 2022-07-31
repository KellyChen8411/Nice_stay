const cityQuery = require("../models/city_model");

const selectAllCity = async (req, res) => {
  const citys = await cityQuery.selectAllCity();
  res.json(citys);
};

const selectAllRegion = async (req, res) => {
  const regionDatas = await cityQuery.selectAllRegion();
  let regions = {};
  for(item of regionDatas){
    regions[item.city] = item.regions;
  }
  res.json(regions);
};

module.exports = {
  selectAllCity,
  selectAllRegion
};
