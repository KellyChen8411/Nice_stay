const { pool } = require('./mysqlcon');

const houseQuery = {};

houseQuery.createHouse = async (values)=>{
    let sql = "INSERT INTO house (title, category_id, description, price, tax_percentage, cleanfee_percentage, people_count, room_count, bed_count, bathroom_count, landlord_id, city_id, region, address, latitude, longitude, refund_type, refund_duration, image_url, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CONVERT_TZ(NOW(3),'SYSTEM','Asia/Taipei'),CONVERT_TZ(NOW(3),'SYSTEM','Asia/Taipei'))"
    const [result] = await pool.query(sql, values);
    return result;
}

houseQuery.selectAllHouse = async ()=>{
    let sql = "SELECT a.id, a.title, a.people_count, a.room_count, a.bed_count, a.bathroom_count, b.name as city, a.price, a.image_url FROM house a left join city b on a.city_id = b.id"
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
    let middle_sql = "SELECT * FROM house WHERE ";
    let sql_binding = [];
    let condition_count = selectConditions.length - 1;
    let startDate;
    let endDate;
    for(let i=0; i<selectConditions.length; i++){
        switch (selectConditions[i][0]){
            case 'area':
                middle_sql += 'city_id=?';
                sql_binding.push(selectConditions[i][1]);
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
                middle_sql += 'id NOT in (?)';
                sql_binding.push(bookHouseID);
                if(i !== condition_count){
                    middle_sql += ' AND ';
                }
                break;
            case 'people':
                if(selectConditions[i][1] != 0){
                    middle_sql += 'people_count>=?';
                    sql_binding.push(selectConditions[i][1]);
                    if(i !== condition_count){
                        middle_sql += ' AND ';
                    }
                }
                break;
            case 'pet':
                middle_sql += 'pet=1';
                if(i !== condition_count){
                    middle_sql += ' AND ';
                }
                break;
            default:
                break;
        }
    }
    // console.log(middle_sql);
    // console.log(sql_binding);
    let sql = prefix_sql+middle_sql+suffix_sql;
    const [result] = await pool.query(sql, sql_binding);
    // console.log(result);
    return result;
}

module.exports = houseQuery;

