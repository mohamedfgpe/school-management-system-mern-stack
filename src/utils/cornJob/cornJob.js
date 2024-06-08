import cron from "node-cron";
import { sendMonthlyNotifications } from '../../modules/notification/sendMonthlyNotifications.controller';

import { generateMonthlyReport } from '../../modules/studemtAbsence/studentAbsence.controller';

// Schedule the monthly notifications to run every day at a specific time (e.g., midnight)
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running monthly notifications...");
    await sendMonthlyNotifications();
    console.log("Monthly notifications sent successfully!");
  } catch (error) {
    console.error("Error sending monthly notifications:", error.message);
  }
});



// Schedule the monthly report generation at the end of each month (e.g., at 23:59 on the last day)
cron.schedule('59 23 28-31 * *', async () => {
  // Call the controller to generate the monthly report
  await generateMonthlyReport();
});
