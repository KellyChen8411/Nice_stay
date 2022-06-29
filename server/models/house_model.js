const { pool } = require("./mysqlcon");

const houseQuery = {};

houseQuery.createHouse = async (house_data, image_url, amenity_item) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    let createTime = Date.now();
    house_data.created_at = createTime;
    house_data.updated_at = createTime;
    const [houseResult] = await conn.query(
      "INSERT INTO house SET ?",
      house_data
    );
    const houde_id = houseResult.insertId;

    //create image and amenity data
    let image_data = [];
    image_url.forEach((imageUrl) => {
      let temp = [houde_id];
      temp.push(imageUrl);
      image_data.push(temp);
    });

    let amenity_data = [];
    amenity_item.forEach((item) => {
      let temp = [houde_id];
      temp.push(item);
      amenity_data.push(temp);
    });

    const [imageResult] = await conn.query(
      "INSERT INTO image (house_id, image_url) VALUES ?",
      [image_data]
    );
    // console.log(imageResult);
    const [amenityResult] = await conn.query(
      "INSERT INTO house_amenity (house_id, amenity_id) VALUES ?",
      [amenity_data]
    );
    // console.log(amenityResult);

    await conn.query("COMMIT");
    return houde_id;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

houseQuery.selectAllHouse = async (paging, itemNum) => {
  let itemStartNum = paging * 6;
  let sql = `SELECT a.id, a.title, a.people_count, a.room_count, a.bed_count, a.created_at , a.bathroom_count, b.name as city_name, a.price, a.image_url FROM house a left join city b on a.city_id = b.id LIMIT ?, ?`;
  const [result] = await pool.query(sql, [itemStartNum, itemNum]);
  return result;
};

houseQuery.allHouseCount = async () => {
  let sql = "SELECT COUNT(*) as total_count FROM house";
  const [result] = await pool.query(sql);
  return result[0].total_count;
};

houseQuery.checkBooking = async (dates) => {
  let sql =
    "SELECT house_id FROM nice_stay.booking WHERE (checkin_date >= ? AND checkin_date < ?) OR (checkout_date > ? AND checkout_date <= ?) OR (checkin_date < ? AND  checkout_date > ?)";
  const [result] = await pool.query(sql, dates);
  const bookedHouseID = result.map((item) => item.house_id);
  return bookedHouseID;
};

houseQuery.checkAmentity = async (amenity_id) => {
  let sql =
    "SELECT house_id, json_arrayagg(amenity_id) as amenity_array FROM house_amenity WHERE amenity_id IN (?) GROUP BY house_id; ";
  const [result] = await pool.query(sql, [amenity_id]);
  console.log("amenity search");
  console.log(result);
  const house_id = [];
  result.forEach((item) => {
    if (item.amenity_array.length === amenity_id.length) {
      house_id.push(item.house_id);
    }
  });
  return house_id;
};

houseQuery.houseSearch = async (
  selectConditions,
  queryCondition,
  paging,
  itemNum
) => {
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
  let count = 0;
  for (let i = 0; i < selectConditions.length; i++) {
    let selectionCondition = selectConditions[i];
    switch (selectionCondition[0]) {
      case "area":
        if (count == 0) {
          middle_sql += "WHERE ";
        }
        middle_sql += "city_id=?";
        sql_binding.push(selectionCondition[1]);
        count++;
        if (i !== condition_count) {
          middle_sql += " AND ";
        }
        break;
      case "startDate":
        startDate = selectionCondition[1];
        break;
      case "endDate":
        endDate = selectionCondition[1];
        const bookHouseID = await houseQuery.checkBooking([
          startDate,
          endDate,
          startDate,
          endDate,
          startDate,
          endDate,
        ]);
        if (bookHouseID.length !== 0) {
          if (count == 0) {
            middle_sql += "WHERE ";
          }
          middle_sql += "id NOT in (?)";
          sql_binding.push(bookHouseID);
          count++;
          if (i !== condition_count) {
            middle_sql += " AND ";
          }
        }
        break;
      case "people":
        if (selectionCondition[1] != 0) {
          if (count == 0) {
            middle_sql += "WHERE ";
          }
          middle_sql += "people_count>=?";
          sql_binding.push(selectionCondition[1]);
          count++;
          if (i !== condition_count) {
            middle_sql += " AND ";
          }
        }
        break;
      case "pet":
        if (count == 0) {
          middle_sql += "WHERE ";
        }
        middle_sql += "pet=1";
        count++;
        if (i !== condition_count) {
          middle_sql += " AND ";
        }
        break;
      case "start_price":
        startPrice = selectionCondition[1];
        break;
      case "end_price":
        endPrice = selectionCondition[1];
        if (count == 0) {
          middle_sql += "WHERE ";
        }
        middle_sql += "(price BETWEEN ? AND ?)";
        sql_binding.push(startPrice);
        sql_binding.push(endPrice);
        count++;
        if (i !== condition_count) {
          middle_sql += " AND ";
        }
        break;
      case "house_type":
        if (count == 0) {
          middle_sql += "WHERE ";
        }
        middle_sql += "category_id IN (?)";
        sql_binding.push(selectionCondition[1]);
        count++;
        if (i !== condition_count) {
          middle_sql += " AND ";
        }
        break;
      case "amenity":
        const house_id = await houseQuery.checkAmentity(selectionCondition[1]);
        if (house_id.length !== 0) {
          if (count == 0) {
            middle_sql += "WHERE ";
          }
          middle_sql += "id in (?)";
          sql_binding.push(house_id);
          count++;
          if (i !== condition_count) {
            middle_sql += " AND ";
          }
        }
        break;
      default:
        break;
    }
  }

  let sql = prefix_sql + middle_sql + suffix_sql;

  //check if order consition is needed
  if (queryCondition === 1) {
    sql += " ORDER BY price DESC, id";
  } else if (queryCondition === 2) {
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

  let searchData = { data: result, houseCount };
  return searchData;
};

houseQuery.houseDatail = async (house_id) => {
  let sql =
    "SELECT a.*, b.name as city_name, c.name as category_name, d.image_url as sideImage_url, e.name AS landlord_name FROM house a left join city b on a.city_id = b.id left join category c on a.category_id = c.id left join image d on a.id = d.house_id left join user e ON a.landlord_id=e.id where a.id=?";
  const [result] = await pool.query(sql, house_id);
  return result;
};

houseQuery.houseAmentity = async (house_id) => {
  let sql =
    "SELECT b.name, b.icon_url FROM (SELECT amenity_id FROM house_amenity WHERE house_id=?) a left join amenity b on a.amenity_id = b.id;";
  const [result] = await pool.query({ sql, rowsAsArray: true }, house_id);
  return result;
};

houseQuery.houseReview = async (values) => {
  let sql =
  "SELECT a.comment, a.created_at, round(c.ave_house, 1) as house_ave, d.name as landlord_name, e.name as renter_name  FROM (SELECT review.comment, review.house_rate, review.landlord_rate, review.created_at, booking.house_id, booking.renter_id, booking.landlord_id FROM review as review left join booking AS booking ON review.booking_id= booking.id WHERE booking.house_id=?) as a left join (SELECT g.house_id, AVG(g.house_rate) as ave_house FROM (SELECT review.comment, review.house_rate, review.landlord_rate, review.created_at, booking.house_id, booking.renter_id, booking.landlord_id FROM review as review left join booking AS booking ON review.booking_id= booking.id WHERE booking.house_id =?) g) c on a.house_id=c.house_id left join user d on a.landlord_id = d.id left join user e on a.renter_id = e.id";
    // "SELECT a.comment, a.created_at, round(c.ave_house, 1) as house_ave, d.name as landlord_name, e.name as renter_name  FROM (SELECT * FROM nice_stay.review WHERE house_id=?) as a left join (SELECT house_id, AVG(house_rate) as ave_house FROM nice_stay.review WHERE house_id =?) c on a.house_id=c.house_id left join user d on a.landlord_id = d.id left join user e on a.renter_id = e.id";
  // "SELECT a.comment, a.created_at, round(b.ave_landload_rate, 1) as landlord_ave, round(c.ave_house, 1) as house_ave, d.name as landlord_name, e.name as renter_name  FROM (SELECT * FROM nice_stay.review WHERE house_id=?) as a left join (SELECT landlord_id, AVG(landlord_rate) as ave_landload_rate FROM nice_stay.review WHERE landlord_id=? group by landlord_id) as b on a.landlord_id = b.landlord_id left join (SELECT house_id, AVG(house_rate) as ave_house FROM nice_stay.review WHERE house_id =?) c on a.house_id=c.house_id left join user d on a.landlord_id = d.id left join user e on a.renter_id = e.id";
  const [result] = await pool.query(sql, values);
  return result;
};

houseQuery.landLordRate = async (landlord_id) => {
  let sql =
    "SELECT a.landlord_id, round(AVG(a.landlord_rate),1) as ave_landload_rate FROM (SELECT review.comment, review.house_rate, review.landlord_rate, review.created_at, booking.house_id, booking.renter_id, booking.landlord_id FROM review as review left join booking AS booking ON review.booking_id= booking.id) a WHERE a.landlord_id=? group by a.landlord_id";
  // "SELECT round(AVG(landlord_rate),1) as ave_landload_rate FROM nice_stay.review WHERE landlord_id=? group by landlord_id"
  const [result] = await pool.query(sql, landlord_id);
  return result;
};

// houseQuery.getHouseID = async () => {
//   let sql = "SELECT id FROM house";
//   const [result] = await pool.query({ sql, rowsAsArray: true });
//   return result;
// };

// houseQuery.insertAmenity = async (values) => {
//   let sql = "INSERT INTO house_amenity (house_id, amenity_id) VALUES ?";
//   await pool.query(sql, [values]);
// };

houseQuery.selectTrip = async (renter_id) => {
  let sql =
    "SELECT d.id AS booking_id, d.landlord_id,d.checkin_date, d.checkout_date, d.refund_duetime, d.is_refund, d.renter_id , e.* FROM booking d left join (SELECT a.id as house_id, a.title, a.image_url, b.name AS city_name, c.name AS landloard_name FROM house a left join city b ON a.city_id=b.id left join user c ON a.landlord_id=c.id) e ON d.house_id=e.house_id WHERE d.renter_id=? order by d.checkin_date;";
  const [result] = await pool.query(sql, renter_id);
  return result;
};

houseQuery.getRefundDue = async (booking_id) => {
  let sql = "SELECT refund_duetime FROM booking WHERE id=?"
  const [result] = await pool.query(sql, booking_id);
  return result[0].refund_duetime;
}

houseQuery.updateBooking = async (booking_id) => {
  let sql = "UPDATE booking SET is_refund=1 WHERE id=?";
  await pool.query(sql, booking_id);
}

houseQuery.leftreview = async (reviewInfo) => {
  let sql = "INSERT INTO review SET ?";
  await pool.query(sql, reviewInfo);
}

houseQuery.getReview = async ()=> {
  let sql  = "SELECT * FROM review";
  const [result] = await pool.query(sql);
  return result;
}

module.exports = houseQuery;
