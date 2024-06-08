import express from "express";

import { addActionOnProblem, getActionsByUser, getMonthlyReport, getUnactionedProblems } from "./actionOnProblem.js";

 const actionOnProblemRouter = express.Router();

// Route to add an action on a problem
actionOnProblemRouter.post("/addActionOnProblem/:problemId", addActionOnProblem);

// Route to get actions performed by a specific user
actionOnProblemRouter.get("/getActionsByUser/:userId", getActionsByUser);

// Route to get detailed statistics and generate a monthly report
actionOnProblemRouter.get("/getMonthlyReport/:year/:month", getMonthlyReport);
actionOnProblemRouter.get("/getUnactionedProblems",getUnactionedProblems)

export { actionOnProblemRouter };
