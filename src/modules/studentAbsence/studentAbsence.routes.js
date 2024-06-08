import express from "express";
import {
  createStudentAbsence,
  deleteStudentAbsenceById,
  getAllStudentAbsences,
  updateStudentAbsenceById,
  getStudentAbsences,
  getAbsenceStatistics,
  getAbsencesForCurrentDay,
  getAbsencesByKeywordOrClass,
  getAbsencesForYear,
  getAbsenceCountsByMonth
} from "./studentAbsence.controller.js";
const studentAbsenceRouter = express.Router();

// Create a student absence
studentAbsenceRouter.post("/student-absences", createStudentAbsence);

// Get all student absences with optional date range
studentAbsenceRouter.get("/student-absences", getAllStudentAbsences);

// Update a student absence by ID
studentAbsenceRouter.put("/student-absences/:id", updateStudentAbsenceById);

// Delete a student absence by ID
studentAbsenceRouter.delete("/student-absences/:id", deleteStudentAbsenceById);

// Get student absences for a specific student with optional date range
studentAbsenceRouter.get("/student-absences/:studentId", getStudentAbsences);

// Get absence statistics
studentAbsenceRouter.get("/absence-statistics", getAbsenceStatistics);
studentAbsenceRouter.get("/absence-statistics-current-day", getAbsencesForCurrentDay);

// by class => it works
studentAbsenceRouter.get("/get-absence-by-code-or-name", getAbsencesByKeywordOrClass);
// for charts 
studentAbsenceRouter.get("/getAbsencesForYear", getAbsenceCountsByMonth);


export { studentAbsenceRouter };
