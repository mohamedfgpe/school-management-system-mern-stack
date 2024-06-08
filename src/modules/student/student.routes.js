import express from "express";
import {
  countStudents,
  countStudentsByClass,
  createStudent,
  deleteStudent,
  getAllStudents,
  getAllStudentsByClass,
  getStudentsByGender,
  getStudentInformation,
  updateStudent,
  searchStudents
} from "./student.controller.js";

const studentRouter = express.Router();

studentRouter.post("/addStudent", createStudent);

// Route to get all students
studentRouter.get("/getAllStudents", getAllStudents);

// Route to get a student by ID
// studentRouter.get("/getStudentById/:studentId", getStudentById);

// Route to delete a student by ID
studentRouter.delete("/deleteStudent/:studentId", deleteStudent);

// Route to get all students by class and their counts
studentRouter.get("/getAllStudentsByClass/:classCode", getAllStudentsByClass);
studentRouter.put("/updateStudent/:studentId",updateStudent)

// Route to count the number of students
studentRouter.get("/countStudents", countStudents);

// Route to count the number of students by class and gender Distribution
studentRouter.get("/countStudentsByClass/:classCode", countStudentsByClass);

// Route to get students by gender
studentRouter.get("/getStudentsByGender/:gender", getStudentsByGender);
studentRouter.get("/getallInfoStudent/:studentId", getStudentInformation);
studentRouter.get("/search",searchStudents)
// Add more student routes as needed

export { studentRouter };
