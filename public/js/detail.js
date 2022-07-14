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
let houseData;
let landlord_id;
let hasFeature = 0; //用來確認是否有feature的變數

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
function computeDueTime(startDate){
  //計算離入住前剩餘幾天
  const today_date_moment = moment().tz("Asia/Taipei").format("YYYY-MM-DD");
  const checkinDate_moment = moment(startDate);
  const duration = checkinDate_moment.diff(today_date_moment, "days");
  if (duration >= houseData.refund_duration) {
    is_refund = 1;
    //計算取消期限的日期
    let dueDate = moment(startDate)
      .subtract(houseData.refund_duration, "days")
      .format("YYYY-MM-DD");
    let dueDate_ISO = covertToISOtime(dueDate);
    refund_duedate = moment(dueDate_ISO).format("YYYY-MM-DD HH:mm:ss");
    refund_duedate_timestamp = moment(dueDate_ISO).valueOf();
    return refund_duedate

    // //render data
    // let clone = $("#feature_con").clone().appendTo($("#feature_outter"));
    // clone.find("img").attr("src", "./images/calendar.png");
    // clone
    //   .find("h4")
    //   .text(
    //     `入住${houseData.refund_duration}天(${refund_duedate})前可免費取消`
    //   );
    // clone.removeAttr("style");
  }else{
    return null
  }
}
function renderDueTime(refund_duedate){

  //render data
  let clone = $("#feature_con").clone().appendTo($("#feature_outter"));
  clone.attr('data-type', 'price');
  clone.find("img").attr("src", "./images/calendar.png");
  clone
    .find("h4")
    .text(
      `入住${houseData.refund_duration}天(${refund_duedate})前可免費取消`
    );
  clone.removeAttr("style");
}
function computeRoomPrice(startDate, endDate){
  const day1 = moment(startDate, "YYYY-MM-DD");
  const day2 = moment(endDate, "YYYY-MM-DD");
  const durationDays = moment.duration(day2.diff(day1)).asDays();
  roomfee = houseData.price * durationDays;
  cleanFee = Math.floor((roomfee * houseData.cleanfee_percentage) / 100);
  taxFee = Math.floor((roomfee * houseData.tax_percentage) / 100);
  amountFee = roomfee + cleanFee + taxFee;
  $("#room_fee_title").text(`訂房費 (${durationDays}晚)`);
  $("#room_fee").text(`${roomfee} TWD`);
  $("#clean_fee").text(`${cleanFee} TWD`);
  $("#tax_fee").text(`${taxFee} TWD`);
  $("#amount_fee").text(`${amountFee} TWD`);
}

async function rederData() {
  let detailData = await fetch(`/api/1.0/houses/detail/${house_id}`);
  detailData = await detailData.json();
  houseData = detailData.house;
  let amenityData = detailData.amenity;
  let reviewData = detailData.review;
  let reviewCount = reviewData.length;
  let landLordRate = detailData.landLordRate;
  landlord_id = houseData.landlord_id;


  house_lat = houseData.latitude;
  house_lon = houseData.longitude;
  //title area
  $("#house_title").text(houseData.title);

  if (!(reviewData.length === 0)) {
    $("#room_rate").text(reviewData[0].house_ave);
    $("#comment_count").text(`${reviewCount}則評價`);
  } else {
    $("#room_rate").text("暫無評分");
    $("#comment_count").text(`0則評價`);
  }

  $("#city_region").text(`${houseData.city_name}、${houseData.region}`);
  $("#house_config").text(
    `${houseData.category_name}-${houseData.people_count}位.${houseData.room_count}間臥室.${houseData.bed_count}張床.${houseData.bathroom_count}間衛浴`
  );
  //images area
  $("#image1").attr("src", houseData.image_url);
  $("#image2").attr("src", houseData.sideImages_url[0]);
  $("#image3").attr("src", houseData.sideImages_url[1]);
  //feature area
  if (landLordRate.length !== 0 && landLordRate[0].ave_landload_rate > 4.5) {
    let clone = $("#feature_con").clone().appendTo($("#feature_outter"));
    clone.find("img").attr("src", "./images/landlord.png");
    clone.find("h4").text(`${houseData.landlord_name}是超讚房東`);
    clone.removeAttr("style");
    hasFeature += 1;
  }
  if (houseData.refund_type === 1 && startDate !== '' && startDate !== null) {
    const deuTimeComputed = computeDueTime(startDate);
    if(deuTimeComputed !== null){
      hasFeature += 1;
      renderDueTime(deuTimeComputed);
    }
    // //計算離入住前剩餘幾天
    // const today_date_moment = moment().tz("Asia/Taipei").format("YYYY-MM-DD");
    // const checkinDate_moment = moment(startDate);
    // const duration = checkinDate_moment.diff(today_date_moment, "days");
    // if (duration >= houseData.refund_duration) {
    //   is_refund = 1;
    //   hasFeature = true;
    //   //計算取消期限的日期
    //   let dueDate = moment(startDate)
    //     .subtract(houseData.refund_duration, "days")
    //     .format("YYYY-MM-DD");
    //   let dueDate_ISO = covertToISOtime(dueDate);
    //   refund_duedate = moment(dueDate_ISO).format("YYYY-MM-DD HH:mm:ss");
    //   refund_duedate_timestamp = moment(dueDate_ISO).valueOf();

    //   //render data
    //   let clone = $("#feature_con").clone().appendTo($("#feature_outter"));
    //   clone.find("img").attr("src", "./images/calendar.png");
    //   clone
    //     .find("h4")
    //     .text(
    //       `入住${houseData.refund_duration}天(${refund_duedate})前可免費取消`
    //     );
    //   clone.removeAttr("style");
    // }
  }
  // if (houseData.refund_type === 2) {
  //   is_refund = 2;
  //   refund_duedate = houseData.refund_duration;
  //   let clone = $("#feature_con").clone().appendTo($("#feature_outter"));
  //   clone.find("img").attr("src", "./images/calendar.png");
  //   clone.find("h4").text(`${houseData.refund_duration}小時內可免費取消`);
  //   clone.removeAttr("style");
  // }

  if(hasFeature === 0){
    $('#feature_outter').attr('style', 'display: none;');
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
  $("#fee_perNight").text(`$${houseData.price} TWD／晚`);
  if (startDate !== "" && endDate !== "" && startDate !== null && endDate !== null) {
    $("#checkin_date").val(startDate);
    $("#checkout_date").val(endDate);
    computeRoomPrice(startDate, endDate);
    // const day1 = moment(startDate, "YYYY-MM-DD");
    // const day2 = moment(endDate, "YYYY-MM-DD");
    // const durationDays = moment.duration(day2.diff(day1)).asDays();
    // roomfee = houseData.price * durationDays;
    // cleanFee = Math.floor((roomfee * houseData.cleanfee_percentage) / 100);
    // taxFee = Math.floor((roomfee * houseData.tax_percentage) / 100);
    // amountFee = roomfee + cleanFee + taxFee;
    // // $("#fee_perNight").text(`$${houseData.price} TWD／晚`);
    // $("#room_fee_title").text(`訂房費 (${durationDays}晚)`);
    // $("#room_fee").text(`${roomfee} TWD`);
    // $("#clean_fee").text(`${cleanFee} TWD`);
    // $("#tax_fee").text(`${taxFee} TWD`);
    // $("#amount_fee").text(`${amountFee} TWD`);
  }
  //comment area

  if (!(reviewData.length === 0)) {
    $("#comment_summary>h2").text(
      `${reviewData[0].house_ave} (${reviewCount}則評價)`
    );
    reviewData.forEach((review) => {
      let clone = $("#comment_item").clone().appendTo($("#comment_con"));
      clone.find("h4").text(review.renter_name);
      let comment_date = parseInt(review.created_at);
      comment_date = moment(comment_date)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD HH:MM:SS");
      clone.find("small").text(comment_date);
      clone.find("p").text(review.comment);
      clone.removeAttr("style");
    });
  } else {
    $("#comment_summary>h2").text(`暫無評價`);
    // $("<div>無</div>").appendTo($("#comment_con"));
  }

  //landlord area
  let landlord_rating;
  ////// show rating for landlord
  $("#landlord_outter>h2").text(`房東:${houseData.landlord_name}`);
  if (landLordRate.length !== 0) {
    $("#landlord_outter>p").text(`評分: ${landLordRate[0].ave_landload_rate}`);
    landlord_rating = landLordRate[0].ave_landload_rate;
  } else {
    $("#landlord_outter>p").text("暫無評分");
    landlord_rating = 0;
  }

  ////// set rating star
  raterJs( {
    element:document.querySelector("#landlordRater"),
    // the number of stars
    max: 5,
    // star size
    starSize: 24,
    // is readonly?
    readOnly: true,
    rating: landlord_rating,
    rateCallback:function rateCallback(rating, done) {
      this.setRating(rating); 
      done(); 
    }
  });

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
    if (markers.length !== 0) {
      for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    }
    for (var i = 0; i < nearbyLocations.length; i++) {
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

async function gotoCheckout() {
  
  //確認user是否有登入
  if(renter_id){
    //確認是否有選擇住宿日期
    if($(checkout_date).val() === ''){
      alert("請選擇住宿日期");
      return
    }
    //確認user是不是房東
    if(renter_id === landlord_id){
      alert("您為此間房源的房東，無法預定");
      return
    }
    //確認user是否在blacklist中
    const blacklistRes = await fetch(`/api/1.0/users/checkUserBlacklist?landlord_id=${landlord_id}&renter_id=${renter_id}`);
    const blacklistcheck = await blacklistRes.json();
    if(blacklistcheck.inlist === false){
      window.location.href = `/checkout.html?id=${house_id}&startDate=${startDate}&endDate=${endDate}&roomfee=${roomfee}&cleanFee=${cleanFee}&taxFee=${taxFee}&amountFee=${amountFee}&people_count=${people_count}&refund_type=${is_refund}&refund_duedate=${refund_duedate}&refund_duedate_timestamp=${refund_duedate_timestamp}`;
    }else{
      alert("已被房東加入黑名單，無法預定");
      window.location.href = "/";
    }
    
  }else{
    alert("請先登入");
  }
  
}

//datepicker for checkout form
async function datepicker_booked() {
  let dateRange = [];
  let bookedDateRes = await fetch(`/api/1.0/houses/bookedDate?id=${house_id}`);
  let bookedDate = await bookedDateRes.json();
 
  if (bookedDateRes.status === 200) {
    if (bookedDate.length === 0) {
      dateRange = [];
    } else {
      bookedDate = bookedDate[0];
      const { checkindate_list, checkoutdate_list } = bookedDate;
      const newcheckoutdate_list = checkoutdate_list.map((date) => {
        return moment(date).subtract(1, "days").format("YYYY-MM-DD");
      });

      for (let i = 0; i < checkindate_list.length; i++) {
        for (
          let d = moment(checkindate_list[i]).toDate();
          d <= moment(newcheckoutdate_list[i]).toDate();
          d.setDate(d.getDate() + 1)
        ) {
          dateRange.push($.datepicker.formatDate("yy-mm-dd", d));
        }
      }
    }

    (from = $("#checkin_date")
      .datepicker({
        defaultDate: "+1w",
        dateFormat: "yy-mm-dd",
        changeMonth: true,
        numberOfMonths: 1,
        minDate: 0,
        beforeShowDay: function (date) {
          var dateString = jQuery.datepicker.formatDate("yy-mm-dd", date);
          return [dateRange.indexOf(dateString) == -1];
        },
      })
      .on("change", function () {
        var currentDate = from.datepicker("getDate");
        var nextDate = new Date(currentDate.valueOf() + 1000 * 3600 * 24);
        to.datepicker("option", "minDate", nextDate);
      })
      .on("click", function () {
        $("#checkout_date").val("");
      })),
      (to = $("#checkout_date").datepicker({
        defaultDate: "+1w",
        dateFormat: "yy-mm-dd",
        changeMonth: true,
        numberOfMonths: 1,
        minDate: "+1d",
        beforeShowDay: function (date) {
          var dateString = jQuery.datepicker.formatDate("yy-mm-dd", date);
          return [dateRange.indexOf(dateString) == -1];
        },
      }));
  }
}

datepicker_booked();

//update price when user pick date
$("#checkout_date").change(updatePrice);

function updatePrice() {

  startDate = $("#checkin_date").val();
  endDate = $("#checkout_date").val();
  computeRoomPrice(startDate, endDate);
  // const day1 = moment(startDate, "YYYY-MM-DD");
  // const day2 = moment(endDate, "YYYY-MM-DD");
  // const durationDays = moment.duration(day2.diff(day1)).asDays();
  // roomfee = houseData.price * durationDays;
  // cleanFee = Math.floor((roomfee * houseData.cleanfee_percentage) / 100);
  // taxFee = Math.floor((roomfee * houseData.tax_percentage) / 100);
  // amountFee = roomfee + cleanFee + taxFee;
  // $("#room_fee_title").text(`訂房費 (${durationDays}晚)`);
  // $("#room_fee").text(`${roomfee} TWD`);
  // $("#clean_fee").text(`${cleanFee} TWD`);
  // $("#tax_fee").text(`${taxFee} TWD`);
  // $("#amount_fee").text(`${amountFee} TWD`);

  //計算dueTime
  if (houseData.refund_type === 1){
    const deuTimeComputed = computeDueTime(startDate);

    //更新後有取消政策
    if(deuTimeComputed !== null){
      if($('div[data-type=price]')[0] !== undefined){
        //condition1 原本已有取消政策
        $('div[data-type=price]>h4').text(`入住${houseData.refund_duration}天(${deuTimeComputed})前可免費取消`)
      }else{
        //condition2 原本沒取消政策
        if(hasFeature === 0){
          //先把feature title顯示出來
          $('#feature_outter').removeAttr('style')
          hasFeature += 1;
        }
        renderDueTime(deuTimeComputed)
      }
    }else{
      //更新後沒取消政策
      if($('div[data-type=price]')[0] !== undefined){
        //但原本有
        $('div[data-type=price]')[0].outerHTML=''; //清空refund feature
        
        is_refund = 0;   //清空與取消政策有關變數
        refund_duedate = undefined;
        refund_duedate_timestamp = undefined; 
        if(hasFeature === 1){
          //原本只有refund這個feature
          $('#feature_outter').attr('style', 'display: none;');  //feature title隱藏
        }
        hasFeature -= 1;
      }
    }
  }
  
}
