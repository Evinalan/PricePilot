
const cron = require("node-cron");

const trackPrices = require("../services/priceTrackingService");

let isTracking = false;

// Run the tracking process
const runTracking = async () => {

  if (isTracking) {
    console.log("Previous tracking process is still running.");
    return;
  }

  isTracking = true;

  try {

    console.log("Starting automatic price tracking...");

    await trackPrices();

    console.log("Price tracking completed successfully!");

  } catch (error) {

    console.error("Price tracking failed:", error);

  } finally {

    isTracking = false;

  }
};

// Run immediately when the server starts
runTracking();

// Run every 30 minutes afterwards
cron.schedule("*/30 * * * *", runTracking);

console.log("Background price tracking job scheduled!");
