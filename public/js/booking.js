let landlord_id;

let token = localStorage.getItem("token");

let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

async function renderBooking() {
  const tripsRes = await fetch("/api/1.0/houses/booking", { headers });
  const fetchStatus = tripsRes.status;
  const trips = await tripsRes.json();
  if (fetchStatus === 200) {
    //切換登入出鍵
    $("#logoutBtn").toggleClass("DSHide", false); //remove class
    $("#loginBtn").toggleClass("DSHide", true); //add class
    $("#logoutBtn").click(Logout);

    console.log(trips);
    //存landlord id
    if (trips.length === 0) {
      $("<h2>暫無預定</h2>").appendTo(trip_inner);
    } else {
      landlord_id = trips[0].landlord_id;

      //分類預定
      const today = moment().tz("Asia/Taipei").format("YYYY-MM-DD");
      let now_trip = []; //type 0
      let future_trip = []; //type 1
      let past_trip = []; //type 2
      let buttonName = ["連絡房客", "連絡房客", "加入黑名單"];

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
        }
      });

      //render預定
      let trip_inner = $("#trip_inner");
      if (
        now_trip.length === 0 &&
        future_trip.length === 0 &&
        past_trip.length === 0
      ) {
        $("<h2>暫無預定</h2>").appendTo(trip_inner);
        $("footer").toggleClass("footerFix", true);
      } else {
        if (now_trip.length !== 0) {
          $("<h2>正在進行中的預定</h2>").appendTo(trip_inner);
          now_trip.forEach((tripIndex) => {
            let trip = trips[tripIndex];
            renderTrip(trip, 0, buttonName);
          });
        }

        if (future_trip.length != 0) {
          $("<h2>即將到來的預定</h2>").appendTo(trip_inner);
          future_trip.forEach((tripIndex) => {
            let trip = trips[tripIndex];
            renderTrip(trip, 1, buttonName);
          });
        }

        if (past_trip.length != 0) {
          $("<h2>已結束的預定</h2>").appendTo(trip_inner);
          past_trip.forEach((tripIndex) => {
            let trip = trips[tripIndex];
            console.log(trip);
            renderTrip(trip, 2, buttonName);
          });
        }
      }
    }
  } else {
    alert(trips.error);
    window.location.href = "/";
  }
}

function Logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

renderBooking();

function renderTrip(trip, type, buttonName) {
  let clone = $("#trip_con").clone().appendTo(trip_inner);
  clone.find("img").attr("src", trip.image_url);
  clone.find("h4").text(`${trip.city_name} ${trip.title}`);
  clone.find("h4").attr("id", `houseName${trip.house_id}`);
  clone.find("p:nth-child(2)").text(`房客: ${trip.renter_name}`);
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
  clone.find("button").attr("data-renterid", trip.renter_id);
  clone.removeAttr("style");
}

//button function
$("#trip_inner").click(buttonAction);

async function buttonAction(e) {
  if (e.target.nodeName === "BUTTON") {
    let buttonType = e.target.innerText;
    let booking_id = e.target.dataset.bookingid;
    let house_id = e.target.dataset.houseid;
    let renter_id = e.target.dataset.renterid;

    if (buttonType === "加入黑名單") {
      let headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      let resultFetch = await fetch("/api/1.0/users/blacklist", {
        method: "POST",
        headers,
        body: JSON.stringify({ landlord_id, renter_id }),
      });
      let fetchStatus = resultFetch.status;
      if (fetchStatus === 200) {
        alert("請求成功");
      } else {
        alert("請求失敗");
      }
    }
  }
}
