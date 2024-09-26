import { getRedisClient } from "./database/redis.js";
import { grade } from "./services/gradingService.js";

// Function to poll messages from the 'submissions' list
async function pollSubmissions() {
  const client = await getRedisClient();

  while (true) {
    let result = null;
    try {
      // Pop a message from the right end of the 'submissions' list
      client.rpop("submissions").then(async (message) => {
        if (message !== null) {
          console.log("Received submission:", message);
          const submission = JSON.parse(message);
          console.log("Parsed submission:", submission);

          const code = submission.code;
          const testCode = submission.test_code;

          try {
            result = await grade(code, testCode);
          } catch (e) {
            console.log("Error grading submission:", e);
          } finally {
            console.log("RESULT BEGIN:");
            console.log(result);
            console.log("RESULT END:");

            const isCorrect = result.includes("\nOK") || false;

            const gradingResult = {
              user_uuid: submission.user_uuid,
              id: submission.id,
              grader_feedback: result,
              correct: isCorrect,
              status: "processed",
            };
            console.log("Grading result:", gradingResult);

            client.lpush("results", JSON.stringify(gradingResult));
          }
        }
      });
    } catch (error) {
      console.error("Error polling submissions:", error);
      // Wait before retrying in case of error
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Start polling
pollSubmissions();
