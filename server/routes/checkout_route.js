const router = require("express").Router();
const util = require("../../util/util");

const {
  checkout,
  sendBookingEmail,
} = require("../controllers/checkout_controller");

router
  .route("/checkout/checkout")
  .post(util.checkLoginMiddleware, util.wrapAsync(checkout));

router.route("/checkout/booking").get((req, res) => {
  res.render("booking", { name: "Kelly" });
});

router.route("/checkout/email").post(util.wrapAsync(sendBookingEmail));

module.exports = router;
