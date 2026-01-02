export const EmailJobName = {
  Send: "email.send",
  RentDueReminders: "email.rentDueReminders",
} as const;

export const NotificationJobName = {
  Send: "notification.send",
} as const;

export const ComplianceJobName = {
  DailyLeaseExpirationCheck: "compliance.dailyLeaseExpirationCheck",
  DailyLateFeeCalculation: "compliance.dailyLateFeeCalculation",
  MonthlySecurityDepositInterestCalculation:
    "compliance.monthlySecurityDepositInterestCalculation",
  DailyLicenseExpirationCheck: "compliance.dailyLicenseExpirationCheck",
} as const;

export const ReportsJobName = {
  Generate: "reports.generate",
} as const;

export type JobName =
  | (typeof EmailJobName)[keyof typeof EmailJobName]
  | (typeof NotificationJobName)[keyof typeof NotificationJobName]
  | (typeof ComplianceJobName)[keyof typeof ComplianceJobName]
  | (typeof ReportsJobName)[keyof typeof ReportsJobName];

