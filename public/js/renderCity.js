let citys_list = $("#area");

async function fetchCityData() {
  let cityDatas = await fetch("/api/1.0/citys/all");
  cityDatas = await cityDatas.json();

  renderCityData(cityDatas);
}

fetchCityData();

function renderCityData(datas) {
  datas.map((data, index) => {
    if (index == 0) {
      let new_option = $(`<option>${data.name}</option>`);
      new_option.attr("selected", "selected");
      citys_list.append(new_option);
    } else {
      citys_list.append($(`<option>${data.name}</option>`));
    }
  });
}
