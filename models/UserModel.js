const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var userSchema = new Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  goalLimit: Number,
  goals: [
    {
      name: String,
      timeSlot: String,
      weeklyFrequency: Number,
      goalCount: { type: Number, default: 0 },
    },
  ],
});

var User = mongoose.model("users", userSchema);

module.exports = User;
