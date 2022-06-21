// 給後續search更新版面用
var houseItemClone = $('#houseItem').clone();

//render house
var houseArea_container = $('#houseArea');

async function fetchHouseData(){
    let houseDatas = await fetch('/api/1.0/houses/all');
    houseDatas = await houseDatas.json();
    renderHouseData(houseDatas);
    // $('.house_image').each(function(index){
    //     console.log( index + ": " + $( this ).attr("src") );
    //     console.log($( this ).find('+a')[0]);
    // })
} 

//render city
var citys_list = $('#area');

async function fetchCityData(){
    let cityDatas = await fetch('/api/1.0/citys/all');
    cityDatas = await cityDatas.json();
    renderCityData(cityDatas);
} 


//function area
fetchHouseData();
fetchCityData();

function renderHouseData(datas){
    datas.map(data => {
        var clone = $('#houseItem').clone().appendTo(houseArea_container);
        clone.find('img').attr('src', data.image_url);
        clone.find('img').attr('data-id', data.id);
        clone.find('a').attr('data-id', data.id);
        clone.find('#houseTitle').text(`${data.title}, ${data.city_name}`);
        clone.find('#housePrice').text(`${data.price} TWD／晚`);
        clone.find('#houseConfig').text(`${data.people_count}位.${data.room_count}間臥室.${data.bed_count}張床.${data.bathroom_count}間衛浴`);
        clone.removeAttr('style');
    })
    
}

function renderCityData(datas){
    datas.map( (data, index) => {
        // if(index == 0){
            let new_option = $(`<option>${data.name}</option>`);
            new_option.attr('value', data.id);
            citys_list.append(new_option);
        // }else{
            // citys_list.append($(`<option>${data.name}</option>`));
        // }
        
    })
    
}

