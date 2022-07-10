require("dotenv").config();
const checkoutQuery = require("../models/checkout_model");
const util = require("../../util/util");

const checkout = async (req, res) => {
  // console.log("checkout");
  const {
    house_id,
    checkin_date,
    checkout_date,
    room_price,
    tax_fee,
    clean_fee,
    amount_fee,
    refundable,
    refund_duetime,
  } = req.body;

  const landlord_id = await checkoutQuery.getLandlordID(req.body.house_id);

  const booking = {
    house_id,
    renter_id: req.user.id,
    landlord_id,
    checkin_date,
    checkout_date,
    room_price,
    tax_fee,
    clean_fee,
    amount_fee,
    created_at: Date.now(),
    refundable,
    paid: 1,
    is_refund: 0,
  };
  if (refundable === "1") {
    booking.refund_duetime = refund_duetime;
  }

  const bookingResult = await checkoutQuery.createBooking(booking);
  const orderNum = bookingResult.insertId;
  // const orderNum = 1;
  const renterInfo = { name: req.user.name, email: req.user.email };
  res.json({ bookingInfo: booking, orderNum, renterInfo });
};

const sendBookingEmail = async (req, res) => {
  // console.log("sendemail");
  const renter_name = req.body.renterInfo.name;
  const renter_email = req.body.renterInfo.email;

  util.sendBookingEmail(renter_name, renter_email, req.body.bookingInfo);

  res.json({ test: "test" });
};

module.exports = {
  checkout,
  sendBookingEmail,
};
