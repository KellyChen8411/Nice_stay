const { pool } = require("../server/models/mysqlcon");
const { NODE_ENV } = process.env;

const tables = [
  "amenity",
  "blacklist",
  "booking",
  "category",
  "city",
  "favorite",
  "house",
  "house_amenity",
  "image",
  "message",
  "payment",
  "review",
  "user",
];

async function truncateData() {
  console.log("truncate start");
  if (process.env.NODE_ENV !== "test") {
    return;
  }

  const conn = await pool.getConnection();
  await conn.query("START TRANSACTION");
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
  tables.forEach(async (table) => {
    sql = `TRUNCATE ${table}`;
    await conn.query(sql);
  });
  const [houses] = await conn.query("SELECT * FROM house");
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
  await conn.query("COMMIT");
  await conn.release();
  console.log("truncate end");

  return;
}

async function insertFakeDate(fakeDataSet) {
  if (process.env.NODE_ENV !== "test") {
    return;
  }
  const conn = await pool.getConnection();
  await conn.query("START TRANSACTION");
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
  await conn.query(
    "INSERT INTO house (id,title,category_id,description,price,tax_percentage,cleanfee_percentage,people_count,room_count,bed_count,bathroom_count,landlord_id,city_id,region,address,latitude,longitude,refund_type,refund_duration,image_url,created_at,updated_at,pet) VALUES ?",
    [fakeDataSet.houses.map((house) => Object.values(house))]
  );
  await conn.query("INSERT INTO city (id,name) VALUES ?", [
    fakeDataSet.citys.map((city) => Object.values(city)),
  ]);
  await conn.query("INSERT INTO image (id,house_id,image_url) VALUES ?", [
    fakeDataSet.images.map((image) => Object.values(image)),
  ]);
  await conn.query(
    "INSERT INTO house_amenity (id,house_id,amenity_id) VALUES ?",
    [
      fakeDataSet.houseAmenities.map((houseAmenity) =>
        Object.values(houseAmenity)
      ),
    ]
  );
  await conn.query(
    "INSERT INTO booking (id,house_id,renter_id,landlord_id,checkin_date,checkout_date,room_price,tax_fee,clean_fee,amount_fee,created_at,refundable,paid,refund_duetime,is_refund) VALUES ?",
    [fakeDataSet.bookings.map((booking) => Object.values(booking))]
  );
  await conn.query("INSERT INTO favorite (id,renter_id,house_id) VALUES ?", [
    fakeDataSet.favorites.map((favorite) => Object.values(favorite)),
  ]);
  await conn.query(
    "INSERT INTO payment (id,booking_id,rec_trade_id,created_at) VALUES ?",
    [fakeDataSet.payments.map((payment) => Object.values(payment))]
  );
  await conn.query(
    "INSERT INTO review (id,comment,house_rate,landlord_rate,created_at,booking_id) VALUES ?",
    [fakeDataSet.reviews.map((review) => Object.values(review))]
  );
  await conn.query("INSERT INTO amenity (id,name,icon_url) VALUES ?", [
    fakeDataSet.amenities.map((amenity) => Object.values(amenity)),
  ]);
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
  await conn.query("COMMIT");
  await conn.release();

  return;
}

module.exports = {
  truncateData,
  insertFakeDate,
};
