require("dotenv").config();
const houseQuery = require("../models/house_model");
const axios = require("axios");
const AWS = require("aws-sdk");
const util = require("../../util/util");
const { validationResult } = require("express-validator");
const moment = require("moment-timezone");

const createHouse = async (req, res) => {
  //validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log('Validation Error');
    // console.log(errors.array());
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
  // console.log(createResult);

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
  // console.log(APIData)
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
  // console.log(queryCondition);
  // console.log(orderCondition);

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
  // console.log(houses);
  const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN;
  houses.forEach((house) => {
    house.image_url = imageURL_prefix + house.image_url;
  });
  APIData.data = houses;
  // console.log(APIData);
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
  res.json({ test: "test" });
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
  console.log(landLordRate);

  res.json({
    house: houseData,
    amenity: amenityData,
    review: reviewData,
    landLordRate,
  });
};

const houseNearby = async (req, res) => {
  let { lat, lon, type } = req.query;
  console.log(lat);
  console.log(lon);
  console.log(type);
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

  console.log(nearbyLocationsData);

  res.json(nearbyLocationSet);
};

const selectTrip = async (req, res) => {
  const user_id = req.query.userID;
  const userTrip = await houseQuery.selectTrip(user_id);

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
  console.log(userTrip);
  res.json(userTrip);
};

const checkRefund = async (req, res) => {
  const booking_id = req.query.booking_id;
  const requestCancelTime = parseInt(req.query.requestCancelTime);
  let dueTime = await houseQuery.getRefundDue(booking_id);
  dueTime = parseInt(dueTime);
  console.log(requestCancelTime);
  console.log(dueTime);
  if(dueTime>=requestCancelTime){
    await houseQuery.updateBooking(booking_id);
    return res.json({cancel: true});
  }else{
    res.json({cancel: false});
  }
  
}

const leftreview = async (req, res) => {
  let reviewInfo = req.body;
  await houseQuery.leftreview(reviewInfo);
  res.json({status: 'succeed'})
}



module.exports = {
  createHouse,
  selectAllHouse,
  houseSearch,
  houseDatail,
  houseNearby,
  houseTest,
  selectTrip,
  checkRefund,
  leftreview
};
