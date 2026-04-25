import cron from "node-cron";

export const startCron = () => {
  cron.schedule("0 9 * * *", () => {
    console.log("Reminder sent");
  });
};
