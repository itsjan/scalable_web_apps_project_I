import * as submissionService from "../services/submissionService.js";

const submitSolutionForGrading = async (c, matchresult) => {
  console.log("Starting submitSolutionForGrading function");
  console.log("c ........:", { ...c });
  const assignmentId = c.req.param("assignmentId");
  const userUuid = c.req.param("userUuid");
  const body = await c.req.json();
  const code = body.code;

  console.log("User ........:", { ...c });
  console.log("Assignment ID:", assignmentId);
  console.log("Code:", code);

  try {
    const result = await submissionService.submitSolutionForGrading(
      userUuid,
      assignmentId,
      code,
    );
    console.log("Submission result:", result);

    if (result.status === "ok") {
      return c.json({ submissionId: result.data[0].id });
    } else {
      return c.json({ message: result.message, ok: false }, 500);
    }
  } catch (error) {
    console.log("Error in submitSolutionForGrading:", error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
};

export { submitSolutionForGrading };
