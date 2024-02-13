const express = require("express");
const { getAuthUser } = require("../util");

const MoodController = require("../controllers/moodController");

const router = express.Router();

router.post("/", getAuthUser, MoodController.postUserMood);

router.get("/daily-mood/:userId/:year/:month", getAuthUser, MoodController.getAllDaysMood);

router.get("/monthly-mood/:userId/:year", getAuthUser, MoodController.getAllMonthsMood);

router.get("/year-mood/:userId/:year", getAuthUser, MoodController.getYearlyMood);

module.exports = router;
