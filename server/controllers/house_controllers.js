require("dotenv").config();
const houseQuery = require("../models/house_model");
const axios = require("axios");
const util = require("../../util/util");
const { validationResult } = require("express-validator");
const moment = require("moment-timezone");
const IMAGE_URL_PREFIX = process.env.CLOUDFRONT_DOMAIN;

const createHouse = async (req, res) => {
  //validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  //prepare create data
  const houseData = req.body;
  let amenityData = JSON.parse(houseData.amenity);
  delete houseData.amenity;
  houseData.landlord_id = req.user.id;
  if (houseData.refund_type === "0") {
    delete houseData.refund_duration;
  }

  // upload Image
  const [mainImgURL, sideImg1URL, sideImg2URL] =
    await util.uploadImageToS3Multi(req.files, [0, 1, 2]);
  // const mainImgURL = await util.uploadImageToS3(req.files, "mainImg");
  // const sideImg1URL = await util.uploadImageToS3(req.files, "sideImg1");
  // const sideImg2URL = await util.uploadImageToS3(req.files, "sideImg2");
  console.log("create house");
  console.log(mainImgURL);
  console.log(sideImg1URL);
  console.log(sideImg2URL);

  houseData.image_url = mainImgURL;
  const imageData = [sideImg1URL, sideImg2URL];

  const createResult = await houseQuery.createHouse(
    houseData,
    imageData,
    amenityData
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

  //select 7 houses per time to check next page
  if (houses.length === 7) {
    APIData.next_paging = paging + 1;
    houses.pop();
  }

  houses.forEach((house) => {
    house.image_url = IMAGE_URL_PREFIX + house.image_url;
  });
  APIData.data = houses;

  res.json(APIData);
};

const houseSearch = async (req, res) => {
  let queryCondition = req.body;
  let orderCondition = 0; //0 means no order, 1 means DESC and 2 means ASC
  //seperate order property
  if ("price_order" in queryCondition) {
    orderCondition = parseInt(queryCondition.price_order);
    delete queryCondition.price_order;
  }

  queryCondition = Object.entries(queryCondition);
  const paging = parseInt(req.query.paging);
  const itemNum = 7;

  //search for houses meeting condition
  const selectData = await houseQuery.houseSearch(
    queryCondition,
    orderCondition,
    paging,
    itemNum
  );

  //check total page and next page
  let houses = selectData.data;
  let houseCount = selectData.houseCount;
  const totalPage = Math.ceil(houseCount / 6);
  let APIData = { totalPage };
  if (houses.length === 7) {
    APIData.next_paging = paging + 1;
    houses.pop();
  }

  houses.forEach((house) => {
    house.image_url = IMAGE_URL_PREFIX + house.image_url;
  });
  APIData.data = houses;

  res.json(APIData);
};

const houseDatail = async (req, res) => {
  const { id } = req.params;
  //get house data
  const houses = await houseQuery.houseDatail(id);

  houses[0].sideImages_url = [];
  houses.forEach((house) => {
    house.image_url = IMAGE_URL_PREFIX + house.image_url;
    houses[0].sideImages_url.push(IMAGE_URL_PREFIX + house.sideImage_url);
  });
  let houseData = houses[0];
  //get amenity
  const amenityData = await houseQuery.houseAmentity(id);

  amenityData.forEach((amenity) => {
    amenity[1] = IMAGE_URL_PREFIX + amenity[1];
  });
  //get review
  const reviewData = await houseQuery.houseReview([id, id]);

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

  const userID = req.user.id;
  const userTrip = await houseQuery.selectTrip(userID, requestType);

  // node will transfer time to UTC time, transfer back to Taipei time
  userTrip.forEach((trip) => {
    trip.checkin_date = moment(trip.checkin_date)
      .tz("Asia/Taipei")
      .format("YYYY-MM-DD");
    trip.checkout_date = moment(trip.checkout_date)
      .tz("Asia/Taipei")
      .format("YYYY-MM-DD");
    trip.image_url = IMAGE_URL_PREFIX + trip.image_url;
  });

  res.json(userTrip);
};

const checkRefund = async (req, res) => {
  const bookingID = req.query.booking_id;
  const requestCancelTime = parseInt(req.query.requestCancelTime);
  let dueTime = await houseQuery.getRefundDue(bookingID);
  dueTime = parseInt(dueTime);

  if (dueTime >= requestCancelTime) {
    await houseQuery.updateBooking(bookingID);
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
  let landlordID = req.user.id;
  const houses = await houseQuery.landlordHouse(landlordID);
  houses.forEach((house) => {
    house.image_url = IMAGE_URL_PREFIX + house.image_url;
  });
  res.json(houses);
};

const houseHistroyData = async (req, res) => {
  const landlordID = req.user.id;
  const houseID = req.query.id;

  const house = await houseQuery.houseHistroyData(landlordID, houseID);
  if (house.length === 0) {
    const err = new Error("權限不足");
    err.type = "forbidden";
    throw err;
  }

  house[0].image_url = IMAGE_URL_PREFIX + house[0].image_url;

  house[0].sideimage_list = house[0].sideimage_list.map(
    (sideimage_url) => IMAGE_URL_PREFIX + sideimage_url
  );

  res.json(house);
};

const updateHouse = async (req, res) => {
  let houseID = req.query.id;
  let { deleteImg, amenity } = req.body;
  deleteImg = JSON.parse(deleteImg);
  amenity = JSON.parse(amenity);
  //delete redundant data in house data
  delete req.body.deleteImg;
  delete req.body.city_id;
  delete req.body.region;
  delete req.body.address;
  delete req.body.amenity;
  req.body.updated_at = Date.now();
  const updateHouseData = req.body;

  let newImageFileNames;
  let mainImages = [];
  let sideImages = [];
  let updateSideImage = false; //variable to check if side image is updated
  let oldImageList = [];

  //upload all uploaded image to S3
  let deleteImgIndices = Object.keys(deleteImg);
  if (deleteImgIndices.length !== 0) {
    newImageFileNames = await util.uploadImageToS3Multi(
      req.files,
      deleteImgIndices
    );
    deleteImgIndices.forEach((deleteImgIndex, arrayIndex) => {
      let newImageName = newImageFileNames[arrayIndex];
      let oldImageName = util.getImagePathOnS3(deleteImg[deleteImgIndex]);
      oldImageList.push(oldImageName);
      if (deleteImgIndex === "0") {
        //main image
        mainImages.push(newImageName);
        mainImages.push(oldImageName);
        updateHouseData.image_url = mainImages[0];
      } else {
        //side image
        sideImages.push([newImageName, oldImageName]);
        updateSideImage = true;
      }
    });
  }

  let updateAmenityData = [];
  for (let i = 0; i < amenity.length; i++) {
    let temp = [houseID, amenity[i]];
    updateAmenityData.push(temp);
  }

  //update table in RDS
  await houseQuery.updateHouse(
    houseID,
    updateHouseData,
    sideImages,
    updateSideImage,
    updateAmenityData
  );

  //delete old image on S3
  if (deleteImgIndices.length !== 0) {
    await util.deleteImageFromS3Multi(oldImageList);
  }

  return res.json({ status: "succeed" });
};

const deleteHouse = async (req, res) => {
  const houseID = req.query.id;

  const today = moment().tz("Asia/Taipei").format("YYYY-MM-DD");
  const remainBooking = await houseQuery.checkBookingForDelete(houseID, today);

  //cannot delete house, if there is booking existing
  if (remainBooking.length !== 0) {
    return res.status(500).json({ status: "still has booking" });
  }

  //delete
  const images = await houseQuery.deleteHouse(houseID);
  await util.deleteImageFromS3Multi(images);

  res.json({ status: "succeed" });
};

const likeHouse = async (req, res) => {
  const userID = req.user.id;
  const houseID = req.query.id;
  await houseQuery.likeHouse(userID, houseID);
  const favoriteList = await houseQuery.selectUserFavoriteHouse(userID);

  res.json(favoriteList);
};

const dislikeHouse = async (req, res) => {
  const userID = req.user.id;
  const houseID = req.query.id;
  const favoriteID = await houseQuery.findFavoriteID(userID, houseID);

  await houseQuery.dislikeHouse(favoriteID);
  const favoriteList = await houseQuery.selectUserFavoriteHouse(userID);
  res.json(favoriteList);
};

const getUserFavorite = async (req, res) => {
  const userID = req.user.id;
  const favoriteList = await houseQuery.selectUserFavoriteHouse(userID);
  res.json(favoriteList);
};

const getUserFavoriteDetail = async (req, res) => {
  const userID = req.user.id;
  const houseDetail = await houseQuery.selectUserFavoriteHouseDetail(userID);
  houseDetail.forEach((house) => {
    house.image_url = IMAGE_URL_PREFIX + house.image_url;
  });
  res.json(houseDetail);
};

const houseBookedDate = async (req, res) => {
  const houseID = req.query.id;
  let bookedDateList = await houseQuery.houseBookedDate(houseID);
  res.json(bookedDateList);
};

const checkBooking = async (req, res) => {
  let { startDate, endDate, id } = req.query;
  id = parseInt(id);

  const bookedResult = await houseQuery.checkBooking([
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
  ]);

  res.json({ status: bookedResult.includes(id) });
};

module.exports = {
  createHouse,
  selectAllHouse,
  houseSearch,
  houseDatail,
  houseNearby,
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
  checkBooking,
};
