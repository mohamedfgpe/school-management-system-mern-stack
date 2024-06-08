import { classModel } from "../../../db/models/class.model.js";
import { gradeModel } from "../../../db/models/grade.model.js";
import { studentModel } from "../../../db/models/student.model.js";
import { StudentAbsencesModel } from "../../../db/models/studentAbsence.model.js";
import { handleError } from "../../middleware/handleAsyncError.js";
import { startSession } from 'mongoose';
import { problemModel } from './../../../db/models/problem.model.js';
import moment from "moment";
import { userModel } from './../../../db/models/user.model.js';

function addHyphenBetweenLetterAndNumberAndCheck(inputString, existingArray) {
  // Use regular expression to find occurrences of a letter followed by a number with optional spaces
  const modifiedString = inputString.replace(/([a-zA-Z])\s?(\d)/g, '$1-$2').toUpperCase();

  // Check if the modified string exists in the array
  const existsInArray = existingArray.includes(modifiedString);

  return { modifiedString, existsInArray };
}
let existClasses = [
  "A-1","A-2","A-3","A-4","A-5","A-6","A-7","B-1","B-2","B-3","B-4","B-5","B-6","B-7","C-1","C-2","C-3","C-4","C-5","C-6",
  "UNKNOWN",
];



export const createClass = handleError(async (req, res, next) => {
  try {
    const { code, gradeLevel } = req.body;

    // Check if the grade level is provided
    if (!gradeLevel) {
      return res.status(400).json({ error: "Grade level is required" });
    }

    // Find the grade based on the provided level
    const grade = await gradeModel.findOne({ level: gradeLevel });

    if (!grade) {
      return res.status(404).json({ message: `Grade level ${gradeLevel} not found` });
    }

    // Transform and check the modified class code
    const { modifiedString, existsInArray } = addHyphenBetweenLetterAndNumberAndCheck(code, existClasses);

    if (!existsInArray) {
      return res.status(409).json({ error: "Class code is on correct" });
    }

    // Check if a class with the same modified code already exists
    const existingClass = await classModel.findOne({ code: modifiedString });

    if (existingClass) {
      return res.status(409).json({
        error: "Class with the code already exists",
      });
    }

    // Create a new class with the provided code and associated grade
    const newClass = await classModel.create({ code: modifiedString, grade: grade._id });

    res.json({ message: "Success", newClass });
  } catch (error) {
    // Handle errors here
    console.error("Error creating class:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});






  export const getAllClassesInfo = handleError(async (req, res) => {
    try {
      // Retrieve all grades
      const grades = await gradeModel.find();
  
      const stats = [];
  
      // Iterate over each grade
      for (const grade of grades) {
        // Find all classes for this grade
        const classes = await classModel.find({ grade: grade._id });
  
        // Iterate over each class
        for (const cls of classes) {
          // Calculate student count
          const studentCount = await studentModel.countDocuments({ classId: cls._id });
  
          // Calculate absence count for this class
          const absenceCount = await StudentAbsencesModel.aggregate([
            {
              $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
              }
            },
            {
              $unwind: '$student'
            },
            {
              $match: {
                'student.classId': cls._id
              }
            },
            {
              $count: 'absenceCount'
            }
          ]);
  
          // If absenceCount is empty, set it to 0
          const absenceCountValue = absenceCount.length > 0 ? absenceCount[0].absenceCount : 0;
  
          // Calculate problem count for this class
          const problemCount = await problemModel.aggregate([
            {
              $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
              }
            },
            {
              $unwind: '$student'
            },
            {
              $match: {
                'student.classId': cls._id
              }
            },
            {
              $count: 'problemCount'
            }
          ]);
  
          // If problemCount is empty, set it to 0
          const problemCountValue = problemCount.length > 0 ? problemCount[0].problemCount : 0;
  
          // Push stats for this class
          stats.push({
            _id: cls._id,
            gradeLevel: grade.level,
            classCode: cls.code,
            studentCount,
            absenceCount: absenceCountValue,
            problemCount: problemCountValue
          });
        }
      }
  
      res.json({message :"success", result:stats});
    } catch (error) {
      console.error('Error fetching classes information:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });;
  
  

  export const searchClassByCode = handleError(async (req, res) => {
    try {
      const { code } = req.params;
  
      // Use the utility function to modify the class code and check its existence
      const existClass = addHyphenBetweenLetterAndNumberAndCheck(code, existClasses);
  
      if (!existClass.existsInArray) {
        return res.status(404).json({
          error: "Class not found",
        });
      }
  
      // Find the class based on the modified class code
      const targetClass = await classModel.findOne({ code: existClass.modifiedString });
  
      if (!targetClass) {
        return res.status(404).json({
          error: "Class not found",
        });
      }
  
      // Aggregate to get class information including student, absence, and problem counts
      const classInfo = await classModel.aggregate([
        {
          $match: { _id: targetClass._id },
        },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: 'classId',
            as: 'students',
          },
        },
        {
          $lookup: {
            from: 'studentabsences',
            localField: '_id',
            foreignField: 'studentId.classId',
            as: 'absences',
          },
        },
        {
          $lookup: {
            from: 'problems',
            localField: '_id',
            foreignField: 'studentId.classId',
            as: 'problems',
          },
        },
        {
          $project: {
            code: 1,
            grade: 1,
            studentCount: { $size: '$students' },
            absenceCount: { $size: '$absences' },
            problemCount: { $size: '$problems' },
          },
        },
      ]);
  
      res.json( {message:"success",result:classInfo}); // Assuming there will be only one result since searching by class code
    } catch (error) {
      console.error('Error searching class:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  export const deleteClassWithStudents = async (req, res) => {
    const session = await startSession();
  
    try {
      await session.withTransaction(async () => {
        const classId = req.params.classId;
  
        // Find the class
        const foundClass = await classModel.findById(classId).session(session);
  
        if (!foundClass) {
          res.status(404).json({ error: 'Class not found' });
          return;
        }
  
        // Find and delete students associated with the class
        const deletedStudents = await studentModel.deleteMany({ classId }).session(session);
  
        // Delete the class
        await classModel.findByIdAndDelete(classId).session(session);
  
        res.json({ message: 'Class and associated students deleted successfully', deletedStudents });
      });
    } catch (error) {
      console.error('Error deleting class and students:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      // Make sure to end the session after the transaction
      session.endSession();
    }
  };
  


  export const getClassAbsencesWithinDateRange = async (req, res) => {
    try {
      const { classId } = req.params;
      const { startDate, endDate } = req.query;
  
      // Validate classId
      if (!classId) {
        return res.status(400).json({ error: 'Class ID is required' });
      }
  
      let query = {};
  
      // Check if startDate and endDate are provided
      if (startDate && endDate) {
        // Validate startDate and endDate using moment
        if (!moment(startDate, 'YYYY-MM-DD', true).isValid() || !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
          return res.status(400).json({ error: 'Invalid date format. Please provide dates in YYYY-MM-DD format' });
        }
  
        // Convert startDate and endDate to moment objects
        const startMoment = moment(startDate, 'YYYY-MM-DD');
        const endMoment = moment(endDate, 'YYYY-MM-DD');
  
        // Add date filtering to the query
        query.createdAt = { $gte: startMoment.toDate(), $lte: endMoment.endOf('day').toDate() };
      }
  
      // Fetch students of the specified class
      const students = await studentModel.find({ classId });
  
      // Extract student IDs
      const studentIds = students.map(student => student._id);
  
      // Find absences for the extracted student IDs and date range
      const absences = await StudentAbsencesModel.find({
        studentId: { $in: studentIds },
        ...query
      }).populate('studentId', 'name') // Populate student name
      .populate('addedBy', 'name');
  
      if (absences.length === 0) {
        return res.json({ message: 'No absences within the specified date range' , result:[]});
      }
  
      res.json({ message: 'Success', result: absences , count:absences.length });
    } catch (error) {
      console.error('Error fetching class absences:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  


  // export const getProblemsByClass = handleError(async (req, res, next) => {
  //   try {
  //     const { classId } = req.params;
  //     const { startDate, endDate } = req.query;
  
  //     // Validate classId
  //     if (!classId) {
  //       return res.status(400).json({ error: "ClassId is required in the request parameters" });
  //     }
  
  //     const targetClass = await classModel.findById(classId);
  //     if (!targetClass) {
  //       return res.status(404).json({ error: "Class not found" });
  //     }
  
  //     let query = { classId };
  
  //     // Check if startDate and endDate are provided
  //     if (startDate && endDate) {
  //       // Validate startDate and endDate using moment
  //       if (!moment(startDate, 'YYYY-MM-DD', true).isValid() || !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
  //         return res.status(400).json({ error: 'Invalid date format. Please provide dates in YYYY-MM-DD format' });
  //       }
  
  //       // Convert startDate and endDate to moment objects
  //       const startMoment = moment(startDate, 'YYYY-MM-DD');
  //       const endMoment = moment(endDate, 'YYYY-MM-DD');
  
  //       // Add date filtering to the query
  //       query.createdAt = { $gte: startMoment.toDate(), $lte: endMoment.endOf('day').toDate() };
  //     }
  
  //     // Fetch students of the specified class
  //     const students = await studentModel.find({ classId });
  
  //     // Extract student IDs
  //     const studentIds = students.map(student => student._id);
  
  //     // Find problems associated with the students in the class and within the date range
  //     const problemsInClass = await problemModel.find({
  //       studentId: { $in: studentIds },
  //       ...query
  //     })
  
  //     const problemsInClassCount = problemsInClass.length;
  
  //     res.json({ message: "Success", targetClass, problemsInClassCount, problemsInClass });
  //   } catch (error) {
  //     console.error('Error fetching problems by class:', error);
  //     res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // });

  
  export const getProblemsByClass = handleError(async (req, res, next) => {
      try {
          const { classId } = req.params; // Assuming classId is passed as a route parameter
          let { startDate, endDate } = req.query; // Extracting startDate and endDate from query parameters
  
          // If startDate or endDate is not provided, set them to null
          if (!startDate || !endDate) {
              startDate = null;
              endDate = null;
          } else {
              // Parse dates using moment if they are provided
              startDate = moment(startDate);
              endDate = moment(endDate);
  
              // Validate dates
              if (!startDate.isValid() || !endDate.isValid()) {
                  return res.status(400).json({ error: 'Invalid date format' });
              }
          }
  
          // Find all students belonging to the specified class
          const students = await studentModel.find({ classId });
  
          // Extract student IDs
          const studentIds = students.map(student => student._id);
  
          // Construct query to find problems
          const query = { studentId: { $in: studentIds } };
          if (startDate && endDate) {
              query.createdAt = { $gte: startDate.toDate(), $lte: endDate.toDate() };
          }
  
          // Find all problems for students in the specified class within the optional date range
          const problems = await problemModel.find(query).populate({
              path: 'studentId',
              select: 'name', // Select only the name field of the student
              model: studentModel
          }).populate({
              path: 'addedBy',
              select: 'name', // Select only the name field of the user
              model: userModel // Assuming userModel is imported correctly
          });
  
          return res.status(200).json({ message: "success", problems, count: problems.length });
      } catch (error) {
          console.error('Error fetching problems by class:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  });
  

