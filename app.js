require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

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

app.use((error, req, res, next) => {
  // console.log("Enter express error handling Middleware");
  // console.log(error);
  if (error.type === "userExist") {
    return res.status(404).json({ error: error.message });
  } else if (error.type === "tokenExpire") {
    return res.status(404).json({ error: "token過期,請重新登入" });
  } else if (error.type === "userInput") {
    return res.status(400).json({ error: error.message });
  } else if (error.type === "forbidden") {
    return res.status(403).json({ error: error.message });
  } else if (error.type === "S3error") {
    return res.status(500).json({ error: error.message });
  } else {
    // console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

app.listen(3000, async () => {
  console.log("Application is now running");
});
