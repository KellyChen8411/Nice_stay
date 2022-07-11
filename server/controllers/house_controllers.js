require("dotenv").config();
const houseQuery = require("../models/house_model");
const axios = require("axios");
const AWS = require("aws-sdk");
const util = require("../../util/util");
const { validationResult } = require("express-validator");
const moment = require("moment-timezone");
const { pool } = require("../models/mysqlcon");

const createHouse = async (req, res) => {
  //validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const house_data = req.body;
  let amenityList = JSON.parse(house_data.amenity);
  delete house_data.amenity;
  house_data.landlord_id = req.user.id;
  if (house_data.refund_type === "0") {
    delete house_data.refund_duration;
  }

  // upload Image
  const mainImg_url = await util.uplaodImageToS3(req.files, "mainImg");
  const sideImg1_url = await util.uplaodImageToS3(req.files, "sideImg1");
  const sideImg2_url = await util.uplaodImageToS3(req.files, "sideImg2");

  house_data.image_url = mainImg_url;
  const image_data = [sideImg1_url, sideImg2_url];

  const createResult = await houseQuery.createHouse(
    house_data,
    image_data,
    amenityList
  );

  res.json({ house_id: createResult });
};

const selectAllHouse = async (req, res) => {
  const paging = parseInt(req.query.paging);
  const itemNum = 7;
  const houses = await houseQuery.selectAllHouse(paging, itemNum);
  const houseCount = await houseQuery.allHouseCount();
  const totalPage = Math.ceil(houseCount / 6);
  let APIData = { totalPage };
  if (houses.length === 7) {
    APIData.next_paging = paging + 1;
    houses.pop();
  }
  const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN;
  houses.forEach((house) => {
    house.image_url = imageURL_prefix + house.image_url;
  });
  APIData.data = houses;

  res.json(APIData);
};

const houseSearch = async (req, res) => {
  let queryCondition = req.body;
  let orderCondition = 0; //0 means no order, 1 means DESC and 2 means ASC
  //take order key out
  if ("price_order" in queryCondition) {
    orderCondition = parseInt(queryCondition.price_order);
    delete queryCondition.price_order;
  }

  queryCondition = Object.entries(queryCondition);
  const paging = parseInt(req.query.paging);
  const itemNum = 7;

  const selectData = await houseQuery.houseSearch(
    queryCondition,
    orderCondition,
    paging,
    itemNum
  );
  let houses = selectData.data;
  let houseCount = selectData.houseCount;
  const totalPage = Math.ceil(houseCount / 6);
  let APIData = { totalPage };
  if (houses.length === 7) {
    APIData.next_paging = paging + 1;
    houses.pop();
  }

  const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN;
  houses.forEach((house) => {
    house.image_url = imageURL_prefix + house.image_url;
  });
  APIData.data = houses;

  res.json(APIData);
};

const houseTest = async (req, res) => {
  // const house_id = await houseQuery.getHouseID();
  // const amenity_id = [1,2,3,4,5,6,7,8,9,10];
  // function getRandomSubarray(arr, size) {
  //     var shuffled = arr.slice(0), i = arr.length, temp, index;
  //     while (i--) {
  //         index = Math.floor((i + 1) * Math.random());
  //         temp = shuffled[index];
  //         shuffled[index] = shuffled[i];
  //         shuffled[i] = temp;
  //     }
  //     return shuffled.slice(0, size);
  // }
  // let insertData = [];
  // house_id.forEach(house => {
  //     let arrayNum = Math.floor(Math.random() * (10- 6 + 1)) + 6;
  //     let tempAmenity = getRandomSubarray(amenity_id, arrayNum);
  //     tempAmenity.forEach(amenity=>{
  //         let tempArr = [house[0], amenity];
  //         insertData.push(tempArr);
  //     })
  // })
  // // console.log(insertData);
  // await houseQuery.insertAmenity(insertData);
  // res.send('test');
  // let newAmenityList = [1,2,3,4,7,8,10];
  // let new_id_list = [];
  // for(let i=0; i<newAmenityList.length; i++){
  //   let temp = [1, newAmenityList[i]];
  //   new_id_list.push(temp);
  // }
  // let house_id = 1;
  // const conn = await pool.getConnection();
  // try {
  //   // await conn.query("START TRANSACTION");
  //   // await conn.query( "INSERT INTO house_amenity (house_id, amenity_id) VALUES ?", [ new_id_list ] );
  //   const [result] = await conn.query( "SELECT JSON_ARRAYAGG(id) AS id_list FROM house_amenity WHERE house_id=?", house_id );
  //   let id_list = result[0].id_list;
  //   console.log(id_list);
  //   // let new_id_list = [];
  //   // for(let i=0; i<id_list.length; i++){
  //   //   let temp = [];
  //   //   temp.push(id_list[i]);
  //   //   new_id_list.push(temp);
  //   // }
  //   // console.log(new_id_list);
  //   // const [result2] = await conn.query( "SELECT * FROM house_amenity WHERE id in (?)", [ id_list ] );
  //   const [result2] = await conn.query( "DELETE FROM house_amenity WHERE id in (?)",  [ id_list ]   );
  //   console.log(result2);
  //   res.json({ test: "test" });
  //   await conn.query("COMMIT");
  // } catch (error) {
  //   await conn.query("ROLLBACK");
  //   console.log(error);
  //   return -1;
  // } finally {
  //   await conn.release();
  // }
};

const houseDatail = async (req, res) => {
  const { id } = req.params;
  //get house data
  const houses = await houseQuery.houseDatail(id);
  houses[0].sideImages_url = [];
  houses.forEach((house) => {
    house.image_url = process.env.CLOUDFRONT_DOMAIN + house.image_url;
    houses[0].sideImages_url.push(
      process.env.CLOUDFRONT_DOMAIN + house.sideImage_url
    );
  });
  let houseData = houses[0];
  //get amenity
  const amenityData = await houseQuery.houseAmentity(id);
  amenityData.forEach((amenity) => {
    amenity[1] = process.env.CLOUDFRONT_DOMAIN + amenity[1];
  });
  //get review
  const reviewData = await houseQuery.houseReview([
    id,
    // houseData.landlord_id,
    id,
  ]);

  //get landlordRate
  let landLordRate = await houseQuery.landLordRate(houseData.landlord_id);

  if (landLordRate.length === 0) {
    landLordRate = [];
  }

  res.json({
    house: houseData,
    amenity: amenityData,
    review: reviewData,
    landLordRate,
  });
};

const houseNearby = async (req, res) => {
  let { lat, lon, type } = req.query;

  let URL;
  if (type === "traffic") {
    URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=1000&type=bus_station&key=${process.env.GOOGLEAPI_KEY}`;
  } else if (type === "restaurant") {
    URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=1000&type=restaurant&key=${process.env.GOOGLEAPI_KEY}`;
  } else if (type === "store") {
    URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=1000&type=convenience_store&key=${process.env.GOOGLEAPI_KEY}`;
  }

  var config = {
    method: "get",
    url: URL,
    headers: {},
  };

  let nearbyLocations = await axios(config);
  let nearbyLocationsData = nearbyLocations.data;
  let nearbyLocationSet = [];
  nearbyLocationsData.results.forEach((element) => {
    let placeGro = element.geometry.location;
    nearbyLocationSet.push({
      lat: placeGro.lat,
      lon: placeGro.lng,
      name: element.name,
    });
  });

  res.json(nearbyLocationSet);
};

const selectTrip = async (req, res) => {
  let requestType = "trip";
  //for managebooking page
  if (req.url === "/houses/booking") {
    if (req.user.role !== 2) {
      const err = new Error("權限不足");
      err.type = "forbidden";
      throw err;
    } else {
      requestType = "booking";
    }
  }

  const user_id = req.user.id;
  const userTrip = await houseQuery.selectTrip(user_id, requestType);

  // mysql2 會轉date時間，將時間轉回台灣日期
  userTrip.forEach((trip) => {
    trip.checkin_date = moment(trip.checkin_date)
      .tz("Asia/Taipei")
      .format("YYYY-MM-DD");
    trip.checkout_date = moment(trip.checkout_date)
      .tz("Asia/Taipei")
      .format("YYYY-MM-DD");
    trip.image_url = process.env.CLOUDFRONT_DOMAIN + trip.image_url;
  });

  res.json(userTrip);

  // res.json({test: 'test'});
};

const checkRefund = async (req, res) => {
  const booking_id = req.query.booking_id;
  const requestCancelTime = parseInt(req.query.requestCancelTime);
  let dueTime = await houseQuery.getRefundDue(booking_id);
  dueTime = parseInt(dueTime);

  if (dueTime >= requestCancelTime) {
    await houseQuery.updateBooking(booking_id);
    return res.json({ cancel: true });
  } else {
    res.json({ cancel: false });
  }
};

const leftreview = async (req, res) => {
  let reviewInfo = req.body;
  await houseQuery.leftreview(reviewInfo);
  res.json({ status: "succeed" });
};

const landlordHouse = async (req, res) => {
  if (req.user.role !== 2) {
    const err = new Error("權限不足");
    err.type = "forbidden";
    throw err;
  }
  let landlord_id = req.user.id;
  const houses = await houseQuery.landlordHouse(landlord_id);
  houses.forEach((house) => {
    house.image_url = process.env.CLOUDFRONT_DOMAIN + house.image_url;
  });
  res.json(houses);
};

const houseHistroyData = async (req, res) => {
  const landlord_id = req.user.id;
  const house_id = req.query.id;

  const house = await houseQuery.houseHistroyData(landlord_id, house_id);
  if (house.length === 0) {
    const err = new Error("權限不足");
    err.type = "forbidden";
    throw err;
  }

  house[0].image_url = process.env.CLOUDFRONT_DOMAIN + house[0].image_url;

  house[0].sideimage_list = house[0].sideimage_list.map(
    (sideimage_url) => process.env.CLOUDFRONT_DOMAIN + sideimage_url
  );

  res.json(house);
};

const updateHouse = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    let house_id = req.query.id;
    let { deleteImg, amenity } = req.body;
    deleteImg = JSON.parse(deleteImg);
    let amenityList = JSON.parse(amenity);
    //delete redundant data in house data
    delete req.body.deleteImg;
    delete req.body.city_id;
    delete req.body.region;
    delete req.body.address;
    delete req.body.amenity;
    req.body.updated_at = Date.now();
    const updateHouseData = req.body;

    //upload all uploaded image and update image(side) table and delete side image in S3
    let deleteImgIndex = Object.keys(deleteImg);
    let imageUploadType = ["mainImg", "sideImg1", "sideImg2"];
    if (deleteImgIndex.length !== 0) {
      for (let i = 0; i < deleteImgIndex.length; i++) {
        let ImgIndex = deleteImgIndex[i];
        let uploadFileName = await util.uplaodImageToS3(
          req.files,
          imageUploadType[ImgIndex]
        );

        if (ImgIndex === "0") {
          updateHouseData.image_url = uploadFileName;
        } else {
          let oldSideImgUrl = deleteImg[`${ImgIndex}`].slice(38);
          await conn.query("UPDATE image SET image_url=? WHERE image_url=?", [
            uploadFileName,
            oldSideImgUrl,
          ]);
          await util.deleteImageFromS3(oldSideImgUrl);
        }
      }
    }

    //insert data into house table and delete main image in S3
    await conn.query("UPDATE house SET ? WHERE id=?", [
      updateHouseData,
      house_id,
    ]);
    if ("image_url" in updateHouseData) {
      await util.deleteImageFromS3(deleteImg["0"].slice(38));
    }

    //delete house amenity and reinsert data
    //delete
    let [id_list] = await conn.query(
      "SELECT JSON_ARRAYAGG(id) AS id_list FROM house_amenity WHERE house_id=?",
      house_id
    );
    id_list = id_list[0].id_list;
    await conn.query("DELETE FROM house_amenity WHERE id in (?)", [id_list]);
    //reinsert
    let newAmenityList = [];
    for (let i = 0; i < amenityList.length; i++) {
      let temp = [house_id, amenityList[i]];
      newAmenityList.push(temp);
    }
    const [amenityResult] = await conn.query(
      "INSERT INTO house_amenity (house_id, amenity_id) VALUES ?",
      [newAmenityList]
    );

    await conn.query("COMMIT");
    return res.json({ status: "succeed" });
  } catch (error) {
    await conn.query("ROLLBACK");
    throw error;
    return -1;
  } finally {
    await conn.release();
  }
};

const deleteHouse = async (req, res) => {
  const house_id = req.query.id;
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    //delete data from image table
    let [id_list_image] = await conn.query(
      "SELECT JSON_ARRAYAGG(id) AS id_list FROM image WHERE house_id=?",
      house_id
    );
    id_list_image = id_list_image[0].id_list;
    await conn.query("DELETE FROM image WHERE id in (?)", [id_list_image]);
    //delete data from amenity table
    let [id_list_amenity] = await conn.query(
      "SELECT JSON_ARRAYAGG(id) AS id_list FROM house_amenity WHERE house_id=?",
      house_id
    );
    id_list_amenity = id_list_amenity[0].id_list;
    await conn.query("DELETE FROM house_amenity WHERE id in (?)", [
      id_list_amenity,
    ]);
    //delete data from house table
    await conn.query("DELETE FROM house WHERE id=?", house_id);

    //delete image in S3
    const [result] = await pool.query(
      "SELECT a.id, a.image_url AS mainimage_list, b.sideimage_list FROM house a left join (SELECT house_id, JSON_ARRAYAGG(image_url) AS sideimage_list FROM image group by house_id) b ON a.id=b.house_id WHERE a.id=?",
      house_id
    );
    const imageList = [result[0].mainimage_list, ...result[0].sideimage_list];
    for (let i = 0; i < imageList.length; i++) {
      await util.deleteImageFromS3(imageList[i]);
    }

    await conn.query("COMMIT");
    return res.json({ status: "succeed" });
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const likeHouse = async (req, res) => {
  const user_id = req.user.id;
  const house_id = req.query.id;
  await houseQuery.likeHouse(user_id, house_id);
  const favoriteList = await houseQuery.selectUserFavoriteHouse(user_id);

  res.json(favoriteList);
};

const dislikeHouse = async (req, res) => {
  const user_id = req.user.id;
  const house_id = req.query.id;
  const favorite_id = await houseQuery.findFavoriteID(user_id, house_id);

  await houseQuery.dislikeHouse(favorite_id);
  const favoriteList = await houseQuery.selectUserFavoriteHouse(user_id);
  res.json(favoriteList);
};

const getUserFavorite = async (req, res) => {
  const user_id = req.user.id;
  const favoriteList = await houseQuery.selectUserFavoriteHouse(user_id);
  res.json(favoriteList);
};

const getUserFavoriteDetail = async (req, res) => {
  const user_id = req.user.id;
  const houseDetail = await houseQuery.selectUserFavoriteHouseDetail(user_id);
  houseDetail.forEach((house) => {
    house.image_url = process.env.CLOUDFRONT_DOMAIN + house.image_url;
  });
  res.json(houseDetail);
};

const houseBookedDate = async (req, res) => {
  const house_id = req.query.id;
  let bookedDate_list = await houseQuery.houseBookedDate(house_id);
  res.json(bookedDate_list);
};

module.exports = {
  createHouse,
  selectAllHouse,
  houseSearch,
  houseDatail,
  houseNearby,
  houseTest,
  selectTrip,
  checkRefund,
  leftreview,
  landlordHouse,
  houseHistroyData,
  updateHouse,
  deleteHouse,
  likeHouse,
  dislikeHouse,
  getUserFavorite,
  getUserFavoriteDetail,
  houseBookedDate,
};
