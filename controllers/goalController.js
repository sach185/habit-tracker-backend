const User = require("../models/UserModel");

module.exports.createOrUpdateGoal = async (req, res) => {
  const { goalId, name, timeSlot, weeklyFrequency, goalCount, userId } =
    req.body;

  //Check if user exists
  User.findOne({ _id: userId }, "goalLimit goals", (err, doc) => {
    if (err) throw err;

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
          },
        },
        (err, doc) => {
          if (err) throw err;

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

        User.updateOne({ _id: userId }, doc, (err, updDoc) => {
          if (err) throw err;
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

module.exports.deleteGoal = async (req, res) => {
  let { userId, goalId } = req.params;
  User.updateOne(
    { _id: userId },
    {
      $pull: {
        goals: { _id: goalId },
      },
    },
    (err, doc) => {
      if (err) throw err;

      console.log("*** Dele: ", doc);
      if (doc.acknowledged && doc.modifiedCount > 0) {
        res.send({ success: true, message: "Deleted Successfully" });
      } else {
        res.send({ success: false, message: "Delete Operation failed" });
      }
    }
  );
};

module.exports.getGoal = async (req, res) => {
  let { goalId, userId } = req.params;

  User.findOne({ _id: userId })
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

module.exports.getAllGoals = async (req, res) => {
  let { userId } = req.params;

  User.findOne({ _id: userId }, "goals", (err, doc) => {
    if (err) throw err;

    res.send({ success: true, data: doc.goals });
  });
};
