import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";
import { serve } from "./deps.js";


//const cachedAssignmentsService = cacheMethodCalls(programmingAssignmentService, [
//  "findAll",
//]);

const _handleRequest = async (request) => {
  const programmingAssignments = await programmingAssignmentService.findAll();

  const requestData = await request.json();
  const testCode = programmingAssignments[0]["test_code"];
  const data = {
    testCode: testCode,
    code: requestData.code,
  };

  const response = await fetch("http://grader-api:7000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
};

const get_assignments = async (req) => {
  try {
    const assignments = await programmingAssignmentService.findAll();

    console.log({ assignments });
    return Response.json(assignments);
  } catch (error) {
    console.log(error);
    return new Response("ERROR", { status: 500 });
  }
};

const get_assignments_for_user = async (req, mappingResult) => {
  try {
    const userId = mappingResult.pathname.groups.userId;
    const assignments =
      await programmingAssignmentService.findAllForUser(userId);
    const lastOneCompleted = (await programmingAssignmentService.lastAssignmentCompletedByUser( userId)) ?? 0;
    const correctSolutions = await programmingAssignmentService.correctSubmissionsByUser( userId);
    
    console.log({ assignments, lastOneCompleted, correctSolutions });
    return Response.json({ assignments, lastOneCompleted, correctSolutions });
  } catch (error) {
    console.log(error);
    return new Response("ERROR", { status: 500 });
  }
};

const urlMap = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/api/assignments" }),
    fn: get_assignments,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/api/user/:userId/assignments" }),
    fn: get_assignments_for_user,
  },
];

const handleRequest = async (request) => {
  console.log(request);
  const path = new URL(request.url).pathname;

  const mapping = urlMap.find(
    (um) => um.method === request.method && um.pattern.test(request.url),
  );
  console.log({ path, mapping });
  console.log(`method: ${request.method} url: ${request.url}`);

  if (!mapping) {
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  return await mapping.fn(request, mappingResult);
};

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
