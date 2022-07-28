let token = localStorage.getItem("token");

let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

/////////////log out function
function Logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

async function renderHouse() {
  const housesRes = await fetch("/api/1.0/houses/landlordHouse", { headers });
  const fetchStatus = housesRes.status;
  const houses = await housesRes.json();

  if (fetchStatus === 200) {
    //切換登入登出鍵
    $("#logoutBtn").toggleClass("DSHide", false); //remove class
    $("#loginBtn").toggleClass("DSHide", true); //add class
    $("#logoutBtn").click(Logout);
    if (houses.length !== 0) {
      $("#managehouse_title").text("您擁有的房源");
      houses.forEach((house) => {
        renderData(house);
      });
    } else {
      $("#trip_outter").attr("style", "padding-top: 70px;");
      $("#noresult_outer").removeAttr("style");
    }
  } else {
    alert(houses.error);
    window.location.href = "/";
  }
}

renderHouse();

function renderData(house) {
  let create_time = JSON.parse(house.created_at);
  create_time = moment(create_time)
    .tz("Asia/Taipei")
    .format("YYYY-MM-DD HH:mm:ss");
  let update_time = JSON.parse(house.updated_at);
  update_time = moment(update_time)
    .tz("Asia/Taipei")
    .format("YYYY-MM-DD HH:mm:ss");

  let clone = $("#trip_con").clone().appendTo(trip_inner);
  clone.find("img").attr("src", house.image_url);
  clone.find("h4").text(`${house.city_name} ${house.title}`);
  // clone.find("h4").attr('id', `houseName${house.house_id}`);
  clone
    .find("p:nth-child(2)")
    .text(
      `${house.people_count}位.${house.room_count}間臥室.${house.bed_count}張床.${house.bathroom_count}間衛浴`
    );
  // clone.find("p:nth-child(2)").attr('id', `landLordName${house.house_id}`);
  clone.find("p:nth-child(3)").text(`建立時間: ${create_time}`);
  clone.find("p:nth-child(4)").text(`最近更新時間: ${update_time}`);
  clone.find("button").attr("data-houseid", house.id);
  clone
    .find("a")
    .attr(
      "href",
      `/detail.html?id=${house.house_id}&startDate=&endDate=&people_count=`
    );
  clone.removeAttr("style");
}

//button function
$("#trip_inner").click(buttonAction);

async function buttonAction(e) {
  if (e.target.nodeName === "BUTTON") {
    let buttonType = e.target.innerText;
    // let booking_id = e.target.dataset.bookingid;
    let house_id = e.target.dataset.houseid;
    // let renter_id = e.target.dataset.renterid;

    if (buttonType === "編輯房源") {
      window.location.href = `/admin/createHouse.html?edit=${true}&id=${house_id}`;
    } else if (buttonType === "刪除房源") {
      const houseRes = await fetch(
        `/api/1.0/houses/houseHistroyData?id=${house_id}`,
        { headers }
      );
      const resStatus = houseRes.status;
      let house = await houseRes.json();
      if (resStatus === 200) {
        let userDecision = confirm("確定要刪除此房源?");
        if (userDecision == true) {
          //等待畫面
          $.blockUI({
            message: "房源刪除中，請稍後",
            css: {
              border: "none",
              padding: "20px",
              opacity: 0.7,
              "-webkit-border-radius": "40px",
              backgroundColor: "#b3225c",
              color: "#fff",
            },
          });

          const fetchRes = await fetch(
            `/api/1.0/houses/deleteHouse?id=${house_id}`,
            { method: "DELETE" }
          );

          const fetchStatus = fetchRes.status;
          const finalResult = await fetchRes.json();

          $.unblockUI();
          if (fetchStatus === 200) {
            alert("刪除成功");
            location.reload(); //重新整理頁面
          } else {
            alert(`刪除失敗,此房源仍有預定`);
          }
        }
      } else {
        $.unblockUI();
        alert(house.error);
      }
    }
  }
}
