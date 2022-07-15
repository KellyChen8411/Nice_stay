require("dotenv").config();
const {expect, requester} = require("./set_up");
const { pool } = require("../server/models/mysqlcon");

describe('houseIndexPage', () => {

    it('get house in index page', async () => {
        let houseData = await requester.get("/api/1.0/houses/all?paging=0");
        console.log('test');
        console.log(houseData);
        houseData = houseData.body.data;

        console.log('environment')
        console.log(process.env.DB_HOST)
        console.log(process.env.NODE_ENV);
        
        const expected = [
            {
                "id": 3,
                "title": "唯樂米窩",
                "people_count": 4,
                "room_count": 1,
                "bed_count": 2,
                "created_at": "1655540743000",
                "bathroom_count": 1,
                "city_name": "台北",
                "price": 3200,
                "image_url": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/main/main_1655540743049.jpg"
            },
            {
                "id": 4,
                "title": "小橋好宅",
                "people_count": 2,
                "room_count": 1,
                "bed_count": 1,
                "created_at": "1655540764000",
                "bathroom_count": 1,
                "city_name": "台北",
                "price": 2800,
                "image_url": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/main/main_1655540764547.jpg"
            },
            {
                "id": 5,
                "title": "松河璞旅",
                "people_count": 4,
                "room_count": 1,
                "bed_count": 2,
                "created_at": "1655540777000",
                "bathroom_count": 1,
                "city_name": "高雄",
                "price": 5600,
                "image_url": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/main/main_1655540776998.jpg"
            },
            {
                "id": 6,
                "title": "白墅",
                "people_count": 10,
                "room_count": 5,
                "bed_count": 5,
                "created_at": "1655540807000",
                "bathroom_count": 3,
                "city_name": "高雄",
                "price": 15000,
                "image_url": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/main/main_1655540807289.jpg"
            },
            {
                "id": 7,
                "title": "荷米.輕別館",
                "people_count": 2,
                "room_count": 1,
                "bed_count": 1,
                "created_at": "1655540817000",
                "bathroom_count": 1,
                "city_name": "高雄",
                "price": 4300,
                "image_url": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/main/main_1655540817868.jpg"
            },
            {
                "id": 14,
                "title": "簡單生活",
                "people_count": 2,
                "room_count": 1,
                "bed_count": 1,
                "created_at": "1655953776143",
                "bathroom_count": 1,
                "city_name": "花蓮",
                "price": 3490,
                "image_url": "https://d278985kbhjfo4.cloudfront.net/Nice_stay/main/main_1655953776143.jpg"
            }
        ];

        expect(houseData).to.deep.equal(expected);

    })

})