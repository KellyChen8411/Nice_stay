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
    const insertValues = [

        "荷米.輕別館", 3, 
        "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好", 
        4300, 10, 8, 2, 1, 1, 1, 2, 2, "中山", "高雄市鼓山區長安街2號", 22.62163, 120.270178, null, null , `main_${Date.now()}.jpg`

    ];
    
    const result = await houseQuery.createHouse(insertValues);

    res.send('test');
}

const selectAllHouse = async (req, res) => {
    const houses = await houseQuery.selectAllHouse();
    const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN + '/main/'
    houses.forEach(house=>{
        house.image_url = imageURL_prefix + house.image_url;
    })
    res.json(houses);

}

const houseSearch = async (req, res) => {
    let queryTest = Object.entries(req.query);
    let houses = await houseQuery.houseSearch(queryTest);
    const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN + '/main/'
    houses.forEach(house=>{
        house.image_url = imageURL_prefix + house.image_url;
    })
    res.json(houses);
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
    houseNearby
}