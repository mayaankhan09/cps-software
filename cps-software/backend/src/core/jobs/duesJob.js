// This file sets up the automatic monthly dues-generation job using
// node-cron. It is only a SCHEDULER — the actual work happens in
// generateMonthlyDues() (see feeDue.service.js).
//
// IMPORTANT: this job only runs while this Node process is alive. While
// you're just running the server on your own laptop, it'll stop the moment
// you close the terminal — so don't worry if the 5th comes and goes while
// the server isn't running, nothing breaks (you can always trigger
// generation manually via POST /api/fee-dues/generate to catch up). Once
// this backend is deployed somewhere that's kept running, this will fire
// reliably every month with no one needing to remember to run it by hand.

import cron from "node-cron";
import { generateMonthlyDues, getCurrentMonthString } from "../../modules/feeDues/feeDue.service.js";
import { getCurrentAcademicYear } from "../../modules/students/student.service.js";

// "At 00:00 on day-of-month 5, every month." See https://crontab.guru if
// you want to double check what a cron expression means.
const SCHEDULE = "0 0 5 * *";

export function startDuesJob() {
  cron.schedule(SCHEDULE, async () => {
    const academicYear = getCurrentAcademicYear();
    const month = getCurrentMonthString();

    console.log(`[duesJob] Running scheduled dues generation for ${month} (academic year ${academicYear})...`);

    try {
      await generateMonthlyDues(academicYear, month);
    } catch (error) {
      // A scheduled job has no HTTP request to send an error back to, so
      // the best we can do is log it clearly and let the next run (or a
      // manual trigger) try again.
      console.error("[duesJob] Scheduled dues generation failed:", error);
    }
  });

  console.log(`[duesJob] Scheduled — will run on the 5th of every month (cron: "${SCHEDULE}").`);
}
