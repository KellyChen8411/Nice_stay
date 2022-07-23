require("dotenv").config();
const checkoutQuery = require("../models/checkout_model");
const util = require("../../util/util");

const checkout = async (req, res) => {

  const userInfo = req.user;
  const { prime } = req.body;
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
  } = req.body.bookoingInfo;

  const landlord_id = await checkoutQuery.getLandlordID(house_id);

  const booking = {
    house_id,
    renter_id: userInfo.id,
    landlord_id,
    checkin_date,
    checkout_date,
    room_price,
    tax_fee,
    clean_fee,
    amount_fee,
    created_at: Date.now(),
    refundable,
    paid: 0, //預設是unpaid
    is_refund: 0,
  };
  if (refundable === "1") {
    booking.refund_duetime = refund_duetime;
  }

  //checkout
  const bookingResult = await checkoutQuery.checkout(prime, userInfo, booking);

  res.json(bookingResult);
};

const sendBookingEmail = async (req, res) => {
  const renterName = req.body.renterInfo.name;
  const renterEmail = req.body.renterInfo.email;

  util.sendBookingEmail(renterName, renterEmail, req.body.bookingInfo);

  res.json({ status: "succeed" });
};

module.exports = {
  checkout,
  sendBookingEmail,
};
