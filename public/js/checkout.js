const socket = io({ autoConnect: false });
$("html,body").scrollTop(0);

const params = new URLSearchParams(window.location.search);
let house_id = params.get("id");
let checkin_date = params.get("startDate");
let checkout_date = params.get("endDate");
let room_price = params.get("roomfee");
let clean_fee = params.get("cleanFee");
let tax_fee = params.get("taxFee");
let amount_fee = params.get("amountFee");
let people_count = params.get("people_count");
let refundable = params.get("refund_type");
let refund_duedate = params.get("refund_duedate");
let refund_duetime = params.get("refund_duedate_timestamp");

//預定詳情
if (people_count === "") {
  $("#people_count").text("1位旅客");
} else {
  $("#people_count").text(`${people_count}位旅客`);
}
$("#checkin_date").val(checkin_date);
$("#checkout_date").val(checkout_date);
$("#room_fee").text(`${room_price} TWD`);
$("#clean_fee").text(`${clean_fee} TWD`);
$("#tax_fee").text(`${tax_fee} TWD`);
$("#amount_fee").text(`${amount_fee} TWD`);

//退訂政策
if (refundable === "1") {
  $("#cancel_plan").text(`${refund_duedate}前可免費取消`);
} else {
  $("#cancel_plan").text("無");
}

$("#checkout_btn").click(checkOut);

async function checkOut() {
  //get messgae
  const message = $("#message").val();
  if (message === "") {
    alert("請輸入給房東訊息");
    return;
  }

  TPDirect.card.getPrime(async function (result) {
    if (result.status !== 0) {
      // console.err('getPrime error');
      alert("付款失敗");
      return;
    }
    let prime = result.card.prime;

    //get token and put in header
    let token = localStorage.getItem("token");
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    //get user input

    let bookoingInfo = {
      house_id,
      checkin_date,
      checkout_date,
      room_price,
      tax_fee,
      clean_fee,
      amount_fee,
      refundable,
      refund_duetime,
    };

    let data = { prime, bookoingInfo };

    data = JSON.stringify(data);
    let resultFetch = await fetch("/api/1.0/checkout/checkout", {
      method: "POST",
      headers,
      body: data,
    });

    let fetchStatus = resultFetch.status;
    let finalResult = await resultFetch.json();
    console.log(finalResult);
    if (fetchStatus === 200) {
      let sendEmailInfo = finalResult;
      sendEmailInfo = JSON.stringify(sendEmailInfo);
      // console.log('email')
      // console.log(sendEmailInfo);
      let headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      //寄送email
      let resultFetch = await fetch("/api/1.0/checkout/email", {
        method: "POST",
        headers,
        body: sendEmailInfo,
      });

      //傳訊息給房東
      //connect to socket
      socket.connect();
      let renter_id = finalResult.bookingInfo.renter_id;
      let renter_name = finalResult.renterInfo.name;
      let landlord_id = finalResult.bookingInfo.landlord_id;
      let created_at = Date.now();

      socket.emit(
        "privateMessageCancle",
        {
          content: message,
          owner_id: renter_id,
          owner_role: 1,
          talker_id: landlord_id,
          talker_role: 2,
          owner_name: renter_name,
          created_at,
        },
        (response) => {
          if (response === "ok") {
            alert(
              `您的預訂編號為${finalResult.orderNum}, 已將預訂詳情寄至您的email\n感謝預定`
            );
            window.location.href = "/trip.html";
          }
        }
      );
    } else {
      alert(finalResult.error);
      window.location.href = `/login.html?checkout=${true}`;
    }
  });
}
