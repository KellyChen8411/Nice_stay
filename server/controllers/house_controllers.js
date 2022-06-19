require('dotenv').config();
const houseQuery = require('../models/house_model');


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
    console.log(result);
    res.send('test');
}

const selectAllHouse = async (req, res) => {
    const houses = await houseQuery.selectAllHouse();
    const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN + 'main/'
    houses.forEach(house=>{
        house.image_url = imageURL_prefix + house.image_url;
    })
    res.json(houses);

}

const houseSearch = async (req, res) => {
    // console.log(req.query);
    // console.log(Object.entries(req.query));
    let queryTest = Object.entries(req.query);
    let houses = await houseQuery.houseSearch(queryTest);
    // console.log(queryTest[3][1].split(','));
    // const houses = await houseSearch(req.query);
    // const houses = await houseQuery.houseSearch();
    const imageURL_prefix = process.env.CLOUDFRONT_DOMAIN + 'main/'
    houses.forEach(house=>{
        house.image_url = imageURL_prefix + house.image_url;
    })
    res.json(houses);
}

module.exports = {
    createHouse,
    selectAllHouse,
    houseSearch
}