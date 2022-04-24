const express = require("express");
const userRoutes = require("./routes/userRoutes");
const goalRoutes = require("./routes/goalRoutes");
var mongoose = require("mongoose");
var config = require("./config");
const app = express();

mongoose
  .connect(config.getDbConnectionString())
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log("Connection failed : ", err);
  });

app.use(express.json());
app.use("/user", userRoutes);
app.use("/goals", goalRoutes);

app.use("/", (req, res) => {
  res.statusCode = 404;
  res.json({
    status: "error",
    message: "Not Found",
  });
});

app.listen(8080, () => {
  console.log("app listening at http://localhost:8080");
});
