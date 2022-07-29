let token = localStorage.getItem("token");
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

$(async function () {
  const resultFetch = await fetch(
    `/api/1.0/users/checkLogin?updateToken=${false}`,
    { headers }
  );
  const finalResult = await resultFetch.json();

  if (resultFetch.status === 200) {
    if (finalResult.role === 2) {
      $("#landlordContainer").text("切換至出租模式");
    }

    //fetch house data
    const houseRes = await fetch(`/api/1.0/houses/favoriteDetail`, {
      headers,
    });
    const houses = await houseRes.json();
    if (houseRes.status === 200) {
      if (houses.length !== 0) {
        renderHouseData(houses);
      } else {
        $("#noresult_outer").removeAttr("style");
        $("#houseArea").attr("style", "margin: 0");
      }
    }
  } else {
    alert("請先登入");
    window.location.href = "/login.html";
  }
});

let houseArea_container = $("#houseArea");

function renderHouseData(datas) {
  datas.map((data) => {
    var clone = $("#houseItem").clone().appendTo(houseArea_container);
    clone.find("img").attr("src", data.image_url);
    clone.find("img").attr("data-id", data.id);
    clone.find("a").attr("data-id", data.id);
    clone.find("#houseTitle").text(`${data.title}, ${data.city_name}`);
    clone.find("#housePrice").text(`${data.price} TWD／晚`);
    clone.removeAttr("style");
  });
}

function Logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

houseArea_container.click(addToFavorite);

async function addToFavorite(e) {
  
  if (e.target.nodeName === "I") {
    if (localStorage.getItem("token") === null) {
      alert("欲收藏房源請先登入");
    } else {
      let house_id = e.target.parentElement.dataset.id;
      if (e.target.classList.contains("grey")) {
        
        //收藏
        const fetchRes = await fetch(
          `/api/1.0/houses/likeHouse?id=${house_id}`,
          { headers }
        );
        const finalResult = await fetchRes.json();
        if (fetchRes.status === 200) {
          userFavoriteList = finalResult;
          
        }
        e.target.classList.toggle("grey");
        e.target.classList.toggle("red");
      } else if (e.target.classList.contains("red")) {
        
        //取消收藏
        const fetchRes = await fetch(
          `/api/1.0/houses/dislikeHouse?id=${house_id}`,
          { headers }
        );
        const finalResult = await fetchRes.json();
        if (fetchRes.status === 200) {
          userFavoriteList = finalResult;
          
        }
        e.target.classList.toggle("grey");
        e.target.classList.toggle("red");
      }
    }
  }
  if (e.target.nodeName === "IMG") {
    let house_id = e.target.dataset.id;
    window.open(`/detail.html?id=${house_id}`, "Nice Stay");
  }
}
