const User = require("../models/UserModel");

//Create and Update goal API handling
module.exports.createOrUpdateGoal = async (req, res) => {
  const authUser = req.user;
  const { goalId, name, timeSlot, weeklyFrequency, reward, goalCount } =
    req.body;

  //Check if user exists
  User.findOne({ _id: authUser._id }, "goalLimit goals", (err, doc) => {
    if (err)
      return res
        .status(404)
        .send({ success: false, message: "Failed", error: err });

    let goalLimit = doc.goalLimit;
    if (reward) {
      goalLimit = goalLimit + 1;
    }

    //If goal id is present in body then update
    if (goalId) {
      User.updateOne(
        { "goals._id": goalId },
        {
          $set: {
            "goals.$.name": name,
            "goals.$.timeSlot": timeSlot,
            "goals.$.weeklyFrequency": weeklyFrequency,
            "goals.$.goalCount": goalCount,
            "goals.$.reward": reward,
            goalLimit: goalLimit,
          },
        },
        (err, doc) => {
          if (err)
            return res.status(400).send({
              success: false,
              message: "Update Operation failed",
              error: err,
            });

          if (doc.acknowledged) {
            res.send({ success: true, message: "Updated Successfully" });
          } else {
            res.send({ success: false, message: "Update Operation failed" });
          }
        }
      );
    } else {
      //check if goal limit is reached and create
      if (doc.goals.length < doc.goalLimit) {
        let newGoal = {
          name: name,
          timeSlot: timeSlot,
          weeklyFrequency: weeklyFrequency,
        };

        doc.goals.push(newGoal);

        User.updateOne({ _id: authUser._id }, doc, (err, updDoc) => {
          if (err)
            return res
              .status(400)
              .send({ success: false, message: "Failed", error: err });
          if (updDoc.acknowledged) {
            res.send({
              success: true,
              message: "Created Successfully",
              goals: doc.goals,
            });
          } else {
            res.send({ success: false, message: "Creation failed" });
          }
        });
      } else {
        res.send({ success: false, message: "Goal limit reached" });
      }
    }
  });
};

//Delete goal API handling
module.exports.deleteGoal = async (req, res) => {
  const authUser = req.user;
  let { goalId } = req.params;
  User.updateOne(
    { _id: authUser._id },
    {
      $pull: {
        goals: { _id: goalId },
      },
    },
    (err, doc) => {
      if (err)
        return res
          .status(400)
          .send({ success: false, message: "Failed", error: err });
      if (doc.acknowledged && doc.modifiedCount > 0) {
        res.send({ success: true, message: "Deleted Successfully" });
      } else {
        res.send({ success: false, message: "Delete Operation failed" });
      }
    }
  );
};

//Get a goal by id API handling
module.exports.getGoal = async (req, res) => {
  const authUser = req.user;
  let { goalId } = req.params;

  User.findOne({ _id: authUser._id })
    .select({
      goals: { $elemMatch: { _id: goalId } },
    })
    .then((response) => {
      res.send({ success: true, data: response.goals[0] });
    })
    .catch((err) => {
      res.status(404).send({ success: false, message: "Record not found" });
    });
};

//Get all goals API handling
module.exports.getAllGoals = async (req, res) => {
  const userId = req.user._id;

  if (
    userId === null ||
    typeof userId === undefined ||
    userId === "undefined"
  ) {
    return res.status(400).send({ success: false, message: "Failed" });
  }

  User.findOne({ _id: userId }, "goals", (err, doc) => {
    if (err)
      return res
        .status(400)
        .send({ success: false, message: "Failed", error: err });

    res.send({ success: true, data: doc.goals });
  });
};
