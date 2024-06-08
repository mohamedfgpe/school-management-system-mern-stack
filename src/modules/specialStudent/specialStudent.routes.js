import express from "express";
import {
  createSpecialStudent,
  getSpecialStudentById,
  updateSpecialStudent,
  deleteSpecialStudent,
  getAllSpecialStudentsWithCount,
  getSpecialStudentsByCompetitionWithCount,
  getSpecialStudentsByLevelWithCount,
} from "./specialStudent.controller.js";


const specialStudentRouter = express.Router();

specialStudentRouter.post("/createSpecialStudent", createSpecialStudent);

specialStudentRouter.get("/getSpecialStudentById/:studentId", getSpecialStudentById);

specialStudentRouter.put("/updateSpecialStudent/:specialStudentId", updateSpecialStudent);

specialStudentRouter.delete("/deleteSpecialStudent/:specialStudentId", deleteSpecialStudent);

specialStudentRouter.get("/getAllSpecialStudentsWithCount", getAllSpecialStudentsWithCount);

specialStudentRouter.get("/getSpecialStudentsByCompetitionWithCount/:competitionName", getSpecialStudentsByCompetitionWithCount);

specialStudentRouter.get("/getSpecialStudentsByLevelWithCount/:level", getSpecialStudentsByLevelWithCount);

export { specialStudentRouter };
