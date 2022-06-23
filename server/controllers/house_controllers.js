require('dotenv').config();
const houseQuery = require('../models/house_model');
const axios = require('axios');


const createHouse = async (req, res) => {
    // const insertValues = [
    //     "唯樂米窩", 3, 
    //     "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好", 
    //     3200, 10, 8, 4, 1, 2, 1, 1, 1, "萬華", "臺北市萬華區成都路101、103號1-6樓", 25.043258, 121.50437, null, null , `main_${Date.now()}.jpg`

    // ];
    // const insertValues = [ 
    //     "小橋好宅", 3, 
    //     "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好", 
    //     2800, 10, 8, 2, 1, 1, 1, 2, 1, "中山", "臺北市中山區林森北路369號", 25.057948, 121.525709, 2, 24 , `main_${Date.now()}.jpg`

    // ];
    // const insertValues = [
    //     "松河璞旅", 2, 
    //     "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好", 
    //     5600, 10, 8, 4, 1, 2, 1, 2, 2, "三民", "高雄市三民區博愛一路287號10樓", 22.649068, 120.300873, 2, 48 , `main_${Date.now()}.jpg`

    // ];
    // const insertValues = [

    //     "白墅", 1, 
    //     "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好", 
    //     15000, 10, 8, 10, 5, 5, 3, 1, 2, "苓雅", "高雄市苓雅區建民路37號", 22.628559, 120.332979, 1, 7 , `main_${Date.now()}.jpg`

    // ];
    const insertValues1 = [

        "簡單生活", 3, 
        "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好", 
        3490, 10, 8, 2, 1, 1, 1, 2, 3, "花蓮", "花蓮縣花蓮市國富里國富十街39號", 23.989245, 121.596774, 0, null , `main_${Date.now()}.jpg`, `${Date.now()}`, `${Date.now()}`, 0

    ];

    const insertValues2 = [ 

        "星湖．森活", 1, 
        "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好", 
        15000, 10, 8, 2, 12, 5, 6, 2, 4, "冬山", "宜蘭縣冬山鄉梅花路567之1號", 24.662389, 121.737551, 1, 5 , `main_${Date.now()}.jpg`, `${Date.now()}`, `${Date.now()}`, 1

    ];

    const insertValues3 = [ 

        "貓步民宿", 2, 
        "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好", 
        6000, 10, 8, 6, 3, 3, 2, 1, 5, "埔里", "南投縣埔里鎮大湳里虎山路17號", 23.975021, 120.978999, 1, 10 , `main_${Date.now()}.jpg`, `${Date.now()}`, `${Date.now()}`, 1

    ];

    const insertDate = [ insertValues1, insertValues2, insertValues3 ]
    
    const result = await houseQuery.createHouse(insertDate);

    res.send('test');
}

const selectAllHouse = async (req, res) => {
    const paging = parseInt(req.query.paging);
    const itemNum = 7;
    const houses = await houseQuery.selectAllHouse(paging, itemNum);
    const houseCount = await houseQuery.allHouseCount();
    const totalPage = Math.ceil(houseCount/6);
    let APIData = { totalPage };
    if(houses.length === 7){
        APIData.next_paging = paging+1;
        houses.pop();
    }
    const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN + '/main/'
    houses.forEach(house=>{
        house.image_url = imageURL_prefix + house.image_url;
    })
    APIData.data = houses;
    // console.log(APIData)
    res.json(APIData);

}

const houseSearch = async (req, res) => {
    let queryCondition = req.body;
    let orderCondition = 0;  //0 means no order, 1 means DESC and 2 means ASC
    //take order key out
    if ('price_order' in queryCondition){
        orderCondition = parseInt(queryCondition.price_order);
        delete queryCondition.price_order
    }

    queryCondition = Object.entries(queryCondition);
    const paging = parseInt(req.query.paging);
    const itemNum = 7;
    // console.log(queryCondition);
    // console.log(orderCondition);

    const selectData = await houseQuery.houseSearch(queryCondition, orderCondition, paging, itemNum);
    let houses = selectData.data;
    let houseCount = selectData.houseCount;
    const totalPage = Math.ceil(houseCount/6);
    let APIData = { totalPage };
    if(houses.length === 7){
        APIData.next_paging = paging+1;
        houses.pop();
    }
    // console.log(houses);
    const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN + '/main/'
    houses.forEach(house=>{
        house.image_url = imageURL_prefix + house.image_url;
    })
    APIData.data = houses;
    // console.log(APIData);
    res.json(APIData);
}

const houseTest = async (req, res) => {
    const house_id = await houseQuery.getHouseID();
    const amenity_id = [1,2,3,4,5,6,7,8,9,10];

    function getRandomSubarray(arr, size) {
        var shuffled = arr.slice(0), i = arr.length, temp, index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }
    
    let insertData = [];
    house_id.forEach(house => {
        let arrayNum = Math.floor(Math.random() * (10- 6 + 1)) + 6;
        let tempAmenity = getRandomSubarray(amenity_id, arrayNum);
        tempAmenity.forEach(amenity=>{
            let tempArr = [house[0], amenity];
            insertData.push(tempArr);
        })
    })
    // console.log(insertData);
    await houseQuery.insertAmenity(insertData);
    res.send('test');
}

const houseDatail = async (req, res) => {
    const {id} = req.params;
    //get house data
    const houses = await houseQuery.houseDatail(id);
    houses[0].sideImages_url = [];
    houses.forEach(house=>{
        house.image_url = process.env.CLOUDFRONT_DOMAIN + '/main/' + house.image_url;
        houses[0].sideImages_url.push(process.env.CLOUDFRONT_DOMAIN + '/side_image/' + house.sideImage_url);
    })
    let houseData = houses[0];
    //get amenity
    const amenityData = await houseQuery.houseAmentity(id);
    amenityData.forEach(amenity=>{
        amenity[1] = process.env.CLOUDFRONT_DOMAIN + amenity[1];
    })
    //get review
    const reviewData = await houseQuery.houseReview([id, houseData.landlord_id, id]);

    res.json({house: houseData, amenity: amenityData, review: reviewData});
}

const houseNearby = async (req, res) => {
    let { lat, lon, type } = req.query;
    let URL;
    if(type === "traffic"){
        URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=1000&type=bus_station&key=${process.env.GOOGLEAPI_KEY}`;
    }else if(type === "restaurant"){
        URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=1000&type=restaurant&key=${process.env.GOOGLEAPI_KEY}`;
    }else if(type === "store"){
        URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=1000&type=convenience_store&key=${process.env.GOOGLEAPI_KEY}`;
    }

    var config = {
        method: 'get',
        url: URL,
        headers: { }
    };

    let nearbyLocations = await axios(config);
    let nearbyLocationsData = nearbyLocations.data;
    let nearbyLocationSet = [];
    nearbyLocationsData.results.forEach(element => {
        let placeGro = element.geometry.location
        nearbyLocationSet.push({lat: placeGro.lat, lon: placeGro.lng , name: element.name})
    });
    
    res.json(nearbyLocationSet);
}

module.exports = {
    createHouse,
    selectAllHouse,
    houseSearch,
    houseDatail,
    houseNearby,
    houseTest
}