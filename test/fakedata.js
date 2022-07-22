const moment = require('moment-timezone');
const taipeiDate = moment().tz("Asia/Taipei").format("YYYY-MM-DD");


const houses = [
    {
        "id": 3,
        "title": "唯樂米窩",
        "category_id": 3,
        "description": "最遠的 \r\n不是如何遠離現實生活的塵囂 \r\n而是如何淡忘放不下的牽絆 \r\n或許應該輕撫去自限的範疇 \r\n用最單純的方式 換得簡單的美好",
        "price": 3200,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 4,
        "room_count": 1,
        "bed_count": 2,
        "bathroom_count": 1,
        "landlord_id": 1,
        "city_id": 1,
        "region": "萬華",
        "address": "臺北市萬華區成都路101、103號1-6樓",
        "latitude": 25.043258,
        "longitude": 121.50437,
        "refund_type": 0,
        "refund_duration": 0,
        "image_url": "Nice_stay/main/main_1655540743049.jpg",
        "created_at": "1655540743000",
        "updated_at": "1657813914670",
        "pet": 1
    },
    {
        "id": 4,
        "title": "小橋好宅",
        "category_id": 3,
        "description": "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好",
        "price": 2800,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 2,
        "room_count": 1,
        "bed_count": 1,
        "bathroom_count": 1,
        "landlord_id": 2,
        "city_id": 1,
        "region": "中山",
        "address": "臺北市中山區林森北路369號",
        "latitude": 25.057948,
        "longitude": 121.525709,
        "refund_type": 1,
        "refund_duration": 5,
        "image_url": "Nice_stay/main/main_1655540764547.jpg",
        "created_at": "1655540764000",
        "updated_at": "1655540764000",
        "pet": 1
    },
    {
        "id": 5,
        "title": "松河璞旅",
        "category_id": 2,
        "description": "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好",
        "price": 5600,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 4,
        "room_count": 1,
        "bed_count": 2,
        "bathroom_count": 1,
        "landlord_id": 2,
        "city_id": 2,
        "region": "三民",
        "address": "高雄市三民區博愛一路287號10樓",
        "latitude": 22.649068,
        "longitude": 120.300873,
        "refund_type": 1,
        "refund_duration": 8,
        "image_url": "Nice_stay/main/main_1655540776998.jpg",
        "created_at": "1655540777000",
        "updated_at": "1655540777000",
        "pet": 1
    },
    {
        "id": 6,
        "title": "白墅",
        "category_id": 1,
        "description": "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好",
        "price": 15000,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 10,
        "room_count": 5,
        "bed_count": 5,
        "bathroom_count": 3,
        "landlord_id": 1,
        "city_id": 2,
        "region": "苓雅",
        "address": "高雄市苓雅區建民路37號",
        "latitude": 22.628559,
        "longitude": 120.332979,
        "refund_type": 1,
        "refund_duration": 3,
        "image_url": "Nice_stay/main/main_1655540807289.jpg",
        "created_at": "1655540807000",
        "updated_at": "1655540807000",
        "pet": 1
    },
    {
        "id": 7,
        "title": "荷米.輕別館",
        "category_id": 3,
        "description": "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好",
        "price": 4300,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 2,
        "room_count": 1,
        "bed_count": 1,
        "bathroom_count": 1,
        "landlord_id": 2,
        "city_id": 2,
        "region": "中山",
        "address": "高雄市鼓山區長安街2號",
        "latitude": 22.62163,
        "longitude": 120.270178,
        "refund_type": 0,
        "refund_duration": null,
        "image_url": "Nice_stay/main/main_1655540817868.jpg",
        "created_at": "1655540817000",
        "updated_at": "1655540817000",
        "pet": 0
    },
    {
        "id": 14,
        "title": "簡單生活",
        "category_id": 3,
        "description": "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好",
        "price": 3490,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 2,
        "room_count": 1,
        "bed_count": 1,
        "bathroom_count": 1,
        "landlord_id": 2,
        "city_id": 3,
        "region": "花蓮",
        "address": "花蓮縣花蓮市國富里國富十街39號",
        "latitude": 23.989245,
        "longitude": 121.596774,
        "refund_type": 1,
        "refund_duration": 3,
        "image_url": "Nice_stay/main/main_1655953776143.jpg",
        "created_at": "1655953776143",
        "updated_at": "1655953776143",
        "pet": 0
    },
    {
        "id": 15,
        "title": "星湖．森活",
        "category_id": 1,
        "description": "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好",
        "price": 15000,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 2,
        "room_count": 12,
        "bed_count": 5,
        "bathroom_count": 6,
        "landlord_id": 2,
        "city_id": 4,
        "region": "冬山",
        "address": "宜蘭縣冬山鄉梅花路567之1號",
        "latitude": 24.662389,
        "longitude": 121.737551,
        "refund_type": 1,
        "refund_duration": 5,
        "image_url": "Nice_stay/main/main_1655953776145.jpg",
        "created_at": "1655953776143",
        "updated_at": "1655953776143",
        "pet": 1
    },
    {
        "id": 16,
        "title": "貓步民宿",
        "category_id": 2,
        "description": "最遠的 不是如何遠離現實生活的塵囂 而是如何淡忘放不下的牽絆 或許應該輕撫去自限的範疇 用最單純的方式 換得簡單的美好",
        "price": 6000,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 6,
        "room_count": 3,
        "bed_count": 3,
        "bathroom_count": 2,
        "landlord_id": 1,
        "city_id": 5,
        "region": "埔里",
        "address": "南投縣埔里鎮大湳里虎山路17號",
        "latitude": 23.975021,
        "longitude": 120.978999,
        "refund_type": 1,
        "refund_duration": 10,
        "image_url": "Nice_stay/main/main_1655953776148.jpg",
        "created_at": "1655953776143",
        "updated_at": "1655953776143",
        "pet": 1
    },
    {
        "id": 17,
        "title": "品民宿",
        "category_id": 1,
        "description": "最遠的 \r\n不是如何遠離現實生活的塵囂 \r\n而是如何淡忘放不下的牽絆 \r\n或許應該輕撫去自限的範疇 \r\n用最單純的方式 \r\n換得簡單的美好",
        "price": 17823,
        "tax_percentage": 6,
        "cleanfee_percentage": 5,
        "people_count": 10,
        "room_count": 6,
        "bed_count": 6,
        "bathroom_count": 3,
        "landlord_id": 8,
        "city_id": 3,
        "region": "瑞穗",
        "address": "花蓮市瑞穗區瑞美村中興路61之1號",
        "latitude": 23.4945346,
        "longitude": 121.3801197,
        "refund_type": 1,
        "refund_duration": 5,
        "image_url": "Nice_stay/main/main_1656940244285.jpg",
        "created_at": "1656940212326",
        "updated_at": "1656940244285",
        "pet": 1
    },
    {
        "id": 18,
        "title": "想念海",
        "category_id": 2,
        "description": "最遠的 \r\n不是如何遠離現實生活的塵囂 \r\n而是如何淡忘放不下的牽絆 \r\n或許應該輕撫去自限的範疇 \r\n用最單純的方式 \r\n換得簡單的美好",
        "price": 10874,
        "tax_percentage": 5,
        "cleanfee_percentage": 5,
        "people_count": 6,
        "room_count": 3,
        "bed_count": 3,
        "bathroom_count": 2,
        "landlord_id": 8,
        "city_id": 3,
        "region": "新城",
        "address": "花蓮市新城區大漢村3鄰七星街112號",
        "latitude": 24.0265978,
        "longitude": 121.6302867,
        "refund_type": 1,
        "refund_duration": 3,
        "image_url": "Nice_stay/main/main_1656940480653.jpg",
        "created_at": "1656940480892",
        "updated_at": "1656940480892",
        "pet": 1
    },
    {
        "id": 19,
        "title": "微藍海岸",
        "category_id": 3,
        "description": "最遠的 \r\n不是如何遠離現實生活的塵囂 \r\n而是如何淡忘放不下的牽絆 \r\n或許應該輕撫去自限的範疇 \r\n用最單純的方式 \r\n換得簡單的美好",
        "price": 8004,
        "tax_percentage": 8,
        "cleanfee_percentage": 5,
        "people_count": 2,
        "room_count": 1,
        "bed_count": 1,
        "bathroom_count": 1,
        "landlord_id": 8,
        "city_id": 4,
        "region": "壯圍",
        "address": "宜蘭市壯圍區美福村中興六路157號",
        "latitude": 24.7260022,
        "longitude": 121.7764188,
        "refund_type": 1,
        "refund_duration": 3,
        "image_url": "Nice_stay/main/main_1656940635974.jpg",
        "created_at": "1656940636273",
        "updated_at": "1656940636273",
        "pet": 1
    },
    {
        "id": 20,
        "title": "礁溪沐樂旅宿",
        "category_id": 1,
        "description": "最遠的 \r\n不是如何遠離現實生活的塵囂 \r\n而是如何淡忘放不下的牽絆 \r\n或許應該輕撫去自限的範疇 \r\n用最單純的方式 \r\n換得簡單的美好\r\n",
        "price": 25376,
        "tax_percentage": 8,
        "cleanfee_percentage": 7,
        "people_count": 12,
        "room_count": 4,
        "bed_count": 6,
        "bathroom_count": 3,
        "landlord_id": 8,
        "city_id": 4,
        "region": "礁溪",
        "address": "宜蘭市礁溪區三民村十六結路103之20號",
        "latitude": 24.8102804,
        "longitude": 121.7643598,
        "refund_type": 1,
        "refund_duration": 5,
        "image_url": "Nice_stay/main/main_1656940829124.jpg",
        "created_at": "1656940829429",
        "updated_at": "1656940829429",
        "pet": 1
    },
    {
        "id": 21,
        "title": "明玥居",
        "category_id": 2,
        "description": "最遠的 \r\n不是如何遠離現實生活的塵囂 \r\n而是如何淡忘放不下的牽絆 \r\n或許應該輕撫去自限的範疇 \r\n用最單純的方式 \r\n換得簡單的美好",
        "price": 42030,
        "tax_percentage": 10,
        "cleanfee_percentage": 8,
        "people_count": 6,
        "room_count": 3,
        "bed_count": 3,
        "bathroom_count": 2,
        "landlord_id": 8,
        "city_id": 5,
        "region": "埔里",
        "address": "南投市埔里區水頭里水頭路1號",
        "latitude": 23.9478084,
        "longitude": 120.9720032,
        "refund_type": 0,
        "refund_duration": null,
        "image_url": "Nice_stay/main/main_1656941159087.jpg",
        "created_at": "1656941159332",
        "updated_at": "1656941159332",
        "pet": 1
    }

];

const citys = [
    {
        "id": 1,
        "name": "台北"
    },
    {
        "id": 2,
        "name": "高雄"
    },
    {
        "id": 3,
        "name": "花蓮"
    },
    {
        "id": 4,
        "name": "宜蘭"
    },
    {
        "id": 5,
        "name": "南投"
    }
];

const images = [
    {
        "id": 1,
        "house_id": 15,
        "name": "Nice_stay/side_image/1656936912495.jpg"
    },
    {
        "id": 2,
        "house_id": 15,
        "name": "Nice_stay/side_image/1656936932134.jpg"
    },
    {
        "id": 3,
        "house_id": 18,
        "name": "Nice_stay/side_image/16569370687683423.jpg"
    },
    {
        "id": 4,
        "house_id": 18,
        "name": "Nice_stay/side_image/165693708296534324.jpg"
    },
    {
        "id": 5,
        "house_id": 19,
        "name": "Nice_stay/side_image/165693706876856564.jpg"
    },
    {
        "id": 6,
        "house_id": 19,
        "name": "Nice_stay/side_image/165693708296576573.jpg"
    },
    {
        "id": 7,
        "house_id": 20,
        "name": "Nice_stay/side_image/1656937068768fsdf.jpg"
    },
    {
        "id": 8,
        "house_id": 20,
        "name": "Nice_stay/side_image/1656937082965ggfjf.jpg"
    },
    {
        "id": 9,
        "house_id": 21,
        "name": "Nice_stay/side_image/1656937068768dfsdf.jpg"
    },
    {
        "id": 10,
        "house_id": 21,
        "name": "Nice_stay/side_image/1656937082965hgjgj.jpg"
    }
];

const houseAmenities = [
    {
        "id": 1,
        "house_id": 15,
        "amenity_id": 1
    },
    {
        "id": 2,
        "house_id": 15,
        "amenity_id": 2
    },
    {
        "id": 3,
        "house_id": 15,
        "amenity_id": 3
    },
    {
        "id": 4,
        "house_id": 15,
        "amenity_id": 4
    },
    {
        "id": 5,
        "house_id": 15,
        "amenity_id": 5
    },
    {
        "id": 6,
        "house_id": 18,
        "amenity_id": 1
    },
    {
        "id": 7,
        "house_id": 19,
        "amenity_id": 1
    },
    {
        "id": 8,
        "house_id": 20,
        "amenity_id": 1
    },
    {
        "id": 9,
        "house_id": 21,
        "amenity_id": 1
    },
]

const bookings = [
    {
        "id": 1,
        "house_id": 16,
        "renter_id": 3,
        "landlord_id": 1,
        "checkin_date": taipeiDate,
        "checkout_date": moment(taipeiDate).add(1, 'days').format("YYYY-MM-DD"),
        "room_price": 6400,
        "tax_fee": 640,
        "clean_fee": 512,
        "amount_fee": 7552,
        "created_at": "1655610805000",
        "refundable": 1,
        "paid": 0,
        "refund_duetime": "1655827140000",
        "is_refund": 0
    },
    {
        "id": 2,
        "house_id": 17,
        "renter_id": 3,
        "landlord_id": 1,
        "checkin_date": moment(taipeiDate).subtract(1, 'days').format("YYYY-MM-DD"),
        "checkout_date": moment(taipeiDate).add(1, 'days').format("YYYY-MM-DD"),
        "room_price": 6400,
        "tax_fee": 640,
        "clean_fee": 512,
        "amount_fee": 7552,
        "created_at": "1655610805000",
        "refundable": 1,
        "paid": 0,
        "refund_duetime": "1655827140000",
        "is_refund": 0
    },
    {
        "id": 3,
        "house_id": 19,
        "renter_id": 3,
        "landlord_id": 1,
        "checkin_date": moment(taipeiDate).subtract(2, 'days').format("YYYY-MM-DD"),
        "checkout_date": moment(taipeiDate).subtract(1, 'days').format("YYYY-MM-DD"),
        "room_price": 6400,
        "tax_fee": 640,
        "clean_fee": 512,
        "amount_fee": 7552,
        "created_at": "1655610805000",
        "refundable": 1,
        "paid": 0,
        "refund_duetime": "1655827140000",
        "is_refund": 0
    },
    {
        "id": 4,
        "house_id": 20,
        "renter_id": 3,
        "landlord_id": 1,
        "checkin_date": moment(taipeiDate).subtract(1, 'days').format("YYYY-MM-DD"),
        "checkout_date": taipeiDate,
        "room_price": 6400,
        "tax_fee": 640,
        "clean_fee": 512,
        "amount_fee": 7552,
        "created_at": "1655610805000",
        "refundable": 1,
        "paid": 0,
        "refund_duetime": "1655827140000",
        "is_refund": 0
    },
    {
        "id": 5,
        "house_id": 21,
        "renter_id": 3,
        "landlord_id": 1,
        "checkin_date": moment(taipeiDate).add(1, 'days').format("YYYY-MM-DD"),
        "checkout_date": moment(taipeiDate).add(2, 'days').format("YYYY-MM-DD"),
        "room_price": 6400,
        "tax_fee": 640,
        "clean_fee": 512,
        "amount_fee": 7552,
        "created_at": "1655610805000",
        "refundable": 1,
        "paid": 0,
        "refund_duetime": "1655827140000",
        "is_refund": 0
    }

]

const favorites = [
    {
        "id": 1,
        "renter_id": 1,
        "house_id": 18
    }
]

const payments = [
    {
        "id": 1,
        "booking_id": 3,
        "rec_trade_id": "D20220711yBtLoH",
        "created_at": "1657541699043"
    },
    {
        "id": 2,
        "booking_id": 4,
        "rec_trade_id": "D20220711yBtLoH",
        "created_at": "1657541699043"
    },
    {
        "id": 3,
        "booking_id": 5,
        "rec_trade_id": "D20220711yBtLoH",
        "created_at": "1657541699043"
    },
]

const reviews = [
    {
        "id": 1,
        "comment": "test",
        "house_rate": 4.2,
        "landlord_rate": 4.5,
        "created_at": "1655654095000",
        "booking_id": 3
    },
    {
        "id": 2,
        "comment": "test",
        "house_rate": 4.2,
        "landlord_rate": 4.5,
        "created_at": "1655654095000",
        "booking_id": 4
    },
    {
        "id": 3,
        "comment": "test",
        "house_rate": 4.2,
        "landlord_rate": 4.5,
        "created_at": "1655654095000",
        "booking_id": 5
    }
]

const amenities = [
    {
        "id": 1,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
    {
        "id": 2,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
    {
        "id": 3,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
    {
        "id": 4,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
    {
        "id": 5,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
    {
        "id": 6,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
    {
        "id": 7,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
    {
        "id": 8,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
    {
        "id": 9,
        "name": "空調",
        "icon_url": "Nice_stay/icon/air-conditioner.png"
    },
]


module.exports = { houses, citys, images, houseAmenities, bookings, favorites, payments, reviews, amenities }