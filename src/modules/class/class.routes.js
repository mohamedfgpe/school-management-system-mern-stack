import express from 'express';
import { createClass, deleteClassWithStudents, getAllClassesInfo, getClassAbsencesWithinDateRange, getProblemsByClass, searchClassByCode } from './class.controller.js';

 const   classRouter= express.Router();


classRouter.post("/createClass", createClass);
classRouter.get("/allClasses",getAllClassesInfo);
classRouter.delete("/deleteClass/:classId",deleteClassWithStudents);
classRouter.get("/searchClassByCode/:code",searchClassByCode)
// get absences for specific class and date (optional) 
classRouter.get('/:classId/absences', getClassAbsencesWithinDateRange);
classRouter.get('/:classId/problems', getProblemsByClass);

export {classRouter};

