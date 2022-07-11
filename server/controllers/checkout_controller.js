require("dotenv").config();
const axios = require("axios");
const checkoutQuery = require("../models/checkout_model");
const util = require("../../util/util");
const { pool } = require("../models/mysqlcon");

const checkout = async (req, res) => {
  // console.log("checkout controller checkout");
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
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

    // const landlord_id = await checkoutQuery.getLandlordID(
    //   req.body.bookoingInfo.house_id
    // );

    let [landlord_id] = await conn.query(
      "SELECT landlord_id FROM house WHERE id=?",
      req.body.bookoingInfo.house_id
    );

    landlord_id = landlord_id[0].landlord_id;

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
      paid: 0, //預設是unpaid
      is_refund: 0,
    };
    if (refundable === "1") {
      booking.refund_duetime = refund_duetime;
    }

    // const bookingResult = await checkoutQuery.createBooking(booking);
    let [bookingResult] = await conn.query(
      "INSERT INTO booking SET ?",
      booking
    );

    const orderNum = bookingResult.insertId;

    //Complete payment with Pay by Prime API
    const payURL = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime";
    const post_data = {
      prime: prime,
      partner_key:
        "partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG",
      merchant_id: "AppWorksSchool_CTBC",
      amount: booking.amount_fee,
      order_number: orderNum,
      currency: "TWD",
      details: booking.house_id,
      cardholder: {
        phone_number: "0922888999",
        name: req.user.name,
        email: req.user.email,
      },
      remember: false,
    };
    const headers = {
      "x-api-key":
        "partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG",
    };
    const payResult = await axios.post(payURL, post_data, { headers });

    //check payment result
    if (payResult.data.status === 0) {
      //update order status to paid
      // await checkoutQuery.updateBookingPaid(orderNum);
      await conn.query("UPDATE booking SET paid=1 WHERE id=?", orderNum);
      //create item in payment table
      // await checkoutQuery.createPayment([
      //   orderNum,
      //   payResult.data["rec_trade_id"],
      //   payResult.data["transaction_time_millis"],
      // ]);
      await conn.query(
        "INSERT INTO payment (booking_id, rec_trade_id, created_at) VALUES (?,?,?)",
        [
          orderNum,
          payResult.data["rec_trade_id"],
          payResult.data["transaction_time_millis"],
        ]
      );
      const renterInfo = { name: req.user.name, email: req.user.email };
      await conn.query("COMMIT");
      return res.json({ bookingInfo: booking, orderNum, renterInfo });
    }
    await conn.query("COMMIT");
    const err = Error("結帳失敗");
    err.type = "paymentFail";
    throw err;
  } catch (error) {
    // console.log('try catch error')
    await conn.query("ROLLBACK");
    throw error;
    return -1;
  } finally {
    await conn.release();
  }
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
