import moment from 'moment';

import { StudentAbsencesModel } from '../../../db/models/studentAbsence.model.js';
import { handleError } from '../../middleware/handleAsyncError.js';
import { studentModel } from './../../../db/models/student.model.js';
import { userModel } from './../../../db/models/user.model.js';
import { classModel } from './../../../db/models/class.model.js';
import { gradeModel } from '../../../db/models/grade.model.js';

// export const createStudentAbsence = handleError(async (req, res, next) => {
//   try {
//     const { studentId, reason, isExcused, notes, addedBy } = req.body;

//     // Validate if studentId exists
//     const studentExists = await studentModel.exists({ _id: studentId });
//     if (!studentExists) {
//       return res.status(400).json({ err: 'Student not found' });
//     }

//     // Validate if addedBy user exists
//     const addedByUserExists = await userModel.exists({ _id: addedBy });
//     if (!addedByUserExists) {
//       return res.status(400).json({ err: 'AddedBy user not found' });
//     }

//     const studentAbsence = await StudentAbsencesModel.insertMany({
//       studentId,
//       reason,
//       isExcused,
//       notes,
//       addedBy,
//     });

//     res.json({ message: 'Success', studentAbsence });
//   } catch (error) {
//     console.error('Error in createStudentAbsence:', error); // Log the error for debugging
//     res.status(500).json({ err: 'Internal Server Error', error: error.message });
//   }
// });
export const createStudentAbsence = handleError(async (req, res, next) => {
  try {
    const absences = req.body; // Assuming req.body is an array of objects representing student absences

    // Validate if all studentIds exist
    const studentIds = absences.map(absence => absence.studentId);
    const studentsExist = await studentModel.find({ _id: { $in: studentIds } });
    const existingStudentIds = studentsExist.map(student => student._id.toString());

    absences.forEach(absence => {
      if (!existingStudentIds.includes(absence.studentId)) {
        return res.status(400).json({ err: `Student with ID ${absence.studentId} not found` });
      }
    });

    // Validate if addedBy users exist
    const addedByUserIds = absences.map(absence => absence.addedBy);
    const addedByUsersExist = await userModel.find({ _id: { $in: addedByUserIds } });
    const existingUserIds = addedByUsersExist.map(user => user._id.toString());

    absences.forEach(absence => {
      if (!existingUserIds.includes(absence.addedBy)) {
        return res.status(400).json({ err: `User with ID ${absence.addedBy} not found` });
      }
    });

    const studentAbsences = await StudentAbsencesModel.insertMany(absences);

    res.json({ message: 'Success', studentAbsences });
  } catch (error) {
    console.error('Error in createStudentAbsence:', error); // Log the error for debugging
    res.status(500).json({ err: 'Internal Server Error', error: error.message });
  }
});

export const getAllStudentAbsences = handleError(async (req, res, next) => {
    try {
      let { startDate, endDate } = req.query;
  
      // If startDate or endDate is provided, validate and format them using moment
      if (startDate) {
        if (!moment(startDate, 'YYYY-MM-DD', true).isValid()) {
          return res.status(400).json({ err: 'Invalid startDate format. Use YYYY-MM-DD.' });
        }
        startDate = moment(startDate, 'YYYY-MM-DD').startOf('day');
      }
  
      if (endDate) {
        if (!moment(endDate, 'YYYY-MM-DD', true).isValid()) {
          return res.status(400).json({ err: 'Invalid endDate format. Use YYYY-MM-DD.' });
        }
        endDate = moment(endDate, 'YYYY-MM-DD').endOf('day');
      }
  
      // Build the query based on optional date range
      const query = {};
      if (startDate && endDate) {
        query.createdAt = { $gte: startDate, $lte: endDate };
      }
  
      const allStudentAbsences = await StudentAbsencesModel.find(query);
  const count=allStudentAbsences.length
      res.json({ message: 'Success', allStudentAbsences ,count});
    } catch (error) {
      res.status(500).json({ err: 'Internal Server Error' });
    }
  });
  
  export const updateStudentAbsenceById = handleError(async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      // Validate if studentAbsence exists
      const studentAbsence = await StudentAbsencesModel.findById(id);
      if (!studentAbsence) {
        return res.status(404).json({ err: 'Student Absence not found' });
      }
  
      // Update studentAbsence
      const updatedStudentAbsence = await StudentAbsencesModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
  
      res.json({ message: 'Success', studentAbsence: updatedStudentAbsence });
    } catch (error) {
      res.status(500).json({ err: 'Internal Server Error' });
    }
  });
  
  export const deleteStudentAbsenceById = handleError(async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Validate if studentAbsence exists
      const studentAbsence = await StudentAbsencesModel.findById(id);
      if (!studentAbsence) {
        return res.status(404).json({ err: 'Student Absence not found' });
      }
  
      // Delete studentAbsence
      await StudentAbsencesModel.findByIdAndDelete(id);
  
      res.json({ message: 'Success', deletedStudentAbsence: studentAbsence });
    } catch (error) {
      res.status(500).json({ err: 'Internal Server Error' });
    }
  });
  export const getStudentAbsences = handleError(async (req, res, next) => {
    try {
      const { studentId } = req.params;
      let { startDate, endDate } = req.query;
  
      // If startDate or endDate is provided, validate and format them using moment
      if (startDate) {
        if (!moment(startDate, 'YYYY-MM-DD', true).isValid()) {
          return res.status(400).json({ err: 'Invalid startDate format. Use YYYY-MM-DD.' });
        }
        startDate = moment(startDate, 'YYYY-MM-DD').startOf('day');
      }
  
      if (endDate) {
        if (!moment(endDate, 'YYYY-MM-DD', true).isValid()) {
          return res.status(400).json({ err: 'Invalid endDate format. Use YYYY-MM-DD.' });
        }
        endDate = moment(endDate, 'YYYY-MM-DD').endOf('day');
      }
  
      // Build the query based on studentId and optional date range
      const query = { studentId };
      if (startDate && endDate) {
        query.createdAt = { $gte: startDate, $lte: endDate };
      }
  
      const studentAbsences = await StudentAbsencesModel.find(query);
      const count =studentAbsences.length
      res.json({ message: 'Success', studentAbsences ,count  });
    } catch (error) {
      res.status(500).json({ err: 'Internal Server Error' });
    }
  });
  

export const getAbsenceStatistics = handleError(async (req, res, next) => {
  try {
    // Get total number of student absences
    const totalAbsences = await StudentAbsencesModel.countDocuments();

    // Get the number of excused and unexcused absences
    const excusedAbsences = await StudentAbsencesModel.countDocuments({ isExcused: true });
    const unexcusedAbsences = await StudentAbsencesModel.countDocuments({ isExcused: false });

    // Get the most common absence reasons
    const mostCommonReasons = await StudentAbsencesModel.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }, // Change the limit based on your needs
    ]);

    res.json({
      message: 'Success',
      statistics: {
        totalAbsences,
        excusedAbsences,
        unexcusedAbsences,
        mostCommonReasons,
      },
    });
  } catch (error) {
    res.status(500).json({ err: 'Internal Server Error' });
  }
});


export const generateMonthlyReport = handleError(async (req, res, next) => {
  try {
    // Calculate the start and end dates for the current month
    const currentMonthStart = moment().startOf('month').format('YYYY-MM-DD');
    const currentMonthEnd = moment().endOf('month').format('YYYY-MM-DD');

    // Fetch the most absent student(s) within the current month
    const mostAbsentStudent = await StudentAbsencesModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(currentMonthStart), $lte: new Date(currentMonthEnd) },
        },
      },
      {
        $group: {
          _id: '$studentId',
          totalAbsences: { $sum: 1 },
        },
      },
      {
        $sort: { totalAbsences: -1 },
      },
      {
        $limit: 10, // You can adjust this based on how many top students you want to include
      },
    ]);

    res.json({ message: 'Success', monthlyReport: mostAbsentStudent });
  } catch (error) {
    res.status(500).json({ err: 'Internal Server Error' });
  }
})


export const getAbsencesForCurrentDay = handleError(async (req, res, next) => {
  try {
    // Get the start and end of the current day
    const currentDayStart = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const currentDayEnd = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');

    // Fetch absences for the current day
    const absencesForCurrentDay = await StudentAbsencesModel.find({
      createdAt: { $gte: new Date(currentDayStart), $lte: new Date(currentDayEnd) },
    });
const count =  absencesForCurrentDay.length;
    res.json({ message: 'Success', absencesForCurrentDay ,  count });
  } catch (error) {
    res.status(500).json({ err: 'Internal Server Error' });
  }
});

//  keyword or class or date
export const getAbsencesByKeywordOrClass = handleError(async (req, res, next) => {
  try {
    const { keyword, classCode, date } = req.query;
    let query = {};

    // Build the query based on the provided keyword and classCode
    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      query.$or = [
        { 'studentId.name': { $regex: keywordRegex } },
        { reason: { $regex: keywordRegex } },
      ];
    }

    if (classCode) {
      // Assuming the class code is stored in the 'code' field in the Class model
      const classId = await classModel.findOne({ code: classCode }, '_id');
      query.studentId = { $in: await studentModel.find({ classId }, '_id') };
    }

    // If date is provided, include it in the query
    if (date) {
      const startDate = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
      const endDate = moment(date, 'YYYY-MM-DD').endOf('day').toDate();
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Fetch absences based on the constructed query
    const absences = await StudentAbsencesModel.find(query);

    res.json({ message: 'Success', absences });
  } catch (error) {
    res.status(500).json({ err: 'Internal Server Error',error });
  }
});

export const getAbsencesForYear = handleError(async (req, res, next) => {
  try {
    const currentYear = moment().year();
    const allMonths = Array.from({ length: 12 }, (_, index) => index + 1);
    const uniqueGradeLevels = await gradeModel.distinct('level');

    const yearStart = moment(`${currentYear}-01-01`).startOf('year').toDate();
    const yearEnd = moment(`${currentYear}-12-31`).endOf('year').toDate();

    const monthlyGradeAbsences = await StudentAbsencesModel.aggregate([
      {
        $match: {
          createdAt: { $gte: yearStart, $lte: yearEnd },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'student.classId',
          foreignField: '_id',
          as: 'class',
        },
      },
      {
        $unwind: '$class',
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            grade: '$class.grade',
          },
          totalAbsences: { $sum: 1 },
        },
      },
    ]);

    console.log('monthlyGradeAbsences:', monthlyGradeAbsences);

    const formattedData = [];
    const seriesData = uniqueGradeLevels.map((gradeLevel) => {
      const data = allMonths.map((month) => {
        const matchingRecord = monthlyGradeAbsences.find(
          (item) =>
            item._id.month === month &&
            item._id.grade.equals(gradeLevel)
        );
        return matchingRecord ? matchingRecord.totalAbsences : 0;
      });

      formattedData.push({ name: gradeLevel, data });

      return { name: gradeLevel, data };
    });

    console.log('seriesData:', seriesData);

    const categories = allMonths.map((month) => moment(`${currentYear}-${month}`, 'YYYY-MM').format('MMMM'));

    res.json({
      message: 'Success',
      chartData: {
        series: seriesData,
        formattedData: formattedData,  // Include formattedData in the response
        options: {},
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// export const getAbsenceCountsByMonth = handleError(async (req, res, next) => {
//   try {
//     // Define an array to store absence counts for each month
//     const absenceCounts = [];

//     // Define an array of month names
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];

//     // Loop through each month from January to December
//     for (let month = 0; month < 12; month++) {
//       // Get the start and end dates for the current month
//       const startDate = new Date(new Date().getFullYear(), month, 1);
//       const endDate = new Date(new Date().getFullYear(), month + 1, 0);

//       // Aggregate to count absences for the current month
//       const absenceCount = await StudentAbsencesModel.countDocuments({
//         createdAt: { $gte: startDate, $lte: endDate }
//       });

//       // Push the absence count with the month name to the array
//       absenceCounts.push({
//         month: monthNames[month],
//         count: absenceCount
//       });
//     }

//     // Return the absence counts for each month
//     res.json({
//       success: true,
//       data: absenceCounts
//     });
//   } catch (error) {
//     console.error('Error fetching absence counts by month:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });


export const getAbsenceCountsByMonth = handleError(async (req, res, next) => {



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

    // Define an array to store absence counts for each month
    const absenceCounts = [];

    // Get the current date
    const currentDate = moment();

    // Loop through the last 12 months
    for (let month = 0; month < 12; month++) {
      // Calculate the start date for the current month
      const startDate = currentDate.clone().subtract(month, 'months').startOf('month').toDate();
      // Calculate the end date for the current month
      const endDate = currentDate.clone().subtract(month, 'months').endOf('month').toDate();

      // Aggregate to count absences for the current month for all classes
      const absencePromises = classes.map(async (targetClass) => {
        // Find all students belonging to the class
        const students = await studentModel.find({ classId: targetClass._id }, '_id');
        // Find absence counts for each student for the current month
        const studentAbsencesCounts = await StudentAbsencesModel.aggregate([
          {
            $match: {
              studentId: { $in: students.map(student => student._id) },
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 }
            }
          }
        ]);
        return studentAbsencesCounts.length > 0 ? studentAbsencesCounts[0].total : 0;
      });

      // Wait for all absence promises to resolve
      const absenceCountsForMonth = await Promise.all(absencePromises);

      // Calculate total absence count for the current month
      const totalAbsenceCount = absenceCountsForMonth.reduce((acc, count) => acc + count, 0);

      // Push the absence count for the current month to the array
      absenceCounts.push({
        month: startDate.toLocaleString('en-US', { month: 'long' }),
        year: startDate.getFullYear(),
        count: totalAbsenceCount
      });
    }

    // Return the absence counts for the last 12 months and specific gradeLevel
    res.json({
      success: true,
      data: absenceCounts
    });
  }
   catch (error) {
    console.error('Error fetching absence counts for the last 12 months by grade level:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Function to get month name from month number
function getMonthName(monthNumber) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[monthNumber];
}
