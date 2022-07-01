let renter_id;

let token = localStorage.getItem("token");
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};
async function checkForLogin() {
  const resultFetch = await fetch("/api/1.0/users/checkLogin", { headers });
  const finalResult = await resultFetch.json();
  if (resultFetch.status === 200) {
    $("#logoutBtn").toggleClass("DSHide", false); //remove class
    $("#loginBtn").toggleClass("DSHide", true); //add class
    $("#logoutBtn").click(Logout);
    if (finalResult.role === 2) {
      $("#landlordContainer").text("切換至出租模式");
    }

    //fetch trip data
    renter_id = finalResult.id;
    const tripsRes = await fetch(`/api/1.0/houses/trip`, { headers });
    const trips = await tripsRes.json();
    const today = moment().tz("Asia/Taipei").format("YYYY-MM-DD");

    let now_trip = []; //type 0
    let future_trip = []; //type 1
    let past_trip = []; //type 2
    let cancel_trip = []; //type 3
    let buttonName = ["連絡房東", "取消預定", "留下評價", "重新預定"];

    trips.forEach((trip, index) => {
      if (trip.is_refund === 0) {
        if (
          moment(trip.checkin_date).isBefore(today) &&
          moment(trip.checkout_date).isSameOrBefore(today)
        ) {
          past_trip.push(index);
        } else if (moment(trip.checkin_date).isAfter(today)) {
          future_trip.push(index);
        } else {
          now_trip.push(index);
        }
      } else {
        cancel_trip.push(index);
      }
    });

    let trip_inner = $("#trip_inner");

    //顯示預定
    if (
      now_trip.length === 0 &&
      future_trip.length === 0 &&
      past_trip.length === 0
    ) {
      $("<h2>暫無預定</h2>").appendTo(trip_inner);
      $("footer").toggleClass("footerFix", true);
    } else {
      if (now_trip.length !== 0) {
        $("<h2>正在進行中的旅程</h2>").appendTo(trip_inner);
        now_trip.forEach((tripIndex) => {
          let trip = trips[tripIndex];
          renderTrip(trip, 0, buttonName);
        });
      }

      if (future_trip.length != 0) {
        $("<h2>即將到來的旅程</h2>").appendTo(trip_inner);
        future_trip.forEach((tripIndex) => {
          let trip = trips[tripIndex];
          renderTrip(trip, 1, buttonName);
        });
      }

      if (past_trip.length != 0) {
        $("<h2>已結束的旅程</h2>").appendTo(trip_inner);
        past_trip.forEach((tripIndex) => {
          let trip = trips[tripIndex];
          console.log(trip);
          renderTrip(trip, 2, buttonName);
        });
      }
    }

    //顯示取消旅程
    if (cancel_trip.length !== 0) {
      $("<h2>已取消的旅程</h2>").appendTo(trip_inner);
      cancel_trip.forEach((tripIndex) => {
        let trip = trips[tripIndex];
        console.log(trip);
        renderTrip(trip, 3, buttonName);
      });
    }
  } else {
    alert("請先登入");
    window.location.href = "/login.html";
  }
}

checkForLogin();

function Logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

function renderTrip(trip, type, buttonName) {
  let clone = $("#trip_con").clone().appendTo(trip_inner);
  clone.find("img").attr("src", trip.image_url);
  clone.find("h4").text(`${trip.city_name} ${trip.title}`);
  clone.find("h4").attr("id", `houseName${trip.house_id}`);
  clone.find("p:nth-child(2)").text(`房東: ${trip.landloard_name}`);
  clone.find("p:nth-child(2)").attr("id", `landLordName${trip.house_id}`);
  clone
    .find("p:nth-child(3)")
    .text(`${trip.checkin_date} 至 ${trip.checkout_date}`);
  if (type === 1) {
    if (trip.refund_duetime !== null) {
      let dueTime = parseInt(trip.refund_duetime);
      let transformDueDate = moment(dueTime).format("YYYY-MM-DD HH:mm:ss");
      clone.find("p:nth-child(4)").text(`取消期限: ${transformDueDate}前`);
    }
  }
  clone.find("button").text(buttonName[type]);
  clone.find("button").attr("data-bookingid", trip.booking_id);
  clone.find("button").attr("data-houseid", trip.house_id);
  // clone.find("button").attr("data-landlordid", trip.landlord_id);
  clone.removeAttr("style");
}

//button function
$("#trip_inner").click(buttonAction);

async function buttonAction(e) {
  if (e.target.nodeName === "BUTTON") {
    let buttonType = e.target.innerText;
    let booking_id = e.target.dataset.bookingid;
    let house_id = e.target.dataset.houseid;
    // let landlord_id = e.target.dataset.landlordid;

    if (buttonType === "取消預定") {
      let requestCancelTime = moment().valueOf();
      let fetchRes = await fetch(
        `/api/1.0/houses/checkRefund?booking_id=${booking_id}&requestCancelTime=${requestCancelTime}`
      );
      let fetchStatus = fetchRes.status;
      let finalData = await fetchRes.json();
      if (fetchStatus === 200) {
        if (finalData.cancel === true) {
          alert("取消成功");
          window.location.href = "/trip.html";
        } else {
          alert("無法取消");
        }
      } else {
        alert("Internal server error");
      }
    } else if (buttonType === "留下評價") {
      let houseInfo = $(`#houseName${house_id}`).text();
      let landlordInfo = $(`#landLordName${house_id}`).text();
      $("#submitForm").attr("data-bookingid", booking_id);
      $("#review_house").text(houseInfo);
      $("#review_landlord").text(landlordInfo);
      modal.style.display = "block";

      // $('#review_outter').toggleClass("DSHide", false);
      // let widthPosition = e.target.getBoundingClientRect().left + 200;
      // let scrollHeight = $(window).scrollTop() + 100;
      // console.log(e.target.getBoundingClientRect().left)
      // $('#review_outter').attr("style", `top: ${scrollHeight}px; left:${widthPosition}px`)
    } else if (buttonType === "重新預定") {
      window.location.href = `/detail.html?id=${house_id}`;
    }
  }
}

let landLordRating = raterJs({
  element: document.querySelector("#rater_landlord"),
  showToolTip: true,
  max: 5,
  starSize: 16,
  disableText: "Thank you for your vote!",
  ratingText: "{rating}",
  step: 0.5,
  rateCallback: function rateCallback(rating, done) {
    this.setRating(rating);
    done();
  },
});

let houseRating = raterJs({
  element: document.querySelector("#rater_house"),
  showToolTip: true,
  max: 5,
  starSize: 16,
  disableText: "Thank you for your vote!",
  ratingText: "{rating}",
  step: 0.5,
  rateCallback: function rateCallback(rating, done) {
    this.setRating(rating);
    done();
  },
});

//送出評價
let submitForm = $("#submitForm");

submitForm.submit(sendReview);

async function sendReview(e) {
  e.preventDefault();
  // let reviewInfo = {
  //   house_id: e.target.dataset.houseid,
  //   landlord_id:
  // }
  let landlord_rate = landLordRating.getRating();
  let house_rate = houseRating.getRating();
  if (landlord_rate === null || house_rate === null) {
    alert("請填寫完整!");
  } else if ($("textarea").val().length > 200) {
    alert("評論超過字數限制");
  } else {
    //left review
    let review_info = {
      booking_id: e.target.dataset.bookingid,
      comment: $("textarea").val(),
      house_rate,
      landlord_rate,
      created_at: Date.now(),
    };

    console.log(review_info);
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    let resultFetch = await fetch("/api/1.0/houses/review", {
      method: "POST",
      headers,
      body: JSON.stringify(review_info),
    });
    let fetchStatus = resultFetch.status;
    if (fetchStatus === 200) {
      alert("評論成功");
      //清空並關閉表單
      modal.style.display = "none";
      clearReviewWindow();
    } else {
      alert("已留過評論");
      //清空並關閉表單
      modal.style.display = "none";
      clearReviewWindow();
    }
  }
}

//////////////////////for review window////////////////////////

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
// var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
  clearReviewWindow();
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    clearReviewWindow();
  }
};

function clearReviewWindow() {
  landLordRating.clear();
  houseRating.clear();
  $("textarea").val("");
}
