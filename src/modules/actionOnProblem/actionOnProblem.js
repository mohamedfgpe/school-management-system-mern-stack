import moment from "moment";
import { actionOnProblemModel } from "../../../db/models/actionOnProblem.model.js";
import { problemModel } from "../../../db/models/problem.model.js";
import { userModel } from "../../../db/models/user.model.js";
import { handleError } from "../../middleware/handleAsyncError.js";

export const addActionOnProblem = handleError(async (req, res, next) => {
  const { problemId } = req.params;
  const { action, addedBy } = req.body;

  if (!problemId || !action || !addedBy) {
    return res.status(400).json({ error: "problemId, action, and addedBy are required in the request parameters" });
  }

  const problem = await problemModel.findById(problemId);
  if (!problem) {
    return res.status(404).json({ error: "Problem not found" });
  }

  const user = await userModel.findById(addedBy);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newAction = await actionOnProblemModel.create({ problemId, action, addedBy });
  res.json({ message: "Success", newAction });
});

// Get actions performed by a specific user
export const getActionsByUser = handleError(async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required in the request parameters" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const actionsByUser = await actionOnProblemModel.find({ addedBy: userId }).populate('problemId');
    const actionsCount = await actionOnProblemModel.countDocuments({ addedBy: userId });

    res.json({ message: "Success", user, actions: actionsByUser, actionsCount });
  } catch (error) {
    // next(error);
    res.json({error:error.name})
  }
});

// Get detailed statistics and generate a monthly report


export const getMonthlyReport = handleError(async (req, res, next) => {
  const { year, month } = req.params;

  // Validate input parameters
  if (!year || !month) {
    return res.status(400).json({ error: "Year and month are required in the request parameters" });
  }

  try {
    // Set day to 1 to avoid issues with months that have different numbers of days
    const startDate = moment([year, month - 1, 1]).startOf('month');

    // Set day to the last day of the month
    const endDate = moment([year, month - 1]).endOf('month');

    // Log start and end dates for debugging
    console.log("startDate:", startDate.format());
    console.log("endDate:", endDate.format());

    // Count total problems
    const totalProblemCount = await problemModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    console.log("Total Problem Count:", totalProblemCount);

    // Count resolved problems
    const resolvedProblemCount = await problemModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      actionTaken: { $exists: true },
    });

    console.log("Resolved Problem Count:", resolvedProblemCount);

    // Count unresolved problems
    const unresolvedProblemCount = await problemModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      actionTaken: { $exists: false },
    });

    console.log("Unresolved Problem Count:", unresolvedProblemCount);

    // Find the most common action
    const mostCommonAction = await actionOnProblemModel.aggregate([
      {
        $match: { createdAt: { $gte: startDate, $lte: endDate } },
      },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    console.log("Most Common Action:", mostCommonAction);

    // Return the response
    res.json({
      message: "Success",
      totalProblemCount,
      resolvedProblemCount,
      unresolvedProblemCount,
      mostCommonAction: mostCommonAction[0] || { _id: "No actions taken", count: 0 },
    });
  } catch (error) {
    console.error("Error in getMonthlyReport:", error);

    // Handle specific error case for 'createdAt' field
    if (error.name === 'CastError' && error.path === 'createdAt') {
      return res.status(400).json({ error: "Invalid date format for 'createdAt' field" });
    }

    // Respond with JSON format for other errors
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const getUnactionedProblems = handleError(async (req, res, next) => {
  try {
    // Find all problems, populate the 'studentId' and 'addedBy' fields with corresponding data
    const problems = await problemModel.find().populate('studentId', 'name').populate('addedBy', 'name');

    // Find all actions on problems
    const actions = await actionOnProblemModel.find();

    // Extract problem IDs from actions
    const problemsWithAction = actions.map(action => action.problemId.toString());

    // Filter problems without action
    const problemsWithoutAction = problems.filter(problem => !problemsWithAction.includes(problem._id.toString()));

    res.status(200).json({ success: true, data: problemsWithoutAction});
} catch (error) {
    console.error('Error in getting problems without action:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
}
});


