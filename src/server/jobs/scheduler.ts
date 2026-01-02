import { JOB_TZ } from "./config";
import { EmailJobName, ComplianceJobName } from "./job-names";
import { complianceQueue, emailQueue } from "./queues";

async function main() {
  // Repeatable jobs (cron patterns).
  // NOTE: These are domain-specific placeholders until the Property Management schema exists.
  await complianceQueue.add(
    ComplianceJobName.DailyLeaseExpirationCheck,
    { dryRun: true },
    { repeat: { pattern: "0 8 * * *", tz: JOB_TZ }, jobId: ComplianceJobName.DailyLeaseExpirationCheck }
  );

  await emailQueue.add(
    EmailJobName.RentDueReminders,
    { dryRun: true },
    { repeat: { pattern: "0 9 1 * *", tz: JOB_TZ }, jobId: EmailJobName.RentDueReminders }
  );

  await complianceQueue.add(
    ComplianceJobName.DailyLateFeeCalculation,
    { dryRun: true },
    { repeat: { pattern: "0 1 * * *", tz: JOB_TZ }, jobId: ComplianceJobName.DailyLateFeeCalculation }
  );

  await complianceQueue.add(
    ComplianceJobName.MonthlySecurityDepositInterestCalculation,
    { dryRun: true },
    {
      repeat: { pattern: "0 2 1 * *", tz: JOB_TZ },
      jobId: ComplianceJobName.MonthlySecurityDepositInterestCalculation,
    }
  );

  await complianceQueue.add(
    ComplianceJobName.DailyLicenseExpirationCheck,
    { dryRun: true },
    { repeat: { pattern: "0 7 * * *", tz: JOB_TZ }, jobId: ComplianceJobName.DailyLicenseExpirationCheck }
  );

  console.log("✅ Scheduler: repeatable jobs registered.");
}

main()
  .then(async () => {
    await Promise.all([complianceQueue.close(), emailQueue.close()]);
  })
  .catch(async (err) => {
    console.error("❌ Scheduler failed:", err);
    await Promise.allSettled([complianceQueue.close(), emailQueue.close()]);
    process.exitCode = 1;
  });

