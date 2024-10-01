import http from "k6/http";

export const options = {
  vus: 10,
  duration: "10s",
  summaryTrendStats: ["med", "p(99)"], // report request duration using median and 99th percentile
};

export default function () {
    http.get("http://localhost:7800/api/assignments")
}