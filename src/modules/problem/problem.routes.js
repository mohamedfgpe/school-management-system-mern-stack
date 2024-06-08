import express from "express";
import {
  createProblem,
  deleteProblem,
  getAllProblemsForSelectedGradesForAllMonths,
  getAllProblemsWithDateAndClass,
  getAllProblemsWithDetails,
  getAllProblemsWithinDateRange,
  getProblemsByStudent,
  getProblemsByUser,
  getProblemsWithKeyword,
  getProblemsWithProblemType,
} from "./problem.controller.js";

const problemRouter = express.Router();

// Route to create a problem
problemRouter.post("/createProblem", createProblem);

// Route to get all problems with detailed student and user information
problemRouter.get("/getAllProblemsWithDetails", getAllProblemsWithDetails);

// Route to get problems reported by a specific user
problemRouter.get("/getProblemsByUser/:userId", getProblemsByUser);

// Route to delete a problem by ID
problemRouter.delete(
  "/deleteProblem/:problemId",
  deleteProblem
);

// Route to get problems with a specific keyword in the description
problemRouter.get("/getProblemsWithKeyword/:keyword", getProblemsWithKeyword);

// Route to get problems by student and count
problemRouter.get("/getProblemsByStudent/:studentId", getProblemsByStudent);

// Route to get problems by class with count and details
// problemRouter.get("/getProblemsByClass/:classId", getProblemsByClass);

// Route to get all problems reported within a specific date range
problemRouter.get(
  "/getAllProblemsWithinDateRange/:startDate/:endDate",
  getAllProblemsWithinDateRange
);

// Route to get all problems reported within a specific date range and class => i will check it again ,
// it works with queries
problemRouter.get(
  "/getAllProblemsWithDateAndClass",
  getAllProblemsWithDateAndClass
);
problemRouter.get(
  "/getProblemsWithProblemType/:problemType",
  getProblemsWithProblemType
);
problemRouter.get('/problems-for-last-12-month', getAllProblemsForSelectedGradesForAllMonths);

export { problemRouter };
