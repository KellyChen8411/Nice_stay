const { pool } = require('./mysqlcon');

const houseQuery = {};

houseQuery.createHouse = async (values)=>{
    let sql = "INSERT INTO house (title, category_id, description, price, tax_percentage, cleanfee_percentage, people_count, room_count, bed_count, bathroom_count, landlord_id, city_id, region, address, latitude, longitude, refund_type, refund_duration, image_url, created_at, updated_at, pet) VALUES ?";
    const [result] = await pool.query(sql, [values]);
    return result;
}

houseQuery.selectAllHouse = async (paging, itemNum)=>{
    let itemStartNum = paging * 6;
    let sql = `SELECT a.id, a.title, a.people_count, a.room_count, a.bed_count, a.created_at , a.bathroom_count, b.name as city_name, a.price, a.image_url FROM house a left join city b on a.city_id = b.id LIMIT ?, ?`;
    const [result] = await pool.query(sql, [itemStartNum, itemNum]);
    return result;
}

houseQuery.allHouseCount = async ()=>{
    let sql = "SELECT COUNT(*) as total_count FROM house";
    const [result] = await pool.query(sql);
    return result[0].total_count;
}

houseQuery.checkBooking = async (dates) => {
    let sql = "SELECT house_id FROM nice_stay.booking WHERE (checkin_date >= ? AND checkin_date < ?) OR (checkout_date > ? AND checkout_date <= ?) OR (checkin_date < ? AND  checkout_date > ?)";
    const [result] = await pool.query(sql, dates);
    const bookedHouseID =  result.map(item=>item.house_id)
    return bookedHouseID;
}

houseQuery.checkAmentity = async (amenity_id) => {
    let sql = "SELECT house_id, json_arrayagg(amenity_id) as amenity_array FROM house_amenity WHERE amenity_id IN (?) GROUP BY house_id; ";
    const [result] = await pool.query(sql, [amenity_id]);
    console.log('amenity search');
    console.log(result);
    const house_id = [];
    result.forEach(item => {
        if(item.amenity_array.length === amenity_id.length){
            house_id.push(item.house_id);
        }
    })
    return house_id;
}

houseQuery.houseSearch = async (selectConditions, queryCondition, paging, itemNum)=>{
    let prefix_sql = "SELECT a.*, b.name as city_name FROM  (";
    let suffix_sql = ") a left join city b on a.city_id = b.id";
    let middle_sql = "SELECT * FROM house ";
    let sql_binding = [];
    let condition_count = selectConditions.length - 1;
    let startDate;
    let endDate;
    let startPrice;
    let endPrice;
    let itemStartNum = paging * 6;
    let count=0;
    for(let i=0; i<selectConditions.length; i++){
        let selectionCondition = selectConditions[i];
        switch (selectionCondition[0]){
            case 'area':
                if(count == 0){
                    middle_sql += "WHERE "
                }
                middle_sql += 'city_id=?';
                sql_binding.push(selectionCondition[1]);
                count ++;
                if(i !== condition_count){
                    middle_sql += ' AND ';
                }
                break;
            case 'startDate':
                startDate = selectionCondition[1];
                break;
            case 'endDate':
                endDate = selectionCondition[1];
                const bookHouseID = await houseQuery.checkBooking([startDate, endDate, startDate, endDate, startDate, endDate]);
                if(bookHouseID.length !== 0){
                    if(count == 0){
                        middle_sql += "WHERE "
                    }
                    middle_sql += 'id NOT in (?)';
                    sql_binding.push(bookHouseID);
                    count ++;
                    if(i !== condition_count){
                        middle_sql += ' AND ';
                    }
                }
                break;
            case 'people':
                if(selectionCondition[1] != 0){
                    if(count == 0){
                        middle_sql += "WHERE "
                    }
                    middle_sql += 'people_count>=?';
                    sql_binding.push(selectionCondition[1]);
                    count ++;
                    if(i !== condition_count){
                        middle_sql += ' AND ';
                    }
                }
                break;
            case 'pet':
                if(count == 0){
                    middle_sql += "WHERE "
                }
                middle_sql += 'pet=1';
                count ++;
                if(i !== condition_count){
                    middle_sql += ' AND ';
                }
                break;
            case 'start_price':
                startPrice = selectionCondition[1];
                break;
            case 'end_price':
                endPrice = selectionCondition[1];
                if(count == 0){
                    middle_sql += "WHERE "
                }
                middle_sql += '(price BETWEEN ? AND ?)';
                sql_binding.push(startPrice);
                sql_binding.push(endPrice);
                count ++;
                if(i !== condition_count){
                    middle_sql += ' AND ';
                }
                break;
            case 'house_type':
                if(count == 0){
                    middle_sql += "WHERE "
                }
                middle_sql += 'category_id IN (?)';
                sql_binding.push(selectionCondition[1]);
                count ++;
                if(i !== condition_count){
                    middle_sql += ' AND ';
                }
                break;
            case 'amenity':
                const house_id = await houseQuery.checkAmentity(selectionCondition[1]);
                if(house_id.length !== 0){
                    if(count == 0){
                        middle_sql += "WHERE "
                    }
                    middle_sql += 'id in (?)';
                    sql_binding.push(house_id);
                    count ++;
                    if(i !== condition_count){
                        middle_sql += ' AND ';
                    }
                }
                break;
            default:
                break;
        }
    }
    

    let sql = prefix_sql+middle_sql+suffix_sql;

    //check if order consition is needed
    if(queryCondition === 1){
        sql += " ORDER BY price DESC, id";
    }else if(queryCondition === 2){
        sql += " ORDER BY price ASC, id";
    }
    const [houseSelect] = await pool.query(sql, sql_binding);
    let houseCount = houseSelect.length;
    sql += " LIMIT ?, ?";
    sql_binding.push(itemStartNum);
    sql_binding.push(itemNum);
    // console.log(sql);
    // console.log(sql_binding);
    const [result] = await pool.query(sql, sql_binding);

    let searchData = {data:result, houseCount}
    return searchData;
}

houseQuery.houseDatail = async (house_id) => {
    let sql = "SELECT a.*, b.name as city_name, c.name as category_name, d.image_url as sideImage_url FROM house a left join city b on a.city_id = b.id left join category c on a.category_id = c.id left join image d on a.id = d.house_id where a.id=?";
    const [result] = await pool.query(sql, house_id);
    return result;
}

houseQuery.houseAmentity = async (house_id) => {
    let sql = "SELECT b.name, b.icon_url FROM (SELECT amenity_id FROM house_amenity WHERE house_id=?) a left join amenity b on a.amenity_id = b.id;"
    const [result] = await pool.query({sql, rowsAsArray: true}, house_id);
    return result;
}

houseQuery.houseReview = async (values) =>{
    let sql = "SELECT a.comment, a.created_at, round(b.ave_landload_rate, 1) as landlord_ave, round(c.ave_house, 1) as house_ave, d.name as landlord_name, e.name as renter_name  FROM (SELECT * FROM nice_stay.review WHERE house_id=?) as a left join (SELECT landlord_id, AVG(landlord_rate) as ave_landload_rate FROM nice_stay.review WHERE landlord_id=? group by landlord_id) as b on a.landlord_id = b.landlord_id left join (SELECT house_id, AVG(house_rate) as ave_house FROM nice_stay.review WHERE house_id =?) c on a.house_id=c.house_id left join user d on a.landlord_id = d.id left join user e on a.renter_id = e.id";
    const [result] = await pool.query(sql, values); 
    return result;
}

houseQuery.getHouseID = async ()=>{
    let sql = "SELECT id FROM house";
    const [result] = await pool.query({sql, rowsAsArray: true}); 
    return result;
}

houseQuery.insertAmenity = async (values)=>{
    let sql = "INSERT INTO house_amenity (house_id, amenity_id) VALUES ?"
    await pool.query(sql, [values]);
}


module.exports = houseQuery;

