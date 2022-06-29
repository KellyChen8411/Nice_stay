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
let facilityList = new Map();
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

//send data to server

let submitForm = $("#submitForm");

submitForm.submit(createHouse);

async function createHouse(e) {
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
        console.log(results.length);
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

        if (fetchStatus === 200) {
          console.log("succeed");
          alert(`建立成功，您的房源編號是${finalResult.house_id}`);
        } else if (fetchStatus === 404) {
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
        alert("地址不夠精確，請重新輸入!");
      }
    }
  );
}
