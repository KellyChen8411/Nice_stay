// 給後續search更新版面與搜尋用的全域變數
let houseItemClone = $("#houseItem").clone();
let previousSelectPage = 1;
let selectType = "initial";
let mainSearchFormData;
let detailSearchFormData;

//render house
let houseArea_container = $("#houseArea");

async function fetchHouseData() {
  let houseDatas = await fetch("/api/1.0/houses/all?paging=0");
  houseDatas = await houseDatas.json();
  renderHouseData(houseDatas.data);

  ////////////////////////////////////////////////////////////////////////////
  //get user favorite house and render
  let houseThisPage = houseDatas.data.map((house) => house.id);
  let favoriteRes = await fetch("/api/1.0/houses/favorite", { headers });
  let favoriteData = await favoriteRes.json();
  if (favoriteRes.status === 200) {
    if (favoriteData !== null) {
      userFavoriteList = favoriteData;
      let FavoriteForPage = userFavoriteList.filter((element) =>
        houseThisPage.includes(element)
      );
      renderLikeIcon(FavoriteForPage);
    }
  }

  //render page selector
  let pageSelectorCon = $("#changePage_con");
  for (let i = 1; i <= houseDatas.totalPage; i++) {
    let pageItem = $("<a>");
    pageItem.addClass("item");
    pageItem.text(i);
    pageItem.attr("data-page", i - 1);
    if (i == 1) {
      pageItem.addClass("active");
    }
    pageSelectorCon.append(pageItem);
  }

  // $('.house_image').each(function(index){
  //     console.log( index + ": " + $( this ).attr("src") );
  //     console.log($( this ).find('+a')[0]);
  // })
}

//change page
$("#changePage_con").click(changePage);

async function changePage(e) {
  if (e.target.nodeName === "A") {
    // console.log(previousSelectPage);
    $(`#changePage_con>a:nth-child(${previousSelectPage})`).removeClass(
      "active"
    );
    e.target.classList.add("active");
    const page = e.target.dataset.page;
    previousSelectPage = parseInt(page) + 1;

    // let URL;
    let houseDatas;
    if (selectType === "initial") {
      houseDatas = await fetch(`/api/1.0/houses/all?paging=${page}`);
    } else if (selectType === "mainSearch") {
      let searchURL = `/api/1.0/houses/search?paging=${page}`;
      const req = new Request(searchURL, {
        method: "POST",
        body: mainSearchFormData,
      });
      houseDatas = await fetch(req);
    } else if (selectType === "detailSearch") {
      let URL = `/api/1.0/houses/search?paging=${page}`;
      const req = new Request(URL, {
        method: "POST",
        body: detailSearchFormData,
      });
      houseDatas = await fetch(req);
    }

    let status = houseDatas.status;
    if (status === 200) {
      houseDatas = await houseDatas.json();
      houseArea_container.empty();
      houseItemClone.appendTo(houseArea_container);
      renderHouseData(houseDatas.data);
      /////////////////////////////////////////////////////////////
      //get user favorite house and render
      let houseThisPage = houseDatas.data.map((house) => house.id);
      let favoriteRes = await fetch("/api/1.0/houses/favorite", { headers });
      let favoriteData = await favoriteRes.json();
      if (favoriteRes.status === 200) {
        if (favoriteData !== null) {
          userFavoriteList = favoriteData;
          let FavoriteForPage = userFavoriteList.filter((element) =>
            houseThisPage.includes(element)
          );
          renderLikeIcon(FavoriteForPage);
        }
      }

      $("html,body").scrollTop(0);
    }
  }
}

//render city
var citys_list = $("#area");

async function fetchCityData() {
  let cityDatas = await fetch("/api/1.0/citys/all");
  cityDatas = await cityDatas.json();
  renderCityData(cityDatas);
}

//render amenity
let infer_list = $("#infer_list");
async function fetchAmenityData() {
  let amenityDatas = await fetch("/api/1.0/amenities/all");
  amenityDatas = await amenityDatas.json();
  renderAmenityData(amenityDatas);
}

//function area
fetchHouseData();
fetchCityData();
houseArea_container;
fetchAmenityData();

function renderHouseData(datas) {
  datas.map((data) => {
    var clone = $("#houseItem").clone().appendTo(houseArea_container);
    clone.find("img").attr("src", data.image_url);
    clone.find("img").attr("data-id", data.id);
    clone.find("a").attr("data-id", data.id);
    clone.find("#houseTitle").text(`${data.title}, ${data.city_name}`);
    clone.find("#housePrice").text(`${data.price} TWD／晚`);
    clone
      .find("#houseConfig")
      .text(
        `${data.people_count}位.${data.room_count}間臥室.${data.bed_count}張床.${data.bathroom_count}間衛浴`
      );
    clone.removeAttr("style");
  });
}

// let ele = document.getElementById("houseArea");
// ele.addEventListener("scroll", function () {
//   console.log(ele.scrollTop);
// });

function renderCityData(datas) {
  datas.map((data, index) => {
    // if(index == 0){
    let new_option = $(`<option>${data.name}</option>`);
    new_option.attr("value", data.id);
    citys_list.append(new_option);
    // }else{
    // citys_list.append($(`<option>${data.name}</option>`));
    // }
  });
}

function renderAmenityData(datas) {
  datas.map((data) => {
    let clone = $("#infer_item").clone().appendTo(infer_list);
    clone.find("label").text(data.name);
    clone.find("input").attr("value", data.id);
    clone.removeAttr("style");
  });
}

function renderLikeIcon(houseIDList) {
  houseIDList.forEach((houseID) => {
    let iconTag = $(`a[data-id=${houseID}]>i`)[0];
    iconTag.classList.toggle("grey");
    iconTag.classList.toggle("red");
  });
}
