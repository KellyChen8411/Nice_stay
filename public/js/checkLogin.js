let token = localStorage.getItem("token");
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};
async function checkForLogin() {
  const resultFetch = await fetch("/api/1.0/users/checkLogin", { headers });
  const finalResult = await resultFetch.json();
  if (resultFetch.status === 200) {
    $("#logoutBtn").toggleClass("DSHide", false); //remove class
    $("#loginBtn").toggleClass("DSHide", true); //add class
    $("#logoutBtn").click(Logout);
    if (finalResult.role === 2) {
      $("#landlordContainer").text("切換至出租模式");
    }
  }
}

checkForLogin();

function Logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}
