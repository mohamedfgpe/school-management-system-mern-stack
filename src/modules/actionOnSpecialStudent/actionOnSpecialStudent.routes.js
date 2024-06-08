import express from "express";
import {
  createActionOnSpecialStudent,
  getActionOnSpecialStudentById,
  updateActionOnSpecialStudent,
  deleteActionOnSpecialStudent,
  getAllActionsOnSpecialStudentsWithCount,
  getActionsOnSpecialStudentsByTitleWithCount,
  getActionsOnSpecialStudentsByUserWithCount,
  getUnactionedProblems,
} from "./actionOnSpecialStudent.controller.js";
const actionOnSpecialStudentRouter = express.Router();

actionOnSpecialStudentRouter.post(
  "/createActionOnSpecialStudent",
  createActionOnSpecialStudent
);

actionOnSpecialStudentRouter.get(
  "/getActionOnSpecialStudentById/:actionId",
  getActionOnSpecialStudentById
);

actionOnSpecialStudentRouter.put(
  "/updateActionOnSpecialStudent/:actionId",
  updateActionOnSpecialStudent
);

actionOnSpecialStudentRouter.delete(
  "/deleteActionOnSpecialStudent/:actionId",
  deleteActionOnSpecialStudent
);

actionOnSpecialStudentRouter.get(
  "/getAllActionsOnSpecialStudentsWithCount",
  getAllActionsOnSpecialStudentsWithCount
);

actionOnSpecialStudentRouter.get(
  "/getActionsOnSpecialStudentsByTitleWithCount/:title",
  getActionsOnSpecialStudentsByTitleWithCount
);

actionOnSpecialStudentRouter.get(
  "/getActionsOnSpecialStudentsByUserWithCount/:userId",
  getActionsOnSpecialStudentsByUserWithCount
);

export { actionOnSpecialStudentRouter };
