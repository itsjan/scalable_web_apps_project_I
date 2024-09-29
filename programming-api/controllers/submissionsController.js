// filename: submissionController.js

//import * as submissionService from "../services/submissionService.js";

// const submitSolutionForGrading = async (c, ws) => {
//   const assignmentId = c.req.param("assignmentId");
//   const userUuid = c.req.param("userUuid");
//   const body = await c.req.json();
//   const code = body.code;

//   try {
//     const result = await submissionService.submitSolutionForGrading(
//       userUuid,
//       assignmentId,
//       code,
//     );
//     console.log("Submission result:", result);

//     ws.send(JSON.stringify({ type: "submission_update", submission: result }));

//     return c.json({ ...result, ok: true }, 200);
//   } catch (error) {
//     return c.json({ message: "Internal Server Error", ok: false }, 500);
//   }
// };

// const getSubmissionsByUser = async (c) => {
//   console.log("Starting getSubmissionsByUser function");
//   const assignmentId = c.req.param("assignmentId");
//   const userUuid = c.req.param("userUuid");

//   console.log("Assignment ID:", assignmentId);
//   console.log("User UUID:", userUuid);

//   try {
//     const submissions = await submissionService.submissionsByUser(
//       assignmentId,
//       userUuid,
//     );
//     console.log("Submissions retrieved:", submissions);

//     return c.json({ submissions });
//   } catch (error) {
//     console.error("Error in getSubmissionsByUser:", error);
//     return c.json({ message: "Internal Server Error", ok: false }, 500);
//   }
// };

// const getAllSubmissionsByUser = async (c) => {
//   console.log("Starting getAllSubmissionsByUser function");
//   const userUuid = c.req.param("userUuid");

//   console.log("User UUID:", userUuid);

//   try {
//     const allSubmissions = await submissionService.getAllSubmissionsByUser(
//       userUuid,
//     );
//     console.log("All submissions retrieved:", allSubmissions);

//     return c.json({ submissions: allSubmissions });
//   } catch (error) {
//     console.error("Error in getAllSubmissionsByUser:", error);
//     return c.json({ message: "Internal Server Error", ok: false }, 500);
//   }
// };

export {
  //getAllSubmissionsByUser,
  //getSubmissionsByUser,
  //submitSolutionForGrading,
};
