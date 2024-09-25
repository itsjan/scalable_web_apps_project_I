import { getRedisClient } from "./database/redis.js";

/*
CREATE TABLE programming_assignment_submissions (
  id SERIAL PRIMARY KEY,
  programming_assignment_id INTEGER REFERENCES programming_assignments(id),
  code TEXT NOT NULL,
  user_uuid TEXT NOT NULL,
  status SUBMISSION_STATUS NOT NULL DEFAULT 'pending',
  grader_feedback TEXT,
  correct BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

// Function to poll messages from the 'submissions' list
async function pollSubmissions() {
  console.log("P O L L I N G");
  const client = await getRedisClient();
  console.log("Redis client connected");

  while (true) {
    try {
      console.log("Polling for new submissions...");
      // Pop a message from the right end of the 'submissions' list
      const message = await client.rpop("submissions");

      if (message) {
        console.log("Received submission:", message);
        // Parse the message JSON
        const submission = JSON.parse(message);
        console.log("Parsed submission:", submission);

        // Post the submission id to the grader API
        try {
          console.log("Sending submission to grader API...");
          const response = await fetch("/api/grade/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ submissionId: submission.id }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log("Submission sent to grader API successfully");
        } catch (error) {
          console.error("Error sending submission to grader API:", error);
        }

        // Process the message here
        console.log("Processing submission...");
      } else {
        console.log("No new submissions, waiting before next poll...");
        // If no message, wait for a short time before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error polling submissions:", error);
      console.log("Waiting before retrying...");
      // Wait before retrying in case of error
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Start polling
console.log("Starting submission polling...");
pollSubmissions();
