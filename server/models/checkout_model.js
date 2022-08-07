const { pool } = require("./mysqlcon");
const axios = require("axios");

const checkoutQuery = {};

checkoutQuery.getLandlordID = async (houseID) => {
  let sql = "SELECT landlord_id FROM house WHERE id=?";
  const [result] = await pool.query(sql, houseID);
  return result[0].landlord_id;
};

async function tappayPayByPrime(prime, userInfo, booking, orderNum) {
  //Complete payment with Pay by Prime API
  const payURL = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime";
  const postData = {
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
      name: userInfo.name,
      email: userInfo.email,
    },
    remember: false,
  };
  const headers = {
    "x-api-key":
      "partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG",
  };
  const payResult = await axios.post(payURL, postData, { headers });

  return payResult;
}

checkoutQuery.checkout = async (prime, userInfo, booking) => {
  const conn = await pool.getConnection();

  try {
    await conn.query("START TRANSACTION");

    //create booking
    let [bookingResult] = await conn.query(
      "INSERT INTO booking SET ?",
      booking
    );

    const orderNum = bookingResult.insertId;

    //call tappay Pay by Prime API
    const payResult = await tappayPayByPrime(
      prime,
      userInfo,
      booking,
      orderNum
    );

    //check payment result
    if (payResult.data.status === 0) {
      //create payment and update booking
      await conn.query("UPDATE booking SET paid=1 WHERE id=?", orderNum);
      await conn.query(
        "INSERT INTO payment (booking_id, rec_trade_id, created_at) VALUES (?,?,?)",
        [
          orderNum,
          payResult.data["rec_trade_id"],
          payResult.data["transaction_time_millis"],
        ]
      );
      const renterInfo = { name: userInfo.name, email: userInfo.email };
      await conn.query("COMMIT");
      return { bookingInfo: booking, orderNum, renterInfo };
    }

    const err = Error("結帳失敗");
    err.type = "paymentFail";
    throw err;
  } catch (error) {
    console.log("checkout should roll back");
    await conn.query("ROLLBACK");
    throw error;
  } finally {
    await conn.release();
  }
};

module.exports = checkoutQuery;
