const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const goalRoutes = require("./routes/goalRoutes");
var mongoose = require("mongoose");
var config = require("./config");
const app = express();
app.use(cors());

//Setup mongo db connection
mongoose
  .connect(config.getDbConnectionString())
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log("Connection failed : ", err);
  });

app.use(express.json());

//User and Goal routes
app.use("/user", userRoutes);
app.use("/goals", goalRoutes);

//Landing page
app.use("/", (req, res) => {
  res.send("Welcome to Habit Tracker");
});

//Start job for reseting goal count every monday
const jobs = require("./scheduled.jobs");
jobs.start();

app.listen(process.env.PORT || 8080, () => {
  console.log("App is running");
});
