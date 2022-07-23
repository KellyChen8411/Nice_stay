const { pool } = require("./mysqlcon");

const houseQuery = {};

houseQuery.createHouse = async (houseData, imageData, amenityData) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    let createTime = Date.now();
    houseData.created_at = createTime;
    houseData.updated_at = createTime;

    //insert into house table
    const [houseResult] = await conn.query(
      "INSERT INTO house SET ?",
      houseData
    );
    const houdeID = houseResult.insertId;

    //create image and amenity data
    let imageURLs = [];
    imageData.forEach((imageUrl) => {
      let temp = [houdeID];
      temp.push(imageUrl);
      imageURLs.push(temp);
    });

    let amenityList = [];
    amenityData.forEach((item) => {
      let temp = [houdeID];
      temp.push(item);
      amenityList.push(temp);
    });

    //insert into image table
    await conn.query("INSERT INTO image (house_id, image_url) VALUES ?", [
      imageURLs,
    ]);

    //insert into house_amenity table
    await conn.query(
      "INSERT INTO house_amenity (house_id, amenity_id) VALUES ?",
      [amenityList]
    );

    await conn.query("COMMIT");
    return houdeID;
  } catch (error) {
    await conn.query("ROLLBACK");
    throw error;
  } finally {
    await conn.release();
  }
};

houseQuery.updateHouse = async (
  houseID,
  updateHouseData,
  sideImageData,
  updateSideImage,
  amenityData
) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    //update house table
    await conn.query("UPDATE house SET ? WHERE id=?", [
      updateHouseData,
      houseID,
    ]);

    //update (side)image table
    if (updateSideImage) {
      for (let i = 0; i < sideImageData.length; i++) {
        await conn.query("UPDATE image SET image_url=? WHERE image_url=?", [
          sideImageData[i][0],
          sideImageData[i][1],
        ]);
      }
    }

    //delete amenity table
    let [idList] = await conn.query(
      "SELECT JSON_ARRAYAGG(id) AS id_list FROM house_amenity WHERE house_id=?",
      houseID
    );
    await conn.query("DELETE FROM house_amenity WHERE id in (?)", [
      idList[0].id_list,
    ]);
    //reinsert into amenity table
    await conn.query(
      "INSERT INTO house_amenity (house_id, amenity_id) VALUES ?",
      [amenityData]
    );

    await conn.query("COMMIT");
    return;
  } catch (error) {
    await conn.query("ROLLBACK");
    throw error;
  } finally {
    await conn.release();
  }
};

houseQuery.deleteHouse = async (houseID) => {
  const conn = await pool.getConnection();
  console.log("enter delete house model");
  try {
    await conn.query("START TRANSACTION");

    //delete data from image table
    let [idListImage] = await conn.query(
      "SELECT JSON_ARRAYAGG(id) AS id_list FROM image WHERE house_id=?",
      houseID
    );
    idListImage = idListImage[0].id_list;
    await conn.query("DELETE FROM image WHERE id in (?)", [idListImage]);
    //delete data from amenity table
    let [idListAmenity] = await conn.query(
      "SELECT JSON_ARRAYAGG(id) AS id_list FROM house_amenity WHERE house_id=?",
      houseID
    );
    idListAmenity = idListAmenity[0].id_list;
    await conn.query("DELETE FROM house_amenity WHERE id in (?)", [
      idListAmenity,
    ]);
    //delete data from house table
    await conn.query("DELETE FROM house WHERE id=?", houseID);

    //select images for house
    let [images] = await pool.query(
      "SELECT a.id, a.image_url AS mainimage_list, b.sideimage_list FROM house a left join (SELECT house_id, JSON_ARRAYAGG(image_url) AS sideimage_list FROM image group by house_id) b ON a.id=b.house_id WHERE a.id=?",
      houseID
    );

    images = [images[0].mainimage_list, ...images[0].sideimage_list];

    await conn.query("COMMIT");
    return images;
  } catch (error) {
    await conn.query("ROLLBACK");
    throw error;
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
    "SELECT house_id FROM booking WHERE ((checkin_date >= ? AND checkin_date < ?) OR (checkout_date > ? AND checkout_date <= ?) OR (checkin_date < ? AND  checkout_date > ?)) AND is_refund=0";
  const [result] = await pool.query(sql, dates);
  const bookedHouseID = result.map((item) => item.house_id);
  return bookedHouseID;
};

houseQuery.checkAmentity = async (amenityIDs) => {
  let sql =
    "SELECT house_id, json_arrayagg(amenity_id) as amenity_array FROM house_amenity WHERE amenity_id IN (?) GROUP BY house_id; ";
  const [result] = await pool.query(sql, [amenityIDs]);

  const houseIDs = [];
  result.forEach((item) => {
    if (item.amenity_array.length === amenityIDs.length) {
      houseIDs.push(item.house_id);
    }
  });
  return houseIDs;
};

houseQuery.houseSearch = async (
  selectConditions,
  queryCondition,
  paging,
  itemNum
) => {
  let prefixSQL = "SELECT a.*, b.name as city_name FROM  (";
  let suffixSQL = ") a left join city b on a.city_id = b.id";
  let middleSQL = "SELECT * FROM house WHERE 1=1";
  let sqlBinding = [];
  let startDate;
  let endDate;
  let startPrice;
  let endPrice;
  let itemStartNum = paging * 6;
  for (let i = 0; i < selectConditions.length; i++) {
    let selectionCondition = selectConditions[i];
    switch (selectionCondition[0]) {
      case "area":
        middleSQL += " AND city_id=?";
        sqlBinding.push(selectionCondition[1]);
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
          middleSQL += " AND id NOT in (?)";
          sqlBinding.push(bookHouseID);
        }
        break;
      case "people":
        if (selectionCondition[1] != 0) {
          middleSQL += " AND people_count>=?";
          sqlBinding.push(selectionCondition[1]);
        }
        break;
      case "pet":
        middleSQL += " AND pet=1";
        break;
      case "start_price":
        startPrice = selectionCondition[1];
        break;
      case "end_price":
        endPrice = selectionCondition[1];
        middleSQL += " AND (price BETWEEN ? AND ?)";
        sqlBinding.push(startPrice);
        sqlBinding.push(endPrice);
        break;
      case "house_type":
        middleSQL += " AND category_id IN (?)";
        sqlBinding.push(selectionCondition[1]);
        break;
      case "amenity":
        const houseIDs = await houseQuery.checkAmentity(selectionCondition[1]);
        if (houseIDs.length !== 0) {
          middleSQL += " AND id in (?)";
          sqlBinding.push(houseIDs);
        }
        break;
      default:
        break;
    }
  }

  let sql = prefixSQL + middleSQL + suffixSQL;

  //check if order consition is needed
  if (queryCondition === 1) {
    sql += " ORDER BY price DESC, id";
  } else if (queryCondition === 2) {
    sql += " ORDER BY price ASC, id";
  }

  const [houseSelect] = await pool.query(sql, sqlBinding);
  let houseCount = houseSelect.length;
  sql += " LIMIT ?, ?";
  sqlBinding.push(itemStartNum);
  sqlBinding.push(itemNum);

  const [result] = await pool.query(sql, sqlBinding);

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
  // "SELECT a.comment, a.created_at, round(c.ave_house, 1) as house_ave, d.name as landlord_name, e.name as renter_name  FROM (SELECT * FROM review WHERE house_id=?) as a left join (SELECT house_id, AVG(house_rate) as ave_house FROM review WHERE house_id =?) c on a.house_id=c.house_id left join user d on a.landlord_id = d.id left join user e on a.renter_id = e.id";
  // "SELECT a.comment, a.created_at, round(b.ave_landload_rate, 1) as landlord_ave, round(c.ave_house, 1) as house_ave, d.name as landlord_name, e.name as renter_name  FROM (SELECT * FROM review WHERE house_id=?) as a left join (SELECT landlord_id, AVG(landlord_rate) as ave_landload_rate FROM review WHERE landlord_id=? group by landlord_id) as b on a.landlord_id = b.landlord_id left join (SELECT house_id, AVG(house_rate) as ave_house FROM review WHERE house_id =?) c on a.house_id=c.house_id left join user d on a.landlord_id = d.id left join user e on a.renter_id = e.id";
  const [result] = await pool.query(sql, values);
  return result;
};

houseQuery.landLordRate = async (landlord_id) => {
  let sql =
    "SELECT a.landlord_id, round(AVG(a.landlord_rate),1) as ave_landload_rate FROM (SELECT review.comment, review.house_rate, review.landlord_rate, review.created_at, booking.house_id, booking.renter_id, booking.landlord_id FROM review as review left join booking AS booking ON review.booking_id= booking.id) a WHERE a.landlord_id=? group by a.landlord_id";
  // "SELECT round(AVG(landlord_rate),1) as ave_landload_rate FROM review WHERE landlord_id=? group by landlord_id"
  const [result] = await pool.query(sql, landlord_id);
  return result;
};

houseQuery.selectTrip = async (user_id, requestType) => {
  let sql;
  if (requestType === "trip") {
    sql =
      "SELECT d.id AS booking_id, d.landlord_id,d.checkin_date, d.checkout_date, d.refund_duetime, d.is_refund, d.renter_id , e.* FROM booking d left join (SELECT a.id as house_id, a.title, a.image_url, b.name AS city_name, c.name AS landloard_name FROM house a left join city b ON a.city_id=b.id left join user c ON a.landlord_id=c.id) e ON d.house_id=e.house_id WHERE d.renter_id=? order by d.checkin_date";
  } else {
    sql =
      "SELECT d.id AS booking_id, d.landlord_id,d.checkin_date, d.checkout_date, d.refund_duetime, d.is_refund, d.renter_id , e.*, f.name as renter_name FROM booking d left join (SELECT a.id as house_id, a.title, a.image_url, b.name AS city_name, c.name AS landloard_name FROM house a left join city b ON a.city_id=b.id left join user c ON a.landlord_id=c.id) e ON d.house_id=e.house_id left join user f ON d.renter_id=f.id WHERE d.landlord_id=? order by d.checkin_date";
  }
  const [result] = await pool.query(sql, user_id);
  return result;
};

houseQuery.getRefundDue = async (booking_id) => {
  let sql = "SELECT refund_duetime FROM booking WHERE id=?";
  const [result] = await pool.query(sql, booking_id);
  return result[0].refund_duetime;
};

houseQuery.updateBooking = async (booking_id) => {
  let sql = "UPDATE booking SET is_refund=1 WHERE id=?";
  await pool.query(sql, booking_id);
};

houseQuery.leftreview = async (reviewInfo) => {
  let sql = "INSERT INTO review SET ?";
  await pool.query(sql, reviewInfo);
};

houseQuery.getReview = async () => {
  let sql = "SELECT * FROM review";
  const [result] = await pool.query(sql);
  return result;
};

houseQuery.landlordHouse = async (landlord_id) => {
  let sql =
    "SELECT a.*, b.name AS city_name FROM house a left join city b on a.city_id=b.id WHERE a.landlord_id=?";
  const [result] = await pool.query(sql, landlord_id);
  return result;
};

houseQuery.houseHistroyData = async (landlord_id, house_id) => {
  let sql =
    "SELECT b.*, c.amenity_list, d.sideimage_list FROM (SELECT a.* from (SELECT * FROM house WHERE landlord_id=?) a WHERE a.id=?) b left join (SELECT house_id, JSON_ARRAYAGG(amenity_id) AS amenity_list FROM house_amenity group by house_id) c on b.id=c.house_id left join (SELECT house_id, JSON_ARRAYAGG(image_url) AS sideimage_list FROM image group by house_id) d ON b.id=d.house_id";
  const [result] = await pool.query(sql, [landlord_id, house_id]);
  return result;
};

houseQuery.updateSideImage = async (new_url, old_url) => {
  let sql = "UPDATE image SET image_url=? WHERE image_url=?";
  const [result] = await pool.query(sql, [new_url, old_url]);
  return result;
};

houseQuery.deleteAmenity = async (house_id) => {
  let sql = "DELETE FROM house_amenity WHERE house_id=?";
  const [result] = await pool.query(sql, house_id);
  return result;
};

houseQuery.likeHouse = async (user_id, house_id) => {
  let sql = "INSERT INTO favorite (renter_id, house_id) VALUES (?, ?)";
  const [result] = await pool.query(sql, [user_id, house_id]);
  return result;
};

houseQuery.findFavoriteID = async (user_id, house_id) => {
  let sql = "SELECT id FROM favorite WHERE renter_id=? AND house_id=?";
  const [result] = await pool.query(sql, [user_id, house_id]);
  return result[0].id;
};

houseQuery.dislikeHouse = async (favorite_id) => {
  let sql = "DELETE FROM favorite WHERE id=?";
  const [result] = await pool.query(sql, favorite_id);
  return result;
};

houseQuery.selectUserFavoriteHouse = async (user_id) => {
  let sql =
    "SELECT json_arrayagg(house_id) AS id_list FROM favorite WHERE renter_id=?";
  const [result] = await pool.query(sql, user_id);
  return result[0].id_list;
};

houseQuery.selectUserFavoriteHouseDetail = async (user_id) => {
  let sql =
    "SELECT b.id, b.title, b.price, b.image_url, c.name AS city_name FROM (SELECT house_id FROM favorite WHERE renter_id=?) a left join house b ON a.house_id=b.id left join city c ON b.city_id=c.id";
  const [result] = await pool.query(sql, user_id);
  return result;
};

houseQuery.houseBookedDate = async (house_id) => {
  let sql =
    "SELECT house_id, json_arrayagg(checkin_date) as checkindate_list, json_arrayagg(checkout_date) as checkoutdate_list FROM booking WHERE house_id=? and is_refund=0 group by house_id";
  const [result] = await pool.query(sql, house_id);
  return result;
};

houseQuery.checkBookingForDelete = async (house_id, today) => {
  let sql =
    "SELECT id FROM booking WHERE house_id=? AND (checkin_date>=? OR (checkin_date<? AND checkout_date>?))";
  const [result] = await pool.query(sql, [house_id, today, today, today]);
  return result;
};

module.exports = houseQuery;
