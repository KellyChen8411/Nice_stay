require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { compareSync } = require("bcryptjs");
const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API routes
app.use("/api/" + process.env.API_VERSION, [
  require("./server/routes/house_route"),
  require("./server/routes/city_route"),
  require("./server/routes/amenity_route"),
  require("./server/routes/user_route"),
]);

app.use((error, req, res, next) => {
  console.log("Enter express error handling Middleware");
  console.log(error);
  if (error.type === "userExist") {
    return res.status(404).json({ error: error.message });
  } else {
    res.status(500).json({ error: "internal server error" });
  }
});

app.listen(3000, async () => {
  console.log("Application is now running");
});
