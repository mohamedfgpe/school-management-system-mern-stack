import { actionOnProblemModel } from "../../../db/models/actionOnProblem.model.js";
import { classModel } from "../../../db/models/class.model.js";
import { gradeModel } from "../../../db/models/grade.model.js";
import { problemModel } from "../../../db/models/problem.model.js";
import { studentModel } from "../../../db/models/student.model.js";
import { userModel } from "../../../db/models/user.model.js";
import { handleError } from "../../middleware/handleAsyncError.js";
import moment from 'moment';

// export const createProblem = handleError(async (req, res, next) => {
//   const { studentId, description, problemType } = req.body;
//    const addedBy= "65c51088773e7f50b35da04d"

//   const existingProblem = await problemModel.findOne({
//     studentId,
//     description,
//     addedBy,
//     problemType,
//   });
//   if (existingProblem) {
//     return res.status(409).json({ error: "A similar problem already exists" });
//   }

//   const newProblem = await problemModel.create({
//     studentId,
//     description,
//     addedBy,
//     problemType,
//   });
//   res.json({ message: "Success", newProblem });
// });

export const createProblem = handleError(async (req, res, next) => {
  const problems = req.body; // Assuming req.body is an array of objects
  const addedBy = "65c51088773e7f50b35da04d";

  try {
    const newProblems = await Promise.all(problems.map(async (problem) => {
      const { studentId, description, problemType } = problem;

      const existingProblem = await problemModel.findOne({
        studentId,
        description,
        addedBy,
        problemType,
      });

      if (existingProblem) {
        return { error: "A similar problem already exists" };
      }

      return await problemModel.create({
        studentId,
        description,
        addedBy,
        problemType,
      });
    }));

    res.json({ message: "Success", newProblems });
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});


// Get all problems with detailed student and user information
export const getAllProblemsWithDetails = handleError(async (req, res) => {
  const allProblems = await problemModel
    .find()
    .populate("studentId")
    .populate("addedBy", "name email role");

  res.json({ message: "Success", problems: allProblems });
});

export const getProblemsByUser = handleError(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      error: "UserId is required in the request parameters",
    });
  }

  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const problemsReportedByUser = await problemModel.find({ addedBy: userId });

  res.json({ message: "Success", problems: problemsReportedByUser });
});

// Delete a problem
export const deleteProblem = handleError(async (req, res, next) => {
  const { problemId } = req.params;

  if (!problemId) {
    return res.status(400).json({
      error: "ProblemId is required in the request parameters",
    });
  }

  const deletedProblem = await problemModel.findByIdAndDelete(problemId);
  if (!deletedProblem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  res.json({ message: "Success", deletedProblem });
});

// Get problems with a specific keyword in the description
export const getProblemsWithKeyword = handleError(async (req, res, next) => {
  const { keyword } = req.params;

  if (!keyword) {
    return res.status(400).json({
      error: "Keyword is required in the request parameters",
    });
  }

  const problemsWithKeyword = await problemModel.find({
    description: { $regex: new RegExp(keyword, "i") },
  });

  res.json({ message: "Success", problems: problemsWithKeyword });
});

export const getProblemsByStudent = handleError(async (req, res, next) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({
      error: "StudentId is required in the request parameters",
    });
  }

  const student = await studentModel.findById(studentId);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const problems = await problemModel.find({ studentId });

  const problemCount = problems.length;

  res.json({ message: "Success", student, problemCount, problems });
});

// export const getProblemsByClass = handleError(async (req, res, next) => {
//   const { classId } = req.params;

//   if (!classId) {
//     return res.status(400).json({
//       error: "ClassId is required in the request parameters",
//     });
//   }

//   const targetClass = await classModel.findById(classId);
//   if (!targetClass) {
//     return res.status(404).json({ error: "Class not found" });
//   }

//   // Find students in the given class
//   const studentsInClass = await studentModel.find({ classId });

//   // Get the IDs of the students in the class
//   const studentIdsInClass = studentsInClass.map((student) => student._id);

//   // Find problems associated with the students in the class
//   const problemsInClass = await problemModel.find({
//     studentId: { $in: studentIdsInClass },
//   }).populate('studentId');

//   const problemsInClassCount = problemsInClass.length;

//   res.json({ message: "Success", targetClass, problemsInClassCount, problemsInClass });
// });


// Get all problems reported within a specific date range and their count 
export const getAllProblemsWithinDateRange = handleError(async (req, res, next) => {
  const { startDate, endDate } = req.params;

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: "Both startDate and endDate are required in the request parameters",
    });
  }

  // Parse and format dates using moment
  const startDateFormatted = moment(`${startDate}T00:00:00Z`).toDate();
  const endDateFormatted = moment(`${endDate}T23:59:59Z`).toDate();

  const problemsWithinDateRange = await problemModel.find({
    createdAt: { $gte: startDateFormatted, $lte: endDateFormatted },
  });

  const problemsCount = problemsWithinDateRange.length;

  res.json({ message: "Success", problems: problemsWithinDateRange, count: problemsCount });
});



export const getAllProblemsWithDateAndClass = handleError(async (req, res, next) => {
  try {
    const { classCode, startDate, endDate } = req.query;

    if (!classCode || !startDate || !endDate) {
      return res.status(400).json({
        error: "classCode, startDate, and endDate are required in the request parameters",
      });
    }

    // Validate startDate and endDate as per your requirement

    const formattedStartDate = moment(startDate).toDate();
    const formattedEndDate = moment(endDate).toDate();

    const classProblems = await actionOnProblemModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: formattedStartDate,
            $lte: formattedEndDate,
          },
        },
      },
      {
        $lookup: {
          from: 'problems', // Assuming the collection name is 'problems'
          localField: 'problemId',
          foreignField: '_id',
          as: 'problemDetails',
        },
      },
      {
        $lookup: {
          from: 'students', // Assuming the collection name is 'students'
          localField: 'problemDetails.studentId',
          foreignField: '_id',
          as: 'studentDetails',
        },
      },
      {
        $lookup: {
          from: 'classes', // Assuming the collection name is 'classes'
          localField: 'studentDetails.classId',
          foreignField: '_id',
          as: 'classDetails',
        },
      },
      {
        $match: {
          'classDetails.code': classCode,
        },
      },
      {
        $project: {
          _id: 0,
          problemId: 1,
          action: 1,
          addedBy: 1,
          createdAt: 1,
          'problemDetails.description': 1,
          'studentDetails.name': 1,
          'classDetails.code': 1,
        },
      },
    ]);

    res.json({ message: "Success", classProblems });
  } catch (error) {
    next(error);
  }
});


export const getProblemsWithProblemType = handleError(async (req, res, next) => {
  try {
    const { problemType } = req.params;

    if (!problemType) {
      return res.status(400).json({
        error: "ProblemType is required in the request parameters",
      });
    }

    const problemsWithProblemType = await problemModel.find({
      problemType: { $regex: new RegExp(problemType, "i") },
    });

    const problemCount = await problemModel.countDocuments({
      problemType: { $regex: new RegExp(problemType, "i") },
    });

    res.json({ message: "Success", problems: problemsWithProblemType, count: problemCount });
  } catch (error) {
    next(error);
  }
});
// export const getAllProblemsForSelectedGradesForAllMonths = async (req, res) => {
//   try {
//     const selectedGrades = ["grade one", "grade two", "grade three"];

//     // Find the selected grades' IDs using the gradeModel
//     const selectedGradesIds = await gradeModel.find({
//       level: { $in: selectedGrades },
//     }).distinct('_id');

//     // Create an array of promises to fetch data for each grade level
//     const promises = selectedGrades.map(async (grade) => {
//       const pipeline = [
//         {
//           $match: {
//             grade: { $in: selectedGradesIds },
//           },
//         },
//         {
//           $group: {
//             _id: {
//               year: { $year: '$createdAt' },
//               month: { $month: '$createdAt' },
//               grade: '$grade',
//             },
//             totalProblems: { $sum: 1 },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             year: '$_id.year',
//             month: '$_id.month',
//             grade: '$_id.grade',
//             totalProblems: 1,
//           },
//         },
//         {
//           $match: { grade: grade }, // Filter for the specific grade level
//         },
//         {
//           $sort: { year: 1, month: 1, grade: 1 },
//         },
//       ];

//       return problemModel.aggregate(pipeline);
//     });

//     // Wait for all promises to resolve
//     const results = await Promise.all(promises);

//     // Combine the results for each grade level
//     const allMonths = Array.from({ length: 12 }, (_, index) => index + 1);
//     const finalResult = selectedGrades.map((grade, index) => {
//       const dataForGrade = results[index];

//       if (dataForGrade.length === 0) {
//         return {
//           name: grade,
//           data: allMonths.map(() => 0),
//         };
//       }

//       const enhancedData = dataForGrade.reduce((acc, entry) => {
//         const monthKey = `${entry.month}`;
//         acc[monthKey] = entry.totalProblems || 0;
//         return acc;
//       }, {});

//       return {
//         name: grade,
//         data: allMonths.map((month) => enhancedData[`${month}`] || 0),
//       };
//     });

//     res.status(200).json(finalResult);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

export const getAllProblemsForSelectedGradesForAllMonths = handleError(async (req, res, next) => {
  try {
    const { gradeLevel } = req.query;

    // Validate gradeLevel input
    if (!gradeLevel) {
      return res.status(400).json({ success: false, message: 'Grade level is required' });
    }

    // Find the grade level ID based on the provided gradeLevel
    const grade = await gradeModel.findOne({ level: gradeLevel });
    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade level not found' });
    }

    // Find all classes associated with the given gradeLevel
    const classes = await classModel.find({ grade: grade._id });

    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'No classes found for the specified grade level' });
    }

    // Find all students belonging to the selected classes
    const classIds = classes.map(cls => cls._id);
    const students = await studentModel.find({ classId: { $in: classIds } }, '_id');

    // Define an array to store problem counts for each month
    const problemCounts = [];

    // Get the current date
    const currentDate = new Date();

    // Loop through the last 12 months
    for (let month = 0; month < 12; month++) {
      // Calculate the start date for the current month
      const startDate = moment(currentDate).subtract(month, 'months').startOf('month').toDate();
      // Calculate the end date for the current month
      const endDate = moment(currentDate).subtract(month, 'months').endOf('month').toDate();

      // Aggregate problem counts for the current month
      const problemCount = await problemModel.countDocuments({
        studentId: { $in: students.map(student => student._id) },
        createdAt: { $gte: startDate, $lte: endDate }
      });

      // Push the problem count for the current month to the array
      problemCounts.push({
        month: moment(startDate).format('MMMM'),
        year: moment(startDate).format('YYYY'),
        count: problemCount
      });
    }

    // Return the problem counts for the last 12 months and specific gradeLevel
    res.json({
      success: true,
      data: problemCounts
    });
  } catch (error) {
    console.error('Error fetching problem counts for the last 12 months by grade level:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});