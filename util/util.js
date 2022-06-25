require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pug = require("pug");

const util = {};

util.wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

util.checkLogin = (req, res, next) => {
  let AuthorizationHeader = req.get("Authorization");
  const token = AuthorizationHeader.split(" ")[1];
  const payload = jwt.verify(token, `${process.env.jwtsecret}`);
  let { role } = payload;
  res.json({ role });
};

util.checkLoginMiddleware = (req, res, next) => {
  try {
    let AuthorizationHeader = req.get("Authorization");
    const token = AuthorizationHeader.split(" ")[1];
    const payload = jwt.verify(token, `${process.env.jwtsecret}`);
    req.user = payload;
    return next();
  } catch (err) {
    const error = Error("token過期,請重新登入");
    err.type = "tokenExpire";
    next(err);
  }
};

util.sendBookingEmail = async (renter_name, renter_email, bookingInfo) => {
  const {
    checkin_date,
    checkout_date,
    room_price,
    clean_fee,
    tax_fee,
    amount_fee,
  } = bookingInfo;

  let transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      type: "OAuth2",
      user: process.env.ACCOUNT,
      clientId: process.env.CLINENTID,
      clientSecret: process.env.CLINENTSECRET,
      refreshToken: process.env.REFRESHTOKEN,
      accessToken: process.env.ACCESSTOKEN,
    },
  });

  let info = await transporter.sendMail({
    from: "kellychen841106@gmail.com", // sender address
    to: renter_email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: pug.renderFile(`${process.cwd()}/views/booking.pug`, {
      name: renter_name,
      checkin_date,
      checkout_date,
      room_price,
      clean_fee,
      tax_fee,
      amount_fee,
    }), // html body
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = util;
