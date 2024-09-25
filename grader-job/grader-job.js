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
  const client = await getRedisClient();

  while (true) {
    try {
      // Pop a message from the right end of the 'submissions' list
      const message = await client.rpop("submissions");

      if (message) {
        console.log("Received submission:", message);
        // Parse the message JSON
        const submission = JSON.parse(message);

        // Post the submission id to the grader API
        try {
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
      } else {
        // If no message, wait for a short time before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error polling submissions:", error);
      // Wait before retrying in case of error
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Start polling
pollSubmissions();
