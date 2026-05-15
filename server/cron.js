const cron = require('cron');
const http = require('http');

const backendUrl = 'http://localhost:3001';

const job = new cron.CronJob('*/14 * * * *', function () {
  // This function will be executed every 14 minutes.
  console.log('Restarting server');

  // Perform an HTTP GET request to hit the backend API.
  http.get(backendUrl, (res) => {
    if (res.statusCode === 200) {
      console.log('Server restarted');
    } else {
      console.error(`Failed to restart server with status code: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('Error during Restart:', err.message);
  });
});

// Start the cron job.
job.start();

// Export the cron job.
module.exports = {
  job,
};
