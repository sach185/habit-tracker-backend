const express = require("express");
const GoalController = require("../controllers/goalController");

const router = express.Router();

router.post("/", GoalController.createOrUpdateGoal);

router.delete("/:userId/:goalId", GoalController.deleteGoal);

router.get("/:userId", GoalController.getAllGoals);

router.get("/:userId/:goalId", GoalController.getGoal);

module.exports = router;
