import  Express  from "express";
import {  createGradeLevel, getClassesByGradeLevel } from "./grade.controller.js" ;

export const gradeRouter=Express.Router();

gradeRouter.post("/createGrade",createGradeLevel)
gradeRouter.get("/getClassesByGrade/:gradeLevel",getClassesByGradeLevel)

