const { expect, requester } = require("./setup");
const { pool } = require("../server/models/mysqlcon");
const sinon = require("sinon");
const util = require("../util/util");
let stubDelete;
let conn;

describe("delete house", () => {
  before(async () => {
    stubDelete = sinon.stub(util, "deleteImageFromS3Multi").callsFake(() => {});
    conn = await pool.getConnection();
  });

  it("house still has booking (date: checkin date is today)", async () => {
    const res = await requester.delete("/api/1.0/houses/16");

    expect(res.statusCode).to.equal(500);
    expect(res.body.status).to.equal("still has booking");
  });

  it("house still has booking (date: booked period across today)", async () => {
    const res = await requester.delete("/api/1.0/houses/17");

    expect(res.statusCode).to.equal(500);
    expect(res.body.status).to.equal("still has booking");
  });

  it("house still has booking (date: booked period in the future)", async () => {
    const res = await requester.delete("/api/1.0/houses/21");

    expect(res.statusCode).to.equal(500);
    expect(res.body.status).to.equal("still has booking");
  });

  it("house does not have any booking", async () => {
    const res = await requester.delete("/api/1.0/houses/18");

    sinon.assert.callCount(stubDelete, 1);

    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("succeed");

    const [house] = await conn.query("SELECT * FROM house WHERE id=18");
    const [sideImages] = await conn.query(
      "SELECT * FROM image WHERE house_id=18"
    );
    const [houseAmenities] = await conn.query(
      "SELECT * FROM house_amenity WHERE house_id=18"
    );
    const [favorites] = await conn.query(
      "SELECT * FROM favorite WHERE house_id=18"
    );

    expect(house.length).to.equal(0);
    expect(sideImages.length).to.equal(0);
    expect(houseAmenities.length).to.equal(0);
    expect(favorites.length).to.equal(0);
  });

  it("booking for house all ended (date: booked period before today)", async () => {
    const res = await requester.delete("/api/1.0/houses/19");

    sinon.assert.callCount(stubDelete, 2);

    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("succeed");

    const [house] = await conn.query("SELECT * FROM house WHERE id=19");
    const [sideImages] = await conn.query(
      "SELECT * FROM image WHERE house_id=19"
    );
    const [houseAmenities] = await conn.query(
      "SELECT * FROM house_amenity WHERE house_id=19"
    );
    const [booking] = await conn.query(
      "SELECT * FROM booking WHERE house_id=19"
    );
    const [payment] = await conn.query(
      "SELECT * FROM payment WHERE booking_id=3"
    );
    const [review] = await conn.query(
      "SELECT * FROM review WHERE booking_id=3"
    );

    expect(house.length).to.equal(0);
    expect(sideImages.length).to.equal(0);
    expect(houseAmenities.length).to.equal(0);
    expect(booking.length).to.equal(0);
    expect(payment.length).to.equal(0);
    expect(review.length).to.equal(0);
  });

  it("booking for house all ended (date: checkout date equal today)", async () => {
    const res = await requester.delete("/api/1.0/houses/20");

    sinon.assert.callCount(stubDelete, 3);

    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("succeed");

    const [house] = await conn.query("SELECT * FROM house WHERE id=20");
    const [sideImages] = await conn.query(
      "SELECT * FROM image WHERE house_id=20"
    );
    const [houseAmenities] = await conn.query(
      "SELECT * FROM house_amenity WHERE house_id=20"
    );
    const [booking] = await conn.query(
      "SELECT * FROM booking WHERE house_id=20"
    );
    const [payment] = await conn.query(
      "SELECT * FROM payment WHERE booking_id=4"
    );
    const [review] = await conn.query(
      "SELECT * FROM review WHERE booking_id=4"
    );

    expect(house.length).to.equal(0);
    expect(sideImages.length).to.equal(0);
    expect(houseAmenities.length).to.equal(0);
    expect(booking.length).to.equal(0);
    expect(payment.length).to.equal(0);
    expect(review.length).to.equal(0);
  });

  after(async () => {
    stubDelete.restore();
    await conn.release();
  });
});
