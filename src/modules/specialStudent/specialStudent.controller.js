import { actionOnSpecailStudentModel } from "../../../db/models/actionOnSpecialStudent.js";
import { specialStudentModel } from "../../../db/models/specialStudent.model.js";
import { handleError } from "../../middleware/handleAsyncError.js";

export const createSpecialStudent = handleError(async (req, res, next) => {
    const { competitionName, description, level, studentId } = req.body;
  
    // Check if the special student with the same competition and studentId already exists
    const existingSpecialStudent = await specialStudentModel.findOne({
      competitionName,
      studentId,
    });
  
    if (existingSpecialStudent) {
      return res.status(409).json({
        error: "Special student with the same competition and student already exists",
      });
    }
  
    // Create a new special student
    const newSpecialStudent = await specialStudentModel.create({
      competitionName,
      description,
      level,
      studentId,
    });
  
    res.json({ message: "Success", newSpecialStudent });
  });


  
  export const getSpecialStudentById = handleError(async (req, res, next) => {
    try {
      const { studentId } = req.params;
  
      // Find special student records for the specified student
      const specialStudents = await specialStudentModel.find({ studentId });
  
      if (specialStudents.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found in any competition' });
      }
  
      // Return the competition information for the student
      res.json({
        success: true,
        data: specialStudents,
      });
    } catch (error) {
      console.error('Error fetching student competition information:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  export const updateSpecialStudent = handleError(async (req, res, next) => {
    const { specialStudentId } = req.params;
    const { competitionName, description, level } = req.body;
  
    const updatedSpecialStudent = await specialStudentModel.findByIdAndUpdate(
      specialStudentId,
      { competitionName, description, level },
      { new: true }
    );
  
    if (!updatedSpecialStudent) {
      return res.status(404).json({ error: "Special student not found" });
    }
  
    res.json({ message: "Special student updated successfully", specialStudent: updatedSpecialStudent });
  });

  
export const deleteSpecialStudent = handleError(async (req, res, next) => {
    const { specialStudentId } = req.params;
  
    const deletedSpecialStudent = await specialStudentModel.findByIdAndDelete(specialStudentId);
  
    if (!deletedSpecialStudent) {
      return res.status(404).json({ error: "Special student not found" });
    }
  
    res.json({ message: "Special student deleted successfully" });
  });


  
export const getAllSpecialStudentsWithCount = handleError(async (req, res, next) => {
    const specialStudents = await specialStudentModel.find().populate('studentId');
  
    const specialStudentsWithCount = {
      count: specialStudents.length,
      specialStudents,
    };
  
    res.json(specialStudentsWithCount);
  });
  export const getSpecialStudentsByCompetitionWithCount = handleError(async (req, res, next) => {
    const { competitionName } = req.params;
  
    const specialStudents = await specialStudentModel.find({ competitionName }).populate('studentId');
  
    const specialStudentsWithCount = {
      count: specialStudents.length,
      specialStudents,
    };
  
    res.json(specialStudentsWithCount);
  });

  
export const getSpecialStudentsByLevelWithCount = handleError(async (req, res, next) => {
    const { level } = req.params;
  
    const specialStudents = await specialStudentModel.find({ level }).populate('studentId');
  
    const specialStudentsWithCount = {
      count: specialStudents.length,
      specialStudents,
    };
  
    res.json(specialStudentsWithCount);
  });