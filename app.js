require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { pool } = require("./server/models/mysqlcon");

app.set("view engine", "pug");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API routes
app.use("/api/" + process.env.API_VERSION, [
  require("./server/routes/house_route"),
  require("./server/routes/city_route"),
  require("./server/routes/amenity_route"),
  require("./server/routes/user_route"),
  require("./server/routes/checkout_route"),
]);

//socket.io
io.on("connection", (socket) => {
  let user_room;
  let owner_id; //user id for chatroom owner
  let owner_role; //role for chatroom owner (renter or landlord)
  let sql;

  //user join room
  socket.on("user_join", async (userInfo, callback) => {
    user_room = userInfo.user_room;
    socket.join(userInfo.user_room);

    //get users in chat room
    const owner = userInfo.user_room.split("_");
    owner_id = owner[0];
    owner_role = owner[1];
    sql =
      "select y.*, z.read_status FROM (SELECT b.name as user_name, c.receiver_id FROM  user b right join (SELECT distinct a.receiver_id FROM (SELECT receiver_id as receiver_id FROM message WHERE sender_id=? AND sender_role=? union all SELECT sender_id as receiver_id FROM message WHERE receiver_id=? AND receiver_role=?) a) c ON b.id=c.receiver_id) y left join (SELECT sender_id, count(*) read_status FROM message WHERE receiver_id=? and receiver_role=? and status=0 group by sender_id) z ON y.receiver_id=z.sender_id";
    const [receiver] = await pool.query(sql, [
      owner_id,
      owner_role,
      owner_id,
      owner_role,
      owner_id,
      owner_role,
    ]);

    //get messages with first user in chat room
    if (receiver.length === 0) {
      //no message
      return callback({ receiver });
    } else {
      let talker_id = receiver[0].receiver_id;
      sql =
        "SELECT a.name, b.sender_id, b.content, b.created_at FROM user a right join (SELECT * FROM message WHERE (sender_id=? and receiver_id=? and sender_role=?) OR (sender_id=? and receiver_id=? and receiver_role=?)) b ON a.id=b.sender_id order by created_at";
      const [message] = await pool.query(sql, [
        owner_id,
        talker_id,
        owner_role,
        talker_id,
        owner_id,
        owner_role,
      ]);
      callback({ receiver, message });
    }
  });

  //get message with talker
  socket.on("getMessage", async (userInfo, callback) => {
    let { owner_id, talker_id, owner_role } = userInfo;
    sql =
      "SELECT a.name, b.sender_id, b.content, b.created_at FROM user a right join (SELECT * FROM message WHERE (sender_id=? and receiver_id=? and sender_role=?) OR (sender_id=? and receiver_id=? and receiver_role=?)) b ON a.id=b.sender_id order by created_at";
    const [message] = await pool.query(sql, [
      owner_id,
      talker_id,
      owner_role,
      talker_id,
      owner_id,
      owner_role,
    ]);
    callback({ message });
  });

  //sendPrivateMessage
  socket.on("privateMessage", async (messageInfo) => {
    const {
      content,
      owner_id,
      owner_role,
      talker_id,
      talker_role,
      owner_name,
      created_at,
    } = messageInfo;
    //save message in DB
    sql =
      "INSERT INTO message (sender_id, receiver_id, content, sender_role, receiver_role, status, created_at) VALUES (?,?,?,?,?,0,?)";
    let [insertMsg] = await pool.query(sql, [
      owner_id,
      talker_id,
      content,
      owner_role,
      talker_role,
      created_at,
    ]);
    let insertMsgID = insertMsg.insertId;
    //send message to talker

    socket.to(`${talker_id}_${talker_role}`).emit("privateMessage", {
      sender_name: owner_name,
      sender_id: owner_id,
      content,
      created_at,
      insertMsgID,
    });
  });

  //sendPrivateMessage
  socket.on("privateMessageCancle", async (messageInfo, callback) => {
    const {
      content,
      owner_id,
      owner_role,
      talker_id,
      talker_role,
      owner_name,
      created_at,
    } = messageInfo;
    //save message in DB
    sql =
      "INSERT INTO message (sender_id, receiver_id, content, sender_role, receiver_role, status, created_at) VALUES (?,?,?,?,?,0,?)";
    let [insertMsg] = await pool.query(sql, [
      owner_id,
      talker_id,
      content,
      owner_role,
      talker_role,
      created_at,
    ]);
    let insertMsgID = insertMsg.insertId;
    //send message to talker
    socket.to(`${talker_id}_${talker_role}`).emit("privateMessage", {
      sender_name: owner_name,
      sender_id: owner_id,
      content,
      created_at,
      insertMsgID,
    });
    callback("ok");
  });

  //mark message as read when receiver is now in the window with sender
  socket.on("readMessage", async (insertMsgID) => {
    sql = `UPDATE message SET status=1 WHERE id=${insertMsgID}`;
    await pool.query(sql, insertMsgID);
  });

  //mark message as read after receiver click in the window with sender
  socket.on("readAllMessage", async (updateInfo) => {
    let { owner_id, talker_id, owner_role } = updateInfo;
    sql =
      "SELECT json_arrayagg(id) as unreadmsg_id FROM nice_stay.message WHERE receiver_id=? AND sender_id=? AND receiver_role=? AND status=0";
    let [message_id] = await pool.query(sql, [owner_id, talker_id, owner_role]);
    let { unreadmsg_id } = message_id[0];
    sql = "UPDATE message SET status=1 WHERE id IN (?)";
    await pool.query(sql, [unreadmsg_id]);
  });
});

//404 page not found
app.use(function (req, res) {
  res.status(404).redirect("/notfound.html");
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(403).json({ error: error.message });
  }
  if (error.type === "userExist") {
    return res.status(401).json({ error: error.message });
  } else if (error.type === "tokenExpire") {
    return res.status(401).json({ error: "請先登入" });
  } else if (error.type === "userInput") {
    return res.status(400).json({ error: error.message });
  } else if (error.type === "userInputM") {
    return res.status(401).json({ error: error.message });
  } else if (error.type === "forbidden") {
    return res.status(403).json({ error: error.message });
  } else if (error.type === "S3error") {
    return res.status(500).json({ error: "S3 error" });
  } else if (error.type === "paymentFail") {
    return res.status(400).json({ error: error.message });
  } else {
    res.status(500).json({ error: "internal server error" });
  }
});

server.listen(3000, async () => {
  console.log("Application is now running");
});

module.exports = app;
