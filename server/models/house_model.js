const { pool } = require('./mysqlcon');

const houseQuery = {};

houseQuery.createHouse = async (values)=>{
    let sql = "INSERT INTO house (title, category_id, description, price, tax_percentage, cleanfee_percentage, people_count, room_count, bed_count, bathroom_count, landlord_id, city_id, region, address, latitude, longitude, refund_type, refund_duration, image_url, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CONVERT_TZ(NOW(3),'SYSTEM','Asia/Taipei'),CONVERT_TZ(NOW(3),'SYSTEM','Asia/Taipei'))"
    const [result] = await pool.query(sql, values);
    return result;
}

houseQuery.selectAllHouse = async ()=>{
    let sql = "SELECT a.id, a.title, a.people_count, a.room_count, a.bed_count, a.bathroom_count, b.name as city_name, a.price, a.image_url FROM house a left join city b on a.city_id = b.id"
    const [result] = await pool.query(sql);
    return result;
}

houseQuery.checkBooking = async (dates) => {
    let sql = "SELECT house_id FROM nice_stay.booking WHERE (checkin_date >= ? AND checkin_date < ?) OR (checkout_date > ? AND checkout_date <= ?) OR (checkin_date < ? AND  checkout_date > ?)";
    const [result] = await pool.query(sql, dates);
    const bookedHouseID =  result.map(item=>item.house_id)
    return bookedHouseID;
}

houseQuery.houseSearch = async (selectConditions)=>{
    let prefix_sql = "SELECT a.*, b.name as city_name FROM  (";
    let suffix_sql = ") a left join city b on a.city_id = b.id;";
    let middle_sql = "SELECT * FROM house ";
    let sql_binding = [];
    let condition_count = selectConditions.length - 1;
    let startDate;
    let endDate;
    let count=0;
    for(let i=0; i<selectConditions.length; i++){
        switch (selectConditions[i][0]){
            case 'area':
                if(count == 0){
                    middle_sql += "WHERE "
                }
                middle_sql += 'city_id=?';
                sql_binding.push(selectConditions[i][1]);
                count ++;
                if(i !== condition_count){
                    middle_sql += ' AND ';
                }
                break;
            case 'startDate':
                startDate = selectConditions[i][1];
                break;
            case 'endDate':
                endDate = selectConditions[i][1];
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
                if(selectConditions[i][1] != 0){
                    if(count == 0){
                        middle_sql += "WHERE "
                    }
                    middle_sql += 'people_count>=?';
                    sql_binding.push(selectConditions[i][1]);
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
            default:
                break;
        }
    }
    let sql = prefix_sql+middle_sql+suffix_sql;
    console.log(sql);
    console.log(sql_binding);
    const [result] = await pool.query(sql, sql_binding);
    console.log(result);
    return result;
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

module.exports = houseQuery;

