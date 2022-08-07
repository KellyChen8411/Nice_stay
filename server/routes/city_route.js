const router = require("express").Router();
const util = require("../../util/util");

const {
  selectAllCity,
  selectAllRegion,
} = require("../controllers/city_controller");

router.route("/citys").get(util.wrapAsync(selectAllCity));
router.route("/citys/region").get(util.wrapAsync(selectAllRegion));

module.exports = router;
