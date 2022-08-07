require("dotenv").config();
const { expect, requester } = require("./setup");
const { pool } = require("../server/models/mysqlcon");
const sinon = require("sinon");
const util = require("../util/util");
const { NODE_ENV } = process.env;
let stubUpload;
let stubDelete;
let fakeS3uploadMulti;
//inport fake data
const { houses, images } = require("./fakedata");

const newImgURLSet = [
  "Nice_stay/main/main_1658375179068.jpg",
  "Nice_stay/side_image/1658375179135_1.jpg",
  "Nice_stay/side_image/1658375179139_2.jpg",
];
const oldImgURLSet = [
  "Nice_stay/main/main_1655953776145.jpg",
  "Nice_stay/side_image/1656936912495.jpg",
  "Nice_stay/side_image/1656936932134.jpg",
];
const threeImagesData =
  '{"0": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/main/main_1655953776145.jpg","1": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/side_image/1656936912495.jpg","2": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/side_image/1656936932134.jpg"}';
const mainImagesData =
  '{"0": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/main/main_1655953776145.jpg"}';
const sideImagesData =
  '{"2": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/side_image/1656936932134.jpg"}';
const amenityData = "[1,3,6,7,9]";

describe("update house", () => {
  before(async () => {
    fakeS3uploadMulti = (files, imageIndices) => {
      return new Promise((resolve, reject) => {
        const newImageURLs = imageIndices.map(
          (imageIndex) => newImgURLSet[imageIndex]
        );
        resolve(newImageURLs);
      });
    };
    stubUpload = sinon
      .stub(util, "uploadImageToS3Multi")
      .callsFake(fakeS3uploadMulti);
    stubDelete = sinon.stub(util, "deleteImageFromS3Multi").callsFake(() => {});
  });

  it("Update 3 images", async () => {
    const res = await requester
      .patch("/api/1.0/houses/15")
      .send({ deleteImg: threeImagesData, amenity: amenityData });

    //check testDoubles is called
    sinon.assert.callCount(stubUpload, 1);
    sinon.assert.callCount(stubDelete, 1);

    //check response data is correct
    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("succeed");

    //check main image data
    const [mainImageURL] = await pool.query(
      "SELECT image_url FROM house WHERE id=15"
    );
    const mainImg_url = mainImageURL[0].image_url;
    expect(mainImageURL.length).to.equal(1);
    expect(mainImg_url).to.deep.equal(newImgURLSet[0]);

    //check side images data
    const [sideImageURL] = await pool.query(
      "SELECT json_arrayagg(image_url) as image_urls  FROM image WHERE house_id=15"
    );
    const sideImg_urls = sideImageURL[0].image_urls;
    expect(sideImg_urls.length).to.equal(2);
    expect(sideImg_urls[0]).to.deep.equal(newImgURLSet[1]);
    expect(sideImg_urls[1]).to.deep.equal(newImgURLSet[2]);

    //check house amenity
    let [amenity_ids] = await pool.query(
      "SELECT json_arrayagg(amenity_id) as amenity_ids FROM house_amenity WHERE house_id=15"
    );
    amenity_ids = amenity_ids[0].amenity_ids;
    expect(amenity_ids).to.deep.equal(JSON.parse(amenityData));
  });

  it("Upload main image", async () => {
    const res = await requester
      .patch("/api/1.0/houses/15")
      .send({ deleteImg: mainImagesData, amenity: amenityData });

    //check testDoubles is called
    sinon.assert.callCount(stubUpload, 2);
    sinon.assert.callCount(stubDelete, 2);

    //check response data is correct
    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("succeed");

    //check main image data
    const [mainImageURL] = await pool.query(
      "SELECT image_url FROM house WHERE id=15"
    );
    const mainImg_url = mainImageURL[0].image_url;
    expect(mainImg_url).to.deep.equal(newImgURLSet[0]);

    //check side image data
    const [sideImageURL] = await pool.query(
      "SELECT json_arrayagg(image_url) as image_urls  FROM image WHERE house_id=15"
    );
    const sideImg_urls = sideImageURL[0].image_urls;
    expect(sideImg_urls[0]).to.deep.equal(oldImgURLSet[1]);
    expect(sideImg_urls[1]).to.deep.equal(oldImgURLSet[2]);
  });

  it("Upload side image", async () => {
    const res = await requester
      .patch("/api/1.0/houses/15")
      .send({ deleteImg: sideImagesData, amenity: amenityData });

    //check testDoubles is called
    sinon.assert.callCount(stubUpload, 3);
    sinon.assert.callCount(stubDelete, 3);

    //check response data is correct
    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("succeed");

    //check main image data
    const [mainImageURL] = await pool.query(
      "SELECT image_url FROM house WHERE id=15"
    );
    const mainImg_url = mainImageURL[0].image_url;
    expect(mainImg_url).to.deep.equal(oldImgURLSet[0]);

    //check side image data
    const [sideImageURL] = await pool.query(
      "SELECT json_arrayagg(image_url) as image_urls  FROM image WHERE house_id=15"
    );
    const sideImg_urls = sideImageURL[0].image_urls;
    expect(sideImg_urls[0]).to.deep.equal(oldImgURLSet[1]);
    expect(sideImg_urls[1]).to.deep.equal(newImgURLSet[2]);
  });

  it("No image uploaded", async () => {
    const res = await requester
      .patch("/api/1.0/houses/15")
      .send({ deleteImg: "{}", amenity: amenityData });

    //check testDoubles is not called
    sinon.assert.callCount(stubUpload, 3);
    sinon.assert.callCount(stubDelete, 3);

    //check response data is correct
    expect(res.statusCode).to.equal(200);
    expect(res.body.status).to.equal("succeed");

    //check main image data
    const [mainImageURL] = await pool.query(
      "SELECT image_url FROM house WHERE id=15"
    );
    const mainImg_url = mainImageURL[0].image_url;
    expect(mainImg_url).to.deep.equal(oldImgURLSet[0]);

    //check side image data
    const [sideImageURL] = await pool.query(
      "SELECT json_arrayagg(image_url) as image_urls  FROM image WHERE house_id=15"
    );
    const sideImg_urls = sideImageURL[0].image_urls;
    expect(sideImg_urls[0]).to.deep.equal(oldImgURLSet[1]);
    expect(sideImg_urls[1]).to.deep.equal(oldImgURLSet[2]);
  });

  it("Error happened when upload image to S3", async () => {
    const errorS3 = new Error();
    errorS3.type = "S3error";
    stubUpload.throws(errorS3);
    const res = await requester
      .patch("/api/1.0/houses/15")
      .send({ deleteImg: threeImagesData, amenity: amenityData });

    //check testDoubles is not called
    sinon.assert.callCount(stubUpload, 4);
    sinon.assert.callCount(stubDelete, 3);

    //check response data is correct
    expect(res.statusCode).to.equal(500);
    expect(res.body.error).to.equal("S3 error");

    //check main image data
    const [mainImageURL] = await pool.query(
      "SELECT image_url FROM house WHERE id=15"
    );
    const mainImg_url = mainImageURL[0].image_url;
    expect(mainImg_url).to.deep.equal(oldImgURLSet[0]);

    //check side image data
    const [sideImageURL] = await pool.query(
      "SELECT json_arrayagg(image_url) as image_urls  FROM image WHERE house_id=15"
    );
    const sideImg_urls = sideImageURL[0].image_urls;
    expect(sideImg_urls[0]).to.deep.equal(oldImgURLSet[1]);
    expect(sideImg_urls[1]).to.deep.equal(oldImgURLSet[2]);
  });

  afterEach(async () => {
    if (NODE_ENV === "test") {
      //clean house and image tables
      const conn = await pool.getConnection();
      await conn.query("START TRANSACTION");
      await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
      await conn.query("TRUNCATE house");
      await conn.query("TRUNCATE image");
      await conn.query(
        "INSERT INTO house (id,title,category_id,description,price,tax_percentage,cleanfee_percentage,people_count,room_count,bed_count,bathroom_count,landlord_id,city_id,region,address,latitude,longitude,refund_type,refund_duration,image_url,created_at,updated_at,pet) VALUES ?",
        [houses.map((house) => Object.values(house))]
      );
      await conn.query("INSERT INTO image (id,house_id,image_url) VALUES ?", [
        images.map((image) => Object.values(image)),
      ]);
      await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
      await conn.query("COMMIT");
      await conn.release();
    }
  });

  after(() => {
    stubUpload.restore();
    stubDelete.restore();
  });
});
