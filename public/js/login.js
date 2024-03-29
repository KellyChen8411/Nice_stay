const params = new URLSearchParams(window.location.search);
let checkout = params.get("checkout");
let demo = params.get("demo");

let submitForm = $("#submitform");
$("#SignIn_btn").click(showSignInForm);
$("#SignUp_btn").click(showSignUpForm);

//select signin
function showSignInForm() {
  $("#SignIn_btn").toggleClass("btnClick", true); //add class
  $("#SignUp_btn").toggleClass("btnClick", false); //remove class
  $("#signin_content").toggleClass("hide", false); //remove class
  $("#signup_content").toggleClass("hide", true); //add class
  $("#title").text("Sign in");
  submitForm.attr("data-type", "signin");
}

//select signup
function showSignUpForm() {
  $("#SignUp_btn").toggleClass("btnClick", true); //add class
  $("#SignIn_btn").toggleClass("btnClick", false); //remove class
  $("#signup_content").toggleClass("hide", false); //remove class
  $("#signin_content").toggleClass("hide", true); //add class
  $("#title").text("Sign up");
  submitForm.attr("data-type", "signup");
}

submitForm.submit(getToken);

async function getToken(e) {
  e.preventDefault();
  let actionType = e.target.dataset.type;

  let data = new FormData(submitForm[0]);
  let URL;
  if (actionType === "signin") {
    URL = "/api/1.0/users/signin";
  } else if (actionType === "signup") {
    URL = "/api/1.0/users/signup";
  }
  const req = new Request(URL, { method: "POST", body: data });
  let fetchResult = await fetch(req);
  let finalResult = await fetchResult.json();
  let fetchStatus = fetchResult.status;
  if (fetchStatus === 200) {
    localStorage.setItem("token", finalResult.token);
    if (checkout === "true") {
      window.history.go(-1);
    } else {
      window.location.href = "/";
    }
  } else if (fetchStatus === 400) {
    let errorArray = finalResult.error;
    let errorMsgString = "";
    errorArray.forEach((errMsg) => {
      errorMsgString += `${errMsg.msg}\n`;
    });
    alert(errorMsgString);
  } else {
    alert(finalResult.error);
  }
}

//for demo
if (demo === "host") {
  $("input[name=signin_email]").val("demo_host@test.com");
  $("input[name=signin_password]").val("123456");
} else if (demo === "guest") {
  $("input[name=signin_email]").val("demo_guest@test.com");
  $("input[name=signin_password]").val("123456");
}
