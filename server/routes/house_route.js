const router = require("express").Router();
const util = require("../../util/util");
const multer = require("multer");
let upload = multer();
const { body } = require("express-validator");

const {
  createHouse,
  selectAllHouse,
  houseSearch,
  houseDatail,
  houseNearby,
  houseTest,
  selectTrip,
  checkRefund,
  leftreview
} = require("../controllers/house_controllers");

router.route("/houses/create").post(
  util.checkLoginMiddleware,
  upload.fields([
    { name: "mainImg", maxCount: 1 },
    { name: "sideImg1", maxCount: 1 },
    { name: "sideImg2", maxCount: 1 },
  ]),
  body("category_id")
    .trim()
    .custom((value) => {
      // 確認密碼欄位的值需要和密碼欄位的值相符
      if (value === "0") {
        // 驗證失敗時的錯誤訊息
        throw new Error("請輸入房源類型");
      }
      // 成功驗證回傳 true
      return true;
    }),
  body("city_id")
    .trim()
    .custom((value) => {
      // 確認密碼欄位的值需要和密碼欄位的值相符
      if (value === "0") {
        // 驗證失敗時的錯誤訊息
        throw new Error("請選擇城市");
      }
      // 成功驗證回傳 true
      return true;
    }),
  body("refund_type")
    .trim()
    .custom((value, { req }) => {
      // 確認密碼欄位的值需要和密碼欄位的值相符
      console.log("refund_duration");
      console.log(req.body.refund_duration);
      if (value === "1" && req.body.refund_duration === "") {
        // 驗證失敗時的錯誤訊息
        throw new Error("請填寫取消政策");
      }
      // 成功驗證回傳 true
      return true;
    }),
  util.wrapAsync(createHouse)
);

router.route("/houses/all").get(util.wrapAsync(selectAllHouse));

router
  .route("/houses/search")
  .post(upload.array(), util.wrapAsync(houseSearch));

router.route("/houses/detail/:id").get(util.wrapAsync(houseDatail));

router.route("/houses/nearby").get(util.wrapAsync(houseNearby));

// router.route('/houses/test')
//     .get(upload.array(), util.wrapAsync(houseTest));

router.route("/houses/trip").get(util.wrapAsync(selectTrip));

router.route("/houses/checkRefund").get(util.wrapAsync(checkRefund));

router.route("/houses/review").post(util.wrapAsync(leftreview));

module.exports = router;
