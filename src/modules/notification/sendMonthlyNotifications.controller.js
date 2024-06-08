import { studentModel } from "../../../db/models/student.model.js";
import { problemModel } from "../../../db/models/problem.model.js";
import { userModel } from "../../../db/models/user.model.js";
import { handleError } from "../../middleware/handleAsyncError.js";
import { sendWhatsAppMessage } from '.sendNotification.js';
import { sendEmail } from '.sendNotification.js';

// Send notifications to managers when total problems exceed 10 times for each student every month
export const sendMonthlyNotifications = handleError(async () => {
  const students = await studentModel.find();
  const admins = await userModel.find({ role: "admin" });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, currentMonth, 1);
  const endDate = new Date(currentYear, currentMonth + 1, 0);

  await Promise.all(
    students.map(async (student) => {
      const studentProblemsCount = await problemModel.countDocuments({
        studentId: student._id,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      if (studentProblemsCount > 10) {
        const adminEmails = admins.map((admin) => admin.email);
        const adminPhoneNum = admins.map((admin) => admin.phoneNum);


        // Send email notification
        const emailNotification = {
          to: adminEmails,
          subject: `Monthly Notification - Student ${student.name}`,
          text: `The student ${student.name} has reported ${studentProblemsCount} problems this month. Please review.`,
        };
        await sendEmail(emailNotification);

        // Send WhatsApp message
        const whatsappMessage = {
          to: adminPhoneNum, // Replace with WhatsApp numbers
          body: `Monthly Notification - Student ${student.name}: ${studentProblemsCount} problems reported this month. Please review.`,
        };
        await sendWhatsAppMessage(whatsappMessage);
      }
    })
  );
});
