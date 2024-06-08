import moment from "moment";
import LateStudentModel from "../../../db/models/lateStudent.model.js";
import { handleError } from "../../middleware/handleAsyncError.js";


const createLateStudent = handleError(async (req, res) => {
  const { studentId, reason, isExcused, notes ,addedBy} = req.body;

//   const addedBy =req.userId
  const arrivalTime = new Date();

  const lateStudent = new LateStudentModel({
    studentId,
    reason,
    arrivalTime,
    isExcused,
    notes,
    addedBy,
  });

  const savedLateStudent = await lateStudent.save();
  res.status(201).json(savedLateStudent);
});
const getLateStudentById = handleError(async (req, res) => {
  const lateStudent = await LateStudentModel.findById(req.params.id);
  if (!lateStudent) {
    return res.status(404).json({ error: 'Late Student not found' });
  }
  res.status(200).json(lateStudent);
});

const updateLateStudentById = handleError(async (req, res) => {
  const updatedLateStudent = await LateStudentModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updatedLateStudent) {
    return res.status(404).json({ error: 'Late Student not found' });
  }

  res.status(200).json(updatedLateStudent);
});

const deleteLateStudentById = handleError(async (req, res) => {
  const deletedLateStudent = await LateStudentModel.findByIdAndDelete(req.params.id);

  if (!deletedLateStudent) {
    return res.status(404).json({ error: 'Late Student not found' });
  }

  res.status(200).json({ message: 'Late Student deleted successfully' });
});

const getLateStudentsForCurrentDay = handleError(async (req, res) => {
  const startOfDay = moment().startOf('day');
  const endOfDay = moment().endOf('day');

  const lateStudents = await LateStudentModel.find({
    arrivalTime: {
      $gte: startOfDay.toDate(),
      $lt: endOfDay.toDate(),
    },
  });

  res.status(200).json({ lateStudents, count: lateStudents.length });
});

export {
  createLateStudent,
  getLateStudentById,
  updateLateStudentById,
  deleteLateStudentById,
  getLateStudentsForCurrentDay
};
