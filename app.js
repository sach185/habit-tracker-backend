const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const goalRoutes = require("./routes/goalRoutes");
var mongoose = require("mongoose");
var config = require("./config");
const app = express();
app.use(cors());
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

app.get('/test', (req, res) => { res.send('Hello from Express!')

const jobs = require("./scheduled.jobs");
jobs.start();

app.listen(process.env.PORT || 8080, () => {
  console.log("App is running");
});
