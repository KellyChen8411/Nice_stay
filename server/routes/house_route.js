const router = require("express").Router();
const util = require("../../util/util");
const multer = require("multer");
let upload = multer();

const {
  createHouse,
  selectAllHouse,
  houseSearch,
  houseDatail,
  houseNearby,
  houseTest,
} = require("../controllers/house_controllers");

// router.route('/houses/create')
//     .get(util.wrapAsync(createHouse));

router.route("/houses/all").get(util.wrapAsync(selectAllHouse));

router
  .route("/houses/search")
  .post(upload.array(), util.wrapAsync(houseSearch));

router.route("/houses/detail/:id").get(util.wrapAsync(houseDatail));

router.route("/houses/nearby").get(util.wrapAsync(houseNearby));

// router.route('/houses/test')
//     .get(upload.array(), util.wrapAsync(houseTest));

module.exports = router;
