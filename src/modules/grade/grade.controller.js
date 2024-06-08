import { classModel } from "../../../db/models/class.model.js";
import { gradeModel } from "../../../db/models/grade.model.js";
import { handleError } from "../../middleware/handleAsyncError.js";

export const getClassesByGradeLevel = handleError(async (req, res, next) => {
    try {
      const { gradeLevel } = req.params;
  
      if (!gradeLevel) {
        return res.status(400).json({ error: "Grade level is required" });
      }
  
      // Find the grade based on the level
      const grade = await gradeModel.findOne({ level: gradeLevel });
  
      if (!grade) {
        return res.status(404).json({ message: `Grade level ${gradeLevel} not found` });
      }
  
      // Find all classes with the specified grade
      const classes = await classModel.find({ grade: grade._id });
  
      res.status(200).json(classes);
    } catch (error) {
      // Handle errors here
      console.error("Error fetching classes:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  export const createGradeLevel = handleError(async (req, res, next) => {
    try {
      const { level } = req.body;
  
      // Check if the level is provided
      if (!level) {
        return res.status(400).json({ error: "Grade level is required" });
      }
  
      // Check if a grade with the same level already exists
      const existingGrade = await gradeModel.findOne({ level });
  
      if (existingGrade) {
        return res.status(409).json({
          error: "Grade level already exists",
        });
      }
  
      // Create a new grade with the provided level
      const newGrade = await gradeModel.create({ level });
  
      res.json({ message: "Success", newGrade });
    } catch (error) {
      // Handle errors here
      console.error("Error creating grade level:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
