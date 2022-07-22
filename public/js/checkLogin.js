let userFavoriteList; //存user收藏房源的全域變數
let renter_id; //存renter_id的全域變數

let token = localStorage.getItem("token");
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};
async function checkForLogin() {
  let URL;
  if (window.location.pathname === "/") {
    URL = `/api/1.0/users/checkLogin?updateToken=${true}`;
  } else {
    URL = `/api/1.0/users/checkLogin?updateToken=${false}`;
  }
  const resultFetch = await fetch(URL, { headers });
  const finalResult = await resultFetch.json();
  if (resultFetch.status === 200) {
    $("#logoutBtn").toggleClass("DSHide", false); //remove class
    $("#loginBtn").toggleClass("DSHide", true); //add class
    $(".menberItem").toggleClass("DSHide", false); //remove class for trip message and favorite
    $("#logoutBtn").click(Logout);

    if (finalResult.role === 2) {
      console.log($("#landlordContainer").text());
      $("#landlordContainer").text("切換至出租模式");
    }
    if (window.location.pathname === "/") {
      console.log("update token");
      //update token
      localStorage.setItem("token", finalResult.new_token);
    }
    renter_id = finalResult.user_id;
  }
}

checkForLogin();

function Logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}
