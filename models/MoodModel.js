const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const moodSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // Referencing user document
  rating: Number,
  notes: String,
  timestamp: { type: Date, default: Date.now },
});

var Mood = mongoose.model("mood", moodSchema);

const monthlyMoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  year: Number,
  month: Number,
  avgRating: Number,
});

const MonthlyMood = mongoose.model("MonthlyMood", monthlyMoodSchema);

const yearlyMoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  year: Number,
  avgRating: Number,
});

const YearlyMood = mongoose.model("YearlyMood", yearlyMoodSchema);

module.exports = { Mood, MonthlyMood, YearlyMood };
