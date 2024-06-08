import { classModel } from "../../../db/models/class.model.js";
import { studentModel } from "../../../db/models/student.model.js";
import { handleError } from "../../middleware/handleAsyncError.js";
import { problemModel } from './../../../db/models/problem.model.js';
import { actionOnProblemModel } from './../../../db/models/actionOnProblem.model.js';
import { actionOnSpecailStudentModel } from './../../../db/models/actionOnSpecialStudent.js';
import { StudentAbsencesModel } from "../../../db/models/studentAbsence.model.js";
import { gradeModel } from "../../../db/models/grade.model.js";
import LateStudentModel from "../../../db/models/lateStudent.model.js";
import { specialStudentModel } from "../../../db/models/specialStudent.model.js";

// ##########################################
function addHyphenBetweenLetterAndNumberAndCheck(inputString, existingArray) {
  // Use regular expression to find occurrences of a letter followed by a number with optional spaces
  const modifiedString = inputString.replace(/([a-zA-Z])\s?(\d)/g, '$1-$2').toUpperCase();

  // Check if the modified string exists in the array
  const existsInArray = existingArray.includes(modifiedString);

  return { modifiedString, existsInArray };
}

// #####

//  search with student name or class name
let existClasses = [
  "A-1","A-2","A-3","A-4","A-5","A-6","A-7","B-1","B-2","B-3","B-4","B-5","B-6","B-7","C-1","C-2","C-3","C-4","C-5","C-6",
  "UNKNOWN",
];
// ###########################################


export const createStudent = handleError(async (req, res, next) => {
  const { name, email, address, phoneNumber, gender, code, className } = req.body;

  // Use the utility function to modify className and check its existence in the array
  const existClass = addHyphenBetweenLetterAndNumberAndCheck(className, existClasses);

  if (!existClass.existsInArray) {
    return res.status(404).json({
      error: "Class not found",
    });
  }

  // Find the class based on the modified class name
  const targetClass = await classModel.findOne({ code: existClass.modifiedString });

  if (!targetClass) {
    return res.status(404).json({
      error: "Class not found",
    });
  }

  const existingStudent = await studentModel.findOne({
    $or: [{ email }, { phoneNumber }, { code }],
  });

  if (existingStudent) {
    return res.status(409).json({
      error: "Student with the same email, phone number, or code already exists",
    });
  }

  const newStudent = await studentModel.create({
    name,
    email,
    address,
    phoneNumber,
    gender,
    code,
    classId: targetClass._id, // Use the _id of the found class
  });

  console.log("this =>>>>>>", targetClass);
  res.json({ message: "Success", newStudent });
});

// export const getStudentById = handleError(async (req, res, next) => {
//   const { studentId } = req.params;

//   if (!studentId) {
//     return res.status(400).json({
//       error: "StudentId is required in the request parameters",
//     });
//   }

//   const student = await studentModel
//     .findById(studentId)
//     .populate("classId", "code");
//   if (!student) {
//     return res.status(404).json({ error: "Student not found" });
//   }

//   res.json({ message: "Success", student });
// });

export const deleteStudent = handleError(async (req, res, next) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({
      error: "StudentId is required in the request parameters",
    });
  }

  // Find the student
  const student = await studentModel.findById(studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Delete related entities
  try {
    // Delete student absences
    await StudentAbsencesModel.deleteMany({ studentId });

    // Delete student problems
    await problemModel.deleteMany({ studentId });

    // Delete actions related to special student
    await actionOnSpecailStudentModel.deleteMany({ special_student: studentId });

    // Delete actions related to problem
    await actionOnProblemModel.deleteMany({ problemId: { $in: student.problems } });

    // Delete the student
    const deletedStudent = await studentModel.findByIdAndDelete(studentId);

    res.json({ message: "Success", deletedStudent });
  } catch (error) {
    console.error("Error deleting student and related entities:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export const updateStudent = handleError(async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { name, email, address, phoneNumber, gender, code, classId } = req.body;

    const existingStudent = await studentModel.findOne({
      $and: [{ _id: { $ne: studentId } }, { $or: [{ email }, { phoneNumber }, { code }] }],
    });

    if (existingStudent) {
      return res.status(409).json({
        error: "Student with the same email, phone number, or code already exists",
      });
    }

    const updatedStudent = await studentModel.findByIdAndUpdate(
      studentId,
      {
        name,
        email,
        address,
        phoneNumber,
        gender,
        code,
        classId,
      },
      { new: true, runValidators: true }
    ).populate("classId");

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Success", updatedStudent });
  } catch (error) {
    // Handle errors here
    console.error("Error in updateStudent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const getAllStudents = handleError(async (req, res) => {
  const students = await studentModel.find().populate("classId", "code");
  res.json({ message: "Success", students });
});

export const getStudentsByGender = handleError(async (req, res, next) => {
  const { gender } = req.params;

  if (!gender) {
    return res.status(400).json({
      error: "Gender is required in the request parameters",
    });
  }

  const students = await studentModel
    .find({ gender })
    .populate("classId", "code");
    const count = students.length
  res.json({ message: "Success", students ,  count });
});

export const countStudents = handleError(async (req, res) => {
  const count = await studentModel.countDocuments();
  res.json({ message: "Success", count });
});

export const countStudentsByClass = handleError(async (req, res, next) => {
  const { classCode } = req.params;

  if (!classCode) {
    return res.status(400).json({
      error: "ClassCode is required in the request parameters",
    });
  }

  const targetClass = await classModel.findOne({ code: classCode });
  if (!targetClass) {
    return res.status(404).json({ error: "Class not found" });
  }

  const studentsInClass = await studentModel.find({ classId: targetClass._id });
  const totalStudents = studentsInClass.length;

  if (totalStudents === 0) {
    return res.json({
      message: "No students found in the class",
      totalStudents,
    });
  }

  // Calculate average length of student names
  const averageNameLength =
    studentsInClass.reduce((acc, student) => acc + student.name.length, 0) /
    totalStudents;

  // Calculate gender distribution
  const genderDistribution = studentsInClass.reduce((acc, student) => {
    acc[student.gender] = (acc[student.gender] || 0) + 1;
    return acc;
  }, {});

  res.json({
    message: "Success",
    totalStudents,
    averageNameLength,
    genderDistribution,
  });
});




export const getAllStudentsByClass = handleError(async (req, res, next) => {
  const { classCode } = req.params;

  if (!classCode) {
    return res.status(400).json({
      error: "ClassCode is required in the request parameters",
    });
  }

  // Modify the class code using the utility function
  const modifiedClassCodeResult = addHyphenBetweenLetterAndNumberAndCheck(classCode, existClasses);

  if (modifiedClassCodeResult.existsInArray) {
    // Find the class based on the modified class code
    const targetClass = await classModel.findOne({ code: modifiedClassCodeResult.modifiedString });
    if (!targetClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Aggregate to get students and their count
    const studentsAggregate = await studentModel.aggregate([
      {
        $match: { classId: targetClass._id },
      },
      {
        $group: {
          _id: null,
          students: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract the result from the aggregation
    const result = studentsAggregate[0];

    res.json({
      message: "Success",
      studentsInClass: result ? result.students : [],
      studentCount: result ? result.count : 0,
    });
  } else {
    return res.status(404).json({ error: "Modified class code not found in the existClasses array" });
  }
});


// export const getStudentInformation = handleError(async (req, res, next) => {
//   try {
//     const { studentId } = req.params;

//     const student = await studentModel.findById(studentId).populate('classId');

//     if (!student) {
//       return res.status(404).json({ success: false, message: 'Student not found' });
//     }

//     // Fetch the class information of the student
//     const studentClass = student.classId;

//     // Fetch the grade information based on the class
//     const grade = await gradeModel.findById(studentClass.grade);

//     const problems = await problemModel.find({ studentId })
//       .populate({
//         path: 'addedBy',
//         model: 'User',
//         select: 'name email',
//       });

//     const actionsOnProblems = await actionOnProblemModel.find({ addedBy: studentId })
//       .populate('problemId')
//       .populate('addedBy');

//     const specialStudents = await actionOnSpecailStudentModel.find({ addBy: studentId })
//       .populate('special_student')
//       .populate('addBy');

//     const absences = await StudentAbsencesModel.find({ studentId })
//       .populate('studentId')
//       .populate('addedBy');

//     // Get the count of problems and absences
//     const problemCount = await problemModel.countDocuments({ studentId });
//     const absenceCount = await StudentAbsencesModel.countDocuments({ studentId });

//     // Fetch late students of the specific student
//     const lateStudents = await LateStudentModel.find({ studentId });
//     const lateStudentCount = lateStudents.length;

//     res.json({
//       success: true,
//       data: {
//         student: {
//           ...student._doc,
//           gradeLevel: grade ? grade.level : "UNKNOWN", // Include the grade level
//         },
//         problems,
//         actionsOnProblems,
//         specialStudents,
//         absences,
//         problemCount,
//         absenceCount,
//         lateStudents,
//         lateStudentCount,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching student information:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });

export const getStudentInformation = handleError(async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await studentModel.findById(studentId).populate('classId').maxTimeMS(30000);;

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch the class information of the student
    const studentClass = student.classId;

    // Fetch the grade information based on the class
    const grade = await gradeModel.findById(studentClass.grade);

    const problems = await problemModel.find({ studentId })
      .populate({
        path: 'addedBy',
        model: 'User',
        select: 'name email',
      });


      const specialStudents = await specialStudentModel.find({ studentId });

    const absences = await StudentAbsencesModel.find({ studentId })
      .populate('studentId')
      .populate('addedBy');

    // Get the count of problems and absences
    const problemCount = problems.length;
    const absenceCount = absences.length;
    const specialStudentsCount =  specialStudents.length;

    // Fetch late students of the specific student
    const lateStudents = await LateStudentModel.find({ studentId });
    const lateStudentCount = lateStudents.length;

    res.json({
      success: true,
      data: {
        student: {
          ...student._doc,
          gradeLevel: grade ? grade.level : "UNKNOWN", // Include the grade level
        },
        problems,
        absences,
        problemCount,
        specialStudents,
        specialStudentsCount,
        absenceCount,
        lateStudents,
        lateStudentCount,
      },
    });
  } catch (error) {
    console.error('Error fetching student information:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



export const searchStudents = handleError(async (req, res, next) => {
  try {
    const { searchQuery } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Search for students by name
    const studentsByName = await studentModel
      .find({ name: { $regex: searchQuery, $options: "i" } })
      .populate("classId");

    // Search for students by class name
    let classes = [];

    const existClass = addHyphenBetweenLetterAndNumberAndCheck(searchQuery, existClasses);

    if (existClass.existsInArray) {
      classes = await classModel.find({ code: { $regex: existClass.modifiedString, $options: "i" } });
    }

    const studentsByClassName = await studentModel
      .find({ classId: { $in: classes.map((cls) => cls._id) } })
      .populate("classId");

    const result = [...studentsByName, ...studentsByClassName];

    res.json({ Message: "Success", result: result });
  } catch (error) {
    // Handle errors here
    console.error("Error in searchStudents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


