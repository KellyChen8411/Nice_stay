let searchIcon = $('#searchIcon');
searchIcon.click(submitMainSearch);

async function submitMainSearch(){
    // houseArea_container.empty();
    // houseItemClone.appendTo(houseArea_container);
    // let houseDatas = await fetch('/api/1.0/houses/search');
    // houseDatas = await houseDatas.json();
    // renderHouseData(houseDatas);

    //check select condition
    const serchItems = ['area', 'startDate', 'endDate', 'people'];
    let searchURL = '/api/1.0/houses/search?';
    serchItems.forEach(item => {
        let value = $(`#${item}`).val()
        if(item === 'area'){
            console.log('enter');
            if(value != '0'){
                searchURL += `${item}=${value}&`
            }
        }else if(item === 'people'){
            if(value != ''){
                value = value.split(',');
                if(value[0]>0){
                    searchURL += `people=${value[0]}&`
                }
                if(value[1]>0){
                    searchURL += `pet=${true}&`
                }
            }
        }else{
            if(value != ''){
                searchURL += `${item}=${value}&`
            }
        }
    })
    console.log(searchURL);
  
    //fetch data
    if(searchURL !== '/api/1.0/houses/search?'){
        houseArea_container.empty();
        houseItemClone.appendTo(houseArea_container);
        let houseDatas = await fetch(searchURL);
        houseDatas = await houseDatas.json();
        renderHouseData(houseDatas);
    }
    

}