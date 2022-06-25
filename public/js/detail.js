let map;
var markers = []; //marker array
let house_lat;
let house_lon;
let roomfee;
let cleanFee;
let taxFee;
let amountFee;
let is_refund = 0;
let refund_duedate;
let refund_duedate_timestamp;
const params = new URLSearchParams(window.location.search);
let house_id = params.get("id");
let startDate = params.get("startDate");
let endDate = params.get("endDate");
let people_count = params.get("people_count");

//fetch data

//date function
const diffDays = (date, otherDate) =>
  Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));
function computeDueDate(startDate, duration) {
  let dateTime = new Date(startDate);
  let today_date = dateTime.setDate(dateTime.getDate() - duration);
  today_date = new Date(today_date).toISOString().split("T")[0];
  return today_date;
}
function covertToISOtime(dateString) {
  let time_ISO = dateString + "T23:59:00+0800";
  return time_ISO;
}

async function rederData() {
  let detailData = await fetch(`/api/1.0/houses/detail/${house_id}`);
  detailData = await detailData.json();
  let houseData = detailData.house;
  let amenityData = detailData.amenity;
  let reviewData = detailData.review;
  let reviewCount = reviewData.length;

  house_lat = houseData.latitude;
  house_lon = houseData.longitude;
  //title area
  $("#house_title").text(houseData.title);
  $("#room_rate").text(reviewData[0].house_ave);
  $("#comment_count").text(`${reviewCount}則評價`);
  $("#city_region").text(`${houseData.city_name}、${houseData.region}`);
  $("#house_config").text(
    `${houseData.category_name}-${houseData.people_count}位.${houseData.room_count}間臥室.${houseData.bed_count}張床.${houseData.bathroom_count}間衛浴`
  );
  //images area
  $("#image1").attr("src", houseData.image_url);
  $("#image2").attr("src", houseData.sideImages_url[0]);
  $("#image3").attr("src", houseData.sideImages_url[1]);
  //feature area
  if (reviewData[0].landlord_ave > 4.5) {
    let clone = $("#feature_con").clone().appendTo($("#feature_outter"));
    clone.find("img").attr("src", "./images/landlord.png");
    clone.find("h4").text(`${reviewData[0].landlord_name}是超讚房東`);
    clone.removeAttr("style");
  }
  if (houseData.refund_type === 1) {
    //計算離入住前剩餘幾天
    // const today_date = new Date(Date.now() + (8*60*60*1000)).toISOString().split('T')[0];
    // const duration = diffDays(new Date(today_date), new Date(startDate));
    const today_date_moment = moment().tz("Asia/Taipei").format("YYYY-MM-DD");
    const checkinDate_moment = moment(startDate);
    const duration = checkinDate_moment.diff(today_date_moment, "days");
    if (duration >= houseData.refund_duration) {
      is_refund = 1;
      //計算取消期限的日期
      // let dueDate = computeDueDate(startDate, houseData.refund_duration);
      // console.log(moment(startDate).format());
      let dueDate = moment(startDate)
        .subtract(houseData.refund_duration, "days")
        .format("YYYY-MM-DD");
      // console.log(startDate);
      // console.log(houseData.refund_duration);
      // console.log(dueDate);
      // console.log(dueDate.format('YYYY-MM-DD'));
      let dueDate_ISO = covertToISOtime(dueDate);
      console.log(dueDate_ISO);
      refund_duedate = moment(dueDate_ISO).format("YYYY-MM-DD HH:mm:ss");
      refund_duedate_timestamp = moment(dueDate_ISO).valueOf();
      // console.log(startDate);
      // console.log(dueDate);
      // console.log(covertToISOtime(dueDate));
      // console.log(moment(covertToISOtime(dueDate)).format());
      // console.log(moment(covertToISOtime(dueDate)).format('YYYY-MM-DD HH:mm:ss'));
      // console.log(moment(covertToISOtime(dueDate)).valueOf());
      // console.log(moment(moment(covertToISOtime(dueDate)).format()).valueOf());
      // console.log(refund_duedate_timestamp);

      //render data
      let clone = $("#feature_con").clone().appendTo($("#feature_outter"));
      clone.find("img").attr("src", "./images/calendar.png");
      clone
        .find("h4")
        .text(
          `入住${houseData.refund_duration}天(${refund_duedate})前可免費取消`
        );
      clone.removeAttr("style");
    }
  }
  if (houseData.refund_type === 2) {
    is_refund = 2;
    refund_duedate = houseData.refund_duration;
    let clone = $("#feature_con").clone().appendTo($("#feature_outter"));
    clone.find("img").attr("src", "./images/calendar.png");
    clone.find("h4").text(`${houseData.refund_duration}小時內可免費取消`);
    clone.removeAttr("style");
  }
  //introduce area
  $("#introduce_con>p").text(houseData.description);
  //facility area
  amenityData.forEach((amenity) => {
    let clone = $("#facility_con").clone().appendTo($("#facility_inner"));
    clone.find("img").attr("src", amenity[1]);
    clone.find("h4").text(amenity[0]);
    clone.removeAttr("style");
  });
  //checkoout area
  if (startDate !== null && endDate !== null) {
    $("#checkin_date").val(startDate);
    $("#checkout_date").val(endDate);
    const durationDays = diffDays(new Date(startDate), new Date(endDate));
    roomfee = houseData.price * durationDays;
    cleanFee = (roomfee * houseData.cleanfee_percentage) / 100;
    taxFee = (roomfee * houseData.tax_percentage) / 100;
    amountFee = roomfee + cleanFee + taxFee;
    $("#fee_perNight").text(`$${houseData.price} TWD／晚`);
    $("#room_fee_title").text(`訂房費 (${durationDays}晚)`);
    $("#room_fee").text(`${roomfee} TWD`);
    $("#clean_fee").text(`${cleanFee} TWD`);
    $("#tax_fee").text(`${taxFee} TWD`);
    $("#amount_fee").text(`${amountFee} TWD`);
  }
  //comment area
  $("#comment_summary>h2").text(
    `${reviewData[0].house_ave} (${reviewCount}則評價)`
  );
  reviewData.forEach((review) => {
    let clone = $("#comment_item").clone().appendTo($("#comment_con"));
    clone.find("h4").text(review.renter_name);
    let comment_date = review.created_at.substr(0, 10);
    clone.find("small").text(comment_date);
    clone.find("p").text(review.comment);
    clone.removeAttr("style");
  });
  //landlord area
  $("#landlord_outter>h2").text(`房東:${reviewData[0].landlord_name}`);
  $("#landlord_outter>sapn").text(reviewData[0].landlord_ave);

  //map area
  window.initMap = initMap(house_lat, house_lon);
}

rederData();

// Initialize and add the map
async function initMap(lat, lng) {
  // The location of Uluru
  const cenPoint = { lat, lng };
  // The map, centered at Uluru
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: cenPoint,
  });

  const marker = new google.maps.Marker({
    position: cenPoint,
    map: map,
    icon: "https://d278985kbhjfo4.cloudfront.net/Nice_stay/icon/house_map.png",
  });

  // $('#nearby_con').click(getNearbyInfo);
}

//chose nearby
$("#nearby_con").click(getNearbyInfo);

async function getNearbyInfo(e) {
  if (e.target.nodeName === "BUTTON") {
    let nearbyLocations = await fetch(
      `/api/1.0/houses/nearby?lat=${house_lat}&lon=${house_lon}&type=${e.target.dataset.type}`
    );
    nearbyLocations = await nearbyLocations.json();
    // console.log(nearbyLocations);
    if (markers.length !== 0) {
      for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    }
    for (var i = 0; i < nearbyLocations.length; i++) {
      console.log(nearbyLocations[i]);
      var position = new google.maps.LatLng(
        nearbyLocations[i].lat,
        nearbyLocations[i].lon
      );

      var marker = new google.maps.Marker({
        position: position,
        map: map,
      });
      markers.push(marker);
    }
  }
}

//go to checkout
$("#checkout_btn").click(gotoCheckout);

function gotoCheckout() {
  window.location.href = `/checkout.html?id=${house_id}&startDate=${startDate}&endDate=${endDate}&roomfee=${roomfee}&cleanFee=${cleanFee}&taxFee=${taxFee}&amountFee=${amountFee}&people_count=${people_count}&refund_type=${is_refund}&refund_duedate=${refund_duedate}&refund_duedate_timestamp=${refund_duedate_timestamp}`;
}
