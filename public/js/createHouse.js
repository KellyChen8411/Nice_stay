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
