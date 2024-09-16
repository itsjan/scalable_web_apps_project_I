import { serve } from "./deps.js";
import { grade } from "./services/gradingService.js";

let state = -1;

const getCode = () => {
  state = (state + 1) % 5;

  if (state == 0) {
    return `
def hello():
  return "Hello world!"
`;
  } else if (state == 1) {
    return `
def hello():
  return "hello world!"
    `;
  } else if (state == 2) {
    return `
def ohnoes():
  return "Hello world!"
    `;
  } else if (state == 3) {
    return `
:D
      `;
  } else {
    return `
while True:
  print("Hmmhmm...")
    `;
  }
};
const post_ping  = (req, mappingResult) => { 
  return new Response("POST PING", { status: 200 })
};

const post_for_grading = async (req, mappingResult) => {
  let requestData = {};
  try {
    requestData = await req.json();
  } catch (error) {
    console.log("Error parsing JSON", error);
  }
  const code = requestData.code || getCode();
  const testCode = requestData.testCode || "";
  console.log({ code, testCode });
  return new Response ("POST FOR GRADING", { status: 200 })
  
};

const urlMap = [
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/api/grade/ping" }),
    fn: post_ping,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/api/grade/" }),
    fn: post_for_grading,
  },
];

const gradingDemo = async () => {
  let code = getCode();

  const testCode = `
import socket
def guard(*args, **kwargs):
  raise Exception("Internet is bad for you :|")
socket.socket = guard

import unittest
from code import *

class TestHello(unittest.TestCase):

  def test_hello(self):
    self.assertEqual(hello(), "Hello world!", "Function should return 'Hello world!'")

if __name__ == '__main__':
  unittest.main()  
`;

  return await grade(code, testCode);
};

const _del_handleRequest = async (request) => {
  // the starting point for the grading api grades code following the
  // gradingDemo function, but does not e.g. use code from the user
  let result;
  try {
    const requestData = await request.json();

    console.log("Request data:");
    console.log(requestData);

    const code = requestData.code;
    const testCode = requestData.testCode;

    result = await grade(code, testCode);
  } catch (e) {
    result = await gradingDemo();
  }

  // in practice, you would either send the code to grade to the grader-api
  // or use e.g. a message queue that the grader api would read and process

  return new Response(JSON.stringify({ result: result }));
};


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

const portConfig = { port: 7000, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
