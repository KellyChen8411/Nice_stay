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
});
