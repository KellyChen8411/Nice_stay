$("#landlordContainer").click(toLandlordPage);

function toLandlordPage() {
  console.log("enter");
  if ($("#landlordContainer").text().trim() === "成為房東" && token !== null) {
    window.location.href = "/admin/createHouse.html";
  } else if ($("#landlordContainer").text().trim() === "切換至出租模式") {
    window.location.href = "/admin/manageHouse.html";
  } else {
    alert("請先登入");
  }
}
