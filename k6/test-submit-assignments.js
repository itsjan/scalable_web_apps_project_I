
/*
http://localhost:7800/api/user/163eee0c-e409-4cd4-b506-72b4f8999a19/submissions/1

{"code":"def hello():\n  # return Hello\n  return \"Hello\""}

*/


import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 10,
  duration: "10s",
  summaryTrendStats: ["med", "p(99)"],
};

/*
    Generate unique user id for each submission
    Modified from source: https://dev.to/arsalanmeee/generating-uuid-in-javascript-a-step-by-step-guide-3n6l
*/
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
    });
    }



export default function () {
    const user = generateUUID();
  http.post(
    `http://localhost:80/api/user/${user}/submissions/1`,
    JSON.stringify({"code":`def hello():\n  # ${user}  return \"Hello\"`}
    ),
  );
}
