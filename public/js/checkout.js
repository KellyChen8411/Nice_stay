const params = new URLSearchParams(window.location.search);
let startDate = params.get("startDate");
let endDate = params.get("endDate");
let roomfee = params.get("roomfee");
let cleanFee = params.get("cleanFee");
let taxFee = params.get("taxFee");
let amountFee = params.get("amountFee");
let people_count = params.get("people_count");
let is_refund = params.get("is_refund");
let refund_duedate = params.get("refund_duedate");

//預定詳情
if (people_count === "") {
  $("#people_count").text("1位旅客");
} else {
  $("#people_count").text(`${people_count}位旅客`);
}
$("#checkin_date").val(startDate);
$("#checkout_date").val(endDate);
$("#room_fee").text(`${roomfee} TWD`);
$("#clean_fee").text(`${cleanFee} TWD`);
$("#tax_fee").text(`${taxFee} TWD`);
$("#amount_fee").text(`${amountFee} TWD`);

//退訂政策
if (is_refund === "1") {
  $("#cancel_plan").text(`${refund_duedate}前可免費取消`);
} else if (is_refund === "2") {
  $("#cancel_plan").text(`${refund_duedate}小時內可免費取消`);
} else {
  $("#cancel_plan").text("無");
}
