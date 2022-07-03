const router = require("express").Router();
const util = require("../../util/util");
const multer = require("multer");
const upload = multer();
const { body } = require("express-validator");

const {
  userSignUp,
  userSignIn,
  addBlackList,
  updateUserRole,
} = require("../controllers/user_controller");

router.route("/users/signup").post(
  upload.array(),
  [
    body("signup_email").isEmail().withMessage("email格式錯誤"),
    body("signup_password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("密碼長度需大於6"),
    body("signup_confirmPass")
      .trim()
      .custom((value, { req }) => {
        // 確認密碼欄位的值需要和密碼欄位的值相符
        if (value !== req.body.signup_password) {
          // 驗證失敗時的錯誤訊息
          throw new Error("兩次輸入的密碼不相同");
        }
        // 成功驗證回傳 true
        return true;
      }),
  ],
  util.wrapAsync(userSignUp)
);

router
  .route("/users/signin")
  .post(
    upload.array(),
    [
      body("signin_email").isEmail().withMessage("email格式錯誤"),
      body("signin_password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("密碼長度需大於6"),
    ],
    util.wrapAsync(userSignIn)
  );

router.route("/users/checkLogin").get(util.checkLogin);

router.route("/users/blacklist").post(util.wrapAsync(addBlackList));

router
  .route("/users/updateUserRole")
  .get(util.checkLoginMiddleware, util.wrapAsync(updateUserRole));

module.exports = router;
