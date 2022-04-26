const express = require("express");
const { getAuthUser } = require("../util");

const GoalController = require("../controllers/goalController");

const router = express.Router();

router.post("/", getAuthUser, GoalController.createOrUpdateGoal);

router.delete("/:goalId", getAuthUser, GoalController.deleteGoal);

router.get("/", getAuthUser, GoalController.getAllGoals);

router.get("/:goalId", getAuthUser, GoalController.getGoal);

module.exports = router;
