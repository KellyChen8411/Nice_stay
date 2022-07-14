$(function () {
  let hamburgerIcon = $("#hamburgerContainer");
  hamburgerIcon.click(showPersonalList);
  let personalArea = $("#personalArea");
  personalArea.css("right", "20px");

  function showPersonalList() {
    if (personalArea.hasClass("PAHide")) {
      personalArea.removeClass("PAHide");
      personalArea.addClass("PAShow");
    } else {
      personalArea.removeClass("PAShow");
      personalArea.addClass("PAHide");
    }
  }


  // 點擊其他東西時關閉下拉式選單
  window.onclick = function(event) {
    
    if(!($("#hamburgerContainer")[0].contains(event.target)) && !($("#personalArea")[0].contains(event.target))){
      if($("#personalArea").hasClass("PAShow")){
        $("#personalArea").removeClass("PAShow");
        $("#personalArea").addClass("PAHide");
      }
    }

  }

});
