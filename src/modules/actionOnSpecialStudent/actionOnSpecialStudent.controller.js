import { handleError } from './../../middleware/handleAsyncError';
import { actionOnSpecailStudentModel } from './../../../db/models/actionOnSpecialStudent';

export const createActionOnSpecialStudent = handleError(async (req, res, next) => {
  const { special_student, addBy, title } = req.body;

  const existingAction = await actionOnSpecailStudentModel.findOne({
    special_student,
    addBy,
  });

  if (existingAction) {
    return res.status(409).json({
      error: "Action on special student by the same user already exists",
    });
  }

  const newAction = await actionOnSpecailStudentModel.create({
    special_student,
    addBy,
    title,
  });

  res.status(201).json({ message: "Success", newAction });
});
export const getActionOnSpecialStudentById = handleError(async (req, res, next) => {
    const { actionId } = req.params;
  
    const action = await actionOnSpecailStudentModel.findById(actionId).populate('special_student').populate('addBy');
  
    if (!action) {
      return res.status(404).json({ error: "Action on special student not found" });
    }
  
    res.json({ action });
  });

  export const updateActionOnSpecialStudent = handleError(async (req, res, next) => {
    const { actionId } = req.params;
    const { title } = req.body;
  
    const updatedAction = await actionOnSpecailStudentModel.findByIdAndUpdate(
      actionId,
      { title },
      { new: true }
    );
  
    if (!updatedAction) {
      return res.status(404).json({ error: "Action on special student not found" });
    }
  
    res.json({ message: "Action on special student updated successfully", updatedAction });
  });
  export const deleteActionOnSpecialStudent = handleError(async (req, res, next) => {
    const { actionId } = req.params;
  
    const deletedAction = await actionOnSpecailStudentModel.findByIdAndDelete(actionId);
  
    if (!deletedAction) {
      return res.status(404).json({ error: "Action on special student not found" });
    }
  
    res.json({ message: "Action on special student deleted successfully" });
  });
  export const getAllActionsOnSpecialStudentsWithCount = async (req, res, next) => {
    try {
      const actions = await actionOnSpecailStudentModel.find().populate('special_student').populate('addBy');
      const actionsWithCount = {
        count: actions.length,
        actions,
      };
      res.json(actionsWithCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
export const getActionsOnSpecialStudentsByTitleWithCount = async (req, res, next) => {
    try {
      const { title } = req.params;
      const actions = await actionOnSpecailStudentModel.find({ title }).populate('special_student').populate('addBy');
      const actionsWithCount = {
        count: actions.length,
        actions,
      };
      res.json(actionsWithCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  export const getActionsOnSpecialStudentsByUserWithCount = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const actions = await actionOnSpecailStudentModel.find({ addBy: userId }).populate('special_student').populate('addBy');
      const actionsWithCount = {
        count: actions.length,
        actions,
      };
      res.json(actionsWithCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


 