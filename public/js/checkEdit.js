const params = new URLSearchParams(window.location.search);
let isedit = params.get("edit");
let house_id = params.get("id");
let facilityList = new Map();
let deleteImgList = {};
let user_id;
let user_role;

let token = localStorage.getItem("token");

let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

if (isedit !== null) {
  alert("溫馨提醒: 除地址外的資訊皆可修改");
  getHistroyData(house_id);
}

async function getHistroyData(house_id) {
  const houseRes = await fetch(
    `/api/1.0/houses/houseHistroyData?id=${house_id}`,
    { headers }
  );
  const resStatus = houseRes.status;
  let house = await houseRes.json();
  if (resStatus === 200) {
    house = house[0];

    //變換表單送出按鈕
    $("#create_btn").attr("style", "display: none;");
    $("#edit_btn").removeAttr("style");

    //插入原始房源資料
    $("#title").val(house.title);
    $(`#category>option[value=${house.category_id}]`).attr(
      "selected",
      "selected"
    );
    $(`#city>option[value=${house.city_id}]`).attr("selected", "selected");
    $("#region").val(house.region);
    let address = house.address;
    address = address.substring(address.indexOf("區") + 1);
    $("#address").val(address);
    $("#description").val(house.description);
    $("#count_0").val(house.people_count);
    $("#count_1").val(house.bed_count);
    $("#count_2").val(house.room_count);
    $("#count_3").val(house.bathroom_count);

    //price
    $("#price_slider").slider({
      value: house.price,
      min: 300,
      max: 100000,
      step: 1,
      slide: function (event, ui) {
        $("#room_price").val("$" + ui.value);
      },
    });
    $("#room_price").val("$" + $("#price_slider").slider("value"));

    $("#tax_slider").slider({
      value: house.tax_percentage,
      min: 0,
      max: 15,
      step: 1,
      slide: function (event, ui) {
        $("#tax_fee").val(ui.value + "%");
      },
    });
    $("#tax_fee").val($("#tax_slider").slider("value") + "%");

    $("#clean_slider").slider({
      value: house.cleanfee_percentage,
      min: 0,
      max: 10,
      step: 1,
      slide: function (event, ui) {
        $("#clean_fee").val(ui.value + "%");
      },
    });
    $("#clean_fee").val($("#clean_slider").slider("value") + "%");

    if (house.refund_type === 1) {
      $("#refund_duration").val(house.refund_duration);
    } else {
      $("#disableRefund").attr("checked", "checked");
    }

    if (house.pet === 0) {
      $("#disablepet").attr("checked", "checked");
    }

    house.amenity_list.forEach((amenity_id) => {
      facilityList.set(amenity_id, "selected");
      let amenity_div = $(`div[data-id=${amenity_id}]`)[0];
      amenity_div.classList.toggle("clickFacility");
    });

    //image
    let imageURL_list = [house.image_url, ...house.sideimage_list];

    for (let i = 0; i < 3; i++) {
      $(`#image-upload-wrap${i}`).hide();

      $(`#file-upload-image${i}`).attr("src", imageURL_list[i]);
      $(`#file-upload-content${i}`).show();
      $(`#image-title${i}`).html("and Upload new image");
      $(`#removeImgBtn${i}`).attr("data-imgurl", imageURL_list[i]);
      $(`#removeImgBtn${i}`).attr("data-type", `edit`);
    }
  } else {
    alert(house.error);
  }
}

//get user id and role
$(async function () {
  const resultFetch = await fetch(
    `/api/1.0/users/checkLogin?updateToken=${true}`,
    { headers }
  );
  const finalResult = await resultFetch.json();
  if (resultFetch.status === 200) {
    user_id = finalResult.user_id;
    user_role = finalResult.role;
  }
});
