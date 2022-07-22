$(function () {
  (from = $("#startDate")
    .datepicker({
      defaultDate: "+1w",
      dateFormat: "yy-mm-dd",
      changeMonth: true,
      numberOfMonths: 1,
      minDate: 0,
    })
    .on("change", function () {
      var currentDate = from.datepicker("getDate");
      var nextDate = new Date(currentDate.valueOf() + 1000 * 3600 * 24);
      to.datepicker("option", "minDate", nextDate);
    })
    .on("click", function () {
      $("#endDate").val("");
    })),
    (to = $("#endDate").datepicker({
      defaultDate: "+1w",
      dateFormat: "yy-mm-dd",
      changeMonth: true,
      numberOfMonths: 1,
      minDate: "+1d",
    }));

  $("#area").selectmenu();

  //people and pet count area
  $("#peopleSelectArea").click(changeConfigCount);
  function changeConfigCount(e) {
    if (e.target.innerHTML === "+") {
      let inputElement = $(`#count_${e.target.dataset.type}`);
      let newValue = parseInt(inputElement.val()) + 1;
      inputElement.val(newValue);
    } else if (e.target.innerHTML === "-") {
      let inputElement = $(`#count_${e.target.dataset.type}`);
      if (inputElement.val() > 0) {
        let newValue = parseInt(inputElement.val()) - 1;
        inputElement.val(newValue);
      }
    }
  }
  //when people area is seleced
  let peopleTag = $("#people");
  let peopleAreaTag = $("#peopleSelectArea");
  let leftPosition = Math.round(peopleTag.position().left);
  peopleAreaTag.css("left", leftPosition);
  peopleTag.click(function (e) {
    peopleAreaTag.removeClass("PAHide");
    peopleAreaTag.addClass("PAShow");
  });
  let peopleBtn = $("#peopleBtn");
  peopleBtn.click(function () {
    peopleAreaTag.removeClass("PAShow");
    peopleAreaTag.addClass("PAHide");
    let humanCount = parseInt($("#count_0").val());
    let petCount = parseInt($("#count_1").val());

    if (!(humanCount === 0 && petCount === 0)) {
      let peoleSelectResult = `${humanCount},${petCount}`;
      peopleTag.val(peoleSelectResult);
    }
  });

  let hamburgerIcon = $("#hamburgerContainer");
  hamburgerIcon.click(showPersonalList);
  let personalArea = $("#personalArea");
  personalArea.css("right", "20px");

  function showPersonalList(e) {
    if (personalArea.hasClass("PAHide")) {
      personalArea.removeClass("PAHide");
      personalArea.addClass("PAShow");
    } else {
      personalArea.removeClass("PAShow");
      personalArea.addClass("PAHide");
    }
  }

  $("#houseArea").click(addToFavorite);

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
      let startDate = $("#startDate").val();
      let endDate = $("#endDate").val();
      let peopleCount = $("#people").val().split(",")[0];
      window.open(
        `/detail.html?id=${house_id}&startDate=${startDate}&endDate=${endDate}&people_count=${peopleCount}`,
        "Nice Stay"
      );
    }
  }

  $("#price_range").slider({
    range: true,
    min: 300,
    max: 100000,
    values: [0, 100000],
    slide: function (event, ui) {
      $("#start_price").val(ui.values[0]);
      $("#end_price").val(ui.values[1]);
    },
  });

  //細節篩選單顯示
  $("#detailSearch").click(function (e) {
    if ($("#detailSearchList").hasClass("DSHide")) {
      $("#detailSearchList").removeClass("DSHide");
    } else {
      $("#detailSearchList").addClass("DSHide");
    }
  });

  //細節篩選單關閉
  $("#close_icon").click(function () {
    $("#detailSearchList").addClass("DSHide");
  });

  // 點擊其他東西時關閉下拉式選單
  window.onclick = function (event) {
    if (
      !$("#people")[0].contains(event.target) &&
      !$("#peopleSelectArea")[0].contains(event.target)
    ) {
      if ($("#peopleSelectArea").hasClass("PAShow")) {
        $("#peopleSelectArea").removeClass("PAShow");
        $("#peopleSelectArea").addClass("PAHide");
      }
    }

    if (
      !$("#hamburgerContainer")[0].contains(event.target) &&
      !$("#personalArea")[0].contains(event.target)
    ) {
      if ($("#personalArea").hasClass("PAShow")) {
        $("#personalArea").removeClass("PAShow");
        $("#personalArea").addClass("PAHide");
      }
    }

    if (
      !$("#detailSearch")[0].contains(event.target) &&
      !$("#detailSearchList")[0].contains(event.target)
    ) {
      if (!$("#detailSearchList").hasClass("DSHide")) {
        $("#detailSearchList").addClass("DSHide");
      }
    }
  };
});
