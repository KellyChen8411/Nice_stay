//config area (count)
$("#config_con").click(changeConfigCount);

function changeConfigCount(e) {
  if (e.target.innerHTML === "+") {
    let inputElement = $(`#count_${e.target.dataset.type}`);
    let newValue = parseInt(inputElement.val()) + 1;
    inputElement.val(newValue);
  } else if (e.target.innerHTML === "-") {
    let inputElement = $(`#count_${e.target.dataset.type}`);
    if (inputElement.val() > 1) {
      let newValue = parseInt(inputElement.val()) - 1;
      inputElement.val(newValue);
    }
  }
}

//price area
$(function () {
  $("#price_slider").slider({
    value: 300,
    min: 300,
    max: 100000,
    step: 1,
    slide: function (event, ui) {
      $("#room_price").val("$" + ui.value);
    },
  });
  $("#room_price").val("$" + $("#price_slider").slider("value"));
});

$(function () {
  $("#tax_slider").slider({
    value: 0,
    min: 0,
    max: 15,
    step: 1,
    slide: function (event, ui) {
      $("#tax_fee").val(ui.value + "%");
    },
  });
  $("#tax_fee").val($("#tax_slider").slider("value") + "%");
});

$(function () {
  $("#clean_slider").slider({
    value: 0,
    min: 0,
    max: 10,
    step: 1,
    slide: function (event, ui) {
      $("#clean_fee").val(ui.value + "%");
    },
  });
  $("#clean_fee").val($("#clean_slider").slider("value") + "%");
});

//facility area
let facilityCon = $("#facility_outer");

facilityCon.click(checkFacility);

function checkFacility(e) {
  if (e.target.nodeName === "H4" || e.target.nodeName === "IMG") {
    let facilityCon = e.target.parentElement;
    const amenity_id = parseInt(facilityCon.dataset.id);
    if (!facilityList.has(amenity_id)) {
      facilityList.set(amenity_id, "selected");
      facilityCon.classList.toggle("clickFacility");
    } else {
      facilityList.delete(amenity_id);
      facilityCon.classList.toggle("clickFacility");
    }
  }
}

//refund

$(document).on("click", "input[name=refund_type]", alertStatus);

function alertStatus() {
  if ($("#enableRefund").is(":checked")) {
    $("#refundDuration_con").toggleClass("disabled", false);
  }
  if ($("#disableRefund").is(":checked")) {
    $("#refund_duration").val("");
    $("#refundDuration_con").toggleClass("disabled", true);
  }
}

//送出建立資料

let submitForm = $("#submitForm");

submitForm.submit(createHouse);

async function createHouse(e) {
  //等待畫面
  $.blockUI({
    message: "房源建立中，請稍後",
    css: {
      border: "none",
      padding: "20px",
      opacity: 0.7,
      "-webkit-border-radius": "40px",
      backgroundColor: "#b3225c",
      color: "#fff",
    },
  });

  e.preventDefault();
  let data = new FormData(submitForm[0]);
  //check facility
  data.append("amenity", JSON.stringify([...facilityList.keys()]));
  //clean unit for price
  data.set("price", data.get("price").slice(1));
  data.set("tax_percentage", data.get("tax_percentage").slice(0, -1));
  data.set("cleanfee_percentage", data.get("cleanfee_percentage").slice(0, -1));
  //send data
  let URL = "/api/1.0/houses/create";
  let token = localStorage.getItem("token");
  let headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  //transfer address to geolocation
  //concate address
  let city_id = data.get("city_id");
  let city = $("#city")[0].options[city_id].text;
  let address = `${city}市${data.get("region")}區${data.get("address")}`;
  data.set("address", address);
  let geocoder = new google.maps.Geocoder();
  geocoder.geocode(
    {
      address: address,
      componentRestrictions: {
        country: "TW",
      },
    },
    async function (results, status) {
      if (status == "OK") {
        //get geolocation infomation
        data.append("latitude", results[0].geometry.location.lat());
        data.append("longitude", results[0].geometry.location.lng());

        //create house
        let featchResponse = await fetch(URL, {
          method: "POST",
          headers,
          body: data,
        });
        let fetchStatus = featchResponse.status;
        let finalResult = await featchResponse.json();
        $.unblockUI();
        if (fetchStatus === 200) {
          alert(`建立成功，您的房源編號是${finalResult.house_id}`);
          if (user_role === 2) {
            window.location.href = "/admin/manageHouse.html";
          } else if (user_role === 1) {
            //update user role to landlord
            const userInfo = JSON.stringify({ user_id });
            const newTokenRes = await fetch(`/api/1.0/users/updateUserRole`, {
              method: "GET",
              headers,
            });
            const newtokenResult = await newTokenRes.json();
            console.log(newtokenResult);
            if (newTokenRes.status === 200) {
              localStorage.setItem("token", newtokenResult.new_token);
            }
            window.location.href = "/admin/manageHouse.html";
          }
        } else if (fetchStatus === 401) {
          alert(`${finalResult.error}`);
          window.location.href = "/login.html";
        } else if (fetchStatus === 400) {
          let errorArray = finalResult.error;
          let errorMsgString = "";
          errorArray.forEach((errMsg) => {
            errorMsgString += `${errMsg.msg}\n`;
          });
          alert(errorMsgString);
        } else {
          alert(`${finalResult.error}`);
        }
      } else {
        $.unblockUI();
        alert("地址不夠精確，請重新輸入!");
      }
    }
  );
}

//送出編輯資料

$("#edit_btn").click(sendEditData);

async function sendEditData(e) {
  let lackOfUpload = false;
  e.preventDefault();

  //確認被刪除的照片是否上傳
  let deleteImgIndex = Object.keys(deleteImgList);
  deleteImgIndex.forEach((imgindex, index) => {
    imgindex = parseInt(imgindex);
    let uploadNewImg = $(`#file-upload-input${imgindex}`)[0].files;
    if (uploadNewImg.length === 0) {
      alert(`請上傳第${imgindex + 1}張照片`);
      lackOfUpload = true;
    }
  });

  if (lackOfUpload === false) {
    let data = new FormData(submitForm[0]);
    data.append("deleteImg", JSON.stringify(deleteImgList));
    data.append("amenity", JSON.stringify([...facilityList.keys()]));
    //clean unit for price
    data.set("price", data.get("price").slice(1));
    data.set("tax_percentage", data.get("tax_percentage").slice(0, -1));
    data.set(
      "cleanfee_percentage",
      data.get("cleanfee_percentage").slice(0, -1)
    );

    //等待畫面
    $.blockUI({
      message: "房源編輯中，請稍後",
      css: {
        border: "none",
        padding: "20px",
        opacity: 0.7,
        "-webkit-border-radius": "40px",
        backgroundColor: "#b3225c",
        color: "#fff",
      },
    });

    let URL = `/api/1.0/houses/updateHouse?id=${house_id}`;
    let featchResponse = await fetch(URL, {
      method: "PATCH",
      body: data,
    });
    let fetchStatus = featchResponse.status;
    let fetchData = await featchResponse.json();
    $.unblockUI();
    if (fetchStatus === 200) {
      alert("編輯成功");
      window.location.href = "/admin/manageHouse.html";
    } else {
      alert(`編輯失敗,原因: ${fetchData.error}`);
      window.location.href = "/admin/manageHouse.html";
    }
  }
}

//取消建立或編輯
$("#cancel_con").click(cancelCU);

function cancelCU() {
  let userDecision = confirm("確定取消？");
  if (userDecision) {
    if (user_role === 1) {
      window.location.href = "/";
    } else if (user_role === 2) {
      window.location.href = "/admin/manageHouse.html";
    }
  }
}
