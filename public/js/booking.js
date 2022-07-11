let landlord_id;
let landloard_name;
let messageInfo = new Map();
let activeBooking;
let token = localStorage.getItem("token");

let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

//DOM element
let modalMsg = document.getElementById("myModal_msg");
let closeModal = document.getElementsByClassName("close_msg")[0];

/////////////log out function
function Logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

async function renderBooking() {
  const tripsRes = await fetch("/api/1.0/houses/booking", { headers });
  const fetchStatus = tripsRes.status;
  const trips = await tripsRes.json();
  if (fetchStatus === 200) {
    //切換登入出鍵
    $("#logoutBtn").toggleClass("DSHide", false); //remove class
    $("#loginBtn").toggleClass("DSHide", true); //add class
    $("#logoutBtn").click(Logout);

    //存landlord id
    if (trips.length === 0) {
      $("<h2>暫無預定</h2>").appendTo(trip_inner);
    } else {
      landlord_id = trips[0].landlord_id;
      landloard_name = trips[0].landloard_name;
      //分類預定
      const today = moment().tz("Asia/Taipei").format("YYYY-MM-DD");
      let now_trip = []; //type 0
      let future_trip = []; //type 1
      let past_trip = []; //type 2
      let buttonName = ["連絡房客", "連絡房客", "加入黑名單"];

      trips.forEach((trip, index) => {
        if (trip.is_refund === 0) {
          //蒐集需要發送訊息的資訊,以booking num當key
          messageInfo.set(trip.booking_id, {
            owner_id: trip.landlord_id,
            owner_role: 2,
            talker_id: trip.renter_id,
            talker_role: 1,
            owner_name: trip.landloard_name,
            renter_name: trip.renter_name,
          });
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
    // let house_id = e.target.dataset.houseid;
    let renter_id = e.target.dataset.renterid;

    if (buttonType === "加入黑名單") {
      let userDecision = confirm('確定將此user加入黑名單？');
      if(userDecision){
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
    } else if (buttonType === "連絡房客") {
      activeBooking = messageInfo.get(parseInt(booking_id));
      //open the modal
      $("#message_title").text(`傳訊息給${activeBooking.renter_name}`);
      modalMsg.style.display = "block";
    }
  }
}

//送出訊息
let messsage_btn = $("#messsage_btn");
messsage_btn.click(sendMessage);

function sendMessage() {
  const content = $("#message").val();
  if (content === "") {
    alert("請輸入訊息");
  } else {
    //發送訊息
    let { owner_id, owner_role, talker_id, talker_role, owner_name } =
      activeBooking;
    let created_at = Date.now();
    const socket = io();
    socket.emit("privateMessage", {
      content,
      owner_id,
      owner_role,
      talker_id,
      talker_role,
      owner_name,
      created_at,
    });
    modalMsg.style.display = "none";
    $("#message").val("");
  }
}

// When the user clicks on <span> (x), close the modal
closeModal.onclick = function () {
  modalMsg.style.display = "none";
  $("#message").val("");
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modalMsg) {
    modalMsg.style.display = "none";
    $("#message").val("");
  }
};
