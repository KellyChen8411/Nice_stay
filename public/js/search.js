let searchIcon = $("#searchIcon");
searchIcon.click(submitMainSearch);

//main search
async function submitMainSearch() {
  // houseArea_container.empty();
  // houseItemClone.appendTo(houseArea_container);
  // let houseDatas = await fetch('/api/1.0/houses/search');
  // houseDatas = await houseDatas.json();
  // renderHouseData(houseDatas);

  //check main select condition
  const serchItems = ["startDate", "endDate", "area", "people"];
  let searchURL = "/api/1.0/houses/search?paging=0";

  let data = new FormData();
  serchItems.forEach((item) => {
    let value = $(`#${item}`).val();
    if (item === "area") {
      if (value != "0") {
        searchURL += `${item}=${value}&`;
        data.append("area", value);
      }
    } else if (item === "people") {
      if (value != "") {
        value = value.split(",");
        if (value[0] > 0) {
          searchURL += `people=${value[0]}&`;
          data.append("people", value[0]);
        }
        if (value[1] > 0) {
          searchURL += `pet=${true}&`;
          data.append("pet", true);
        }
      }
    } else {
      if (value != "") {
        searchURL += `${item}=${value}&`;
        data.append(`${item}`, value);
      }
    }
  });

  mainSearchFormData = data;
  //fetch data
  // if(searchURL !== '/api/1.0/houses/search?'){
  const req = new Request(searchURL, { method: "POST", body: data });
  let houseDatas = await fetch(req);
  let status = houseDatas.status;
  if (status === 200) {
    selectType = "mainSearch";
    houseDatas = await houseDatas.json();
    houseArea_container.empty();
    houseItemClone.appendTo(houseArea_container);
    renderHouseData(houseDatas.data);
    ////////////////////////////////////////////////////////////////////////////
    //get user favorite house and render
    let houseThisPage = houseDatas.data.map( house => house.id)
    let favoriteRes= await fetch("/api/1.0/houses/favorite", { headers });
    let favoriteData = await favoriteRes.json();
    if(favoriteRes.status === 200){
      userFavoriteList = favoriteData;
      let FavoriteForPage = userFavoriteList.filter(element => houseThisPage.includes(element));
      renderLikeIcon(FavoriteForPage);
    }
    
    $("html,body").scrollTop(0);

    //render page selector
    let pageSelectorCon = $("#changePage_con");
    pageSelectorCon.empty();
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
  }
  // }
}

//detail search
const detailSearchForm = document.getElementById("detailSearchForm");
detailSearchForm.addEventListener("submit", detailSearch);

async function detailSearch(e) {
  $("#detailSearchList").addClass("DSHide");
  e.preventDefault();
  let data = new FormData(detailSearchForm);

  //check main select condition
  const serchItems = ["startDate", "endDate", "area", "people"];
  serchItems.forEach((item) => {
    let value = $(`#${item}`).val();
    if (item === "area") {
      if (value != "0") {
        data.append("area", value);
      }
    } else if (item === "people") {
      if (value != "") {
        value = value.split(",");
        if (value[0] > 0) {
          data.append("people", value[0]);
        }
        if (value[1] > 0) {
          data.append("pet", true);
        }
      }
    } else {
      if (value != "") {
        data.append(`${item}`, value);
      }
    }
  });

  detailSearchFormData = data;
  let URL = "/api/1.0/houses/search?paging=0";
  const req = new Request(URL, { method: "POST", body: data });
  let houseDatas = await fetch(req);
  let status = houseDatas.status;
  if (status === 200) {
    selectType = "detailSearch";
    houseDatas = await houseDatas.json();
    houseArea_container.empty();
    houseItemClone.appendTo(houseArea_container);
    renderHouseData(houseDatas.data);
    ////////////////////////////////////////////////////////////////////////////
    //get user favorite house and render
    let houseThisPage = houseDatas.data.map( house => house.id)
    let favoriteRes= await fetch("/api/1.0/houses/favorite", { headers });
    let favoriteData = await favoriteRes.json();
    if(favoriteRes.status === 200){
      userFavoriteList = favoriteData;
      let FavoriteForPage = userFavoriteList.filter(element => houseThisPage.includes(element));
      renderLikeIcon(FavoriteForPage);
    }

    $("html,body").scrollTop(0);

    //render page selector
    let pageSelectorCon = $("#changePage_con");
    pageSelectorCon.empty();
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
  }
}
