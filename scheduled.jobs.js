var cron = require("node-cron");
const User = require("./models/UserModel");
var UserModel = require("./models/UserModel");

//Clear goal count every monday
var goalCountResetTask = cron.schedule("0 0 * * MON", () => {
  UserModel.find({}, "goals", (err, userList) => {
    if (err) throw err;

    userList.forEach((user) => {
      let userGoals = user.goals;
      userGoals.forEach((goal) => {
        goal.goalCount = 0;
      });
      User.updateOne(
        { _id: user._id },
        { $set: { goals: userGoals } },
        (err, doc) => {}
      );
    });
  });
});

module.exports.start = async () => {
  goalCountResetTask.start();
};

module.exports.stopJob = async () => {
  goalCountResetTask.stop();
};
