# Designing and Building Scalable Web Applications / Course Project I

This repository contains a submission Aalto University FITECH 101 course **Designing and Building Scalable Web Applications** course **project I**.

## Compliance to Requirements

This submission complies to all requirements including those included in the requirements for Merit.

#### Requirements for passing

The requirements for completing the project are as follows.

- [x] The basic functionality outlined in the Project Handout is **implemented and works for multiple users (test e.g. with incognito mode).**
- [x] The implementations are done with the technologies practiced in this course.
- [x] When a programming assignment is submitted, the submission is stored into the database table programming_assignment_submissions.
- [x] Upon submission, submissions with the same code to the same assignment are looked for from the database table.
- [x] If a matching entry is found, the values for submission_status, grader_feedback, and correct are copied from the matching submission, and the code is not sent for grading.
- [x] Otherwise, the submission is sent for grading.
- [x] When the submission is sent for grading, information on the submission is added to a queue that is processed one by one. **Queue is in Redis.**
- [x] Grading service can take ask for a new submission whenever the old one was processed. **Polls the Redis Queue**
- [x] Once the grading has completed, the values for submission_status, grader_feedback, and correct for the submission are updated.
- [x] Submissions, each of them are added to the queue, and they are processed one by one (i.e., there will not be hundred grading processes running in parallel).
- [x] When a user has submitted a programming assignment, there is a mechanism in use that allows updating the submission status: **a Web Socket connection is maintained betwen the UI client and Programming API Server.** 
- [x] The user should not, however, have to refresh the page to see updates. **UI updates are reflected upon receiving status updates from the Programming API server through the web socket**
- [x] The project has both development and production configuration. The configurations are sensible and serve their purpose. **Both are provided in docker compose files**
- [x] There are at least three end to end tests written with Playwright. **The tests cover (1) creating a submission that fails the tests and checking the feedback on incorrect submission, (2) creating a submission that passes the tests and checking the notification on the correctness of the submission, and (3) creating a submission that passes the tests, checking the notification on the correctness of the submission, moving to the next assignment, and checking that the assignment is a new one.**
- [x] There are performance tests written with k6 that are used for **(1) measuring the performance of loading the assignment page and (2) measuring the performance of submitting assignments.** The test results are filled in to the [PERFORMANCE_TEST_RESULTS.md](PERFORMANCE_TEST_RESULTS.md) that was included in the assignment template.
- [x] There is a brief description of the application in [REFLECTION.md](REFLECTION.md) that highlights the **key design decisions** for the application. The document also contains a **reflection of possible improvements** that should be done to improve the performance of the application.
- [x] Necessary files needed to run the application are present in the submission. The [RUNNING.md](RUNNING.md) briefly outlines steps needed to run the application.

#### Requirements for passing with merits

In addition to fulfilling all the requirements needed to pass the project, outlined above, passing the project with merits requires the following.

- [x] A single user (defined by the user uuid) can have at most one programming assignment submission in grading at a time. If a user with the same user uuid attempts to submit another programming assigment while the previous one is still being graded, the submission is rejected. **Implemented on the DB layer, by having a unique index ON programming_assignment_submissions (user_uuid)
WHERE status = 'pending'**.
- [x] The application has a top bar that shows the points for the current user. Each correctly solved programming exercise corresponds to 100 points (solving the same assignment multiple times does not count). Whenever the user completes an assignment, the points are increased by 100. When the user reopens the application, the user is shown the amount of points that corresponds to the users' current progress.
- [x] There are additional Playwright tests that verify that the points shown to the user change when the user solves a programming assignment. **e2e-playwright/tests/test-4.spec.ts**
- [x] There are two deployments of grader-api, both used to process submissions, and the number of deployments can be scaled up without much effort. There is a mechanism in play that seeks to guarantee that the deployments have a balanced amount of work, while also ensuring that grader deployments do not end up processing the same submission. **Production configuration is provided in docker-compose.prod.yml. for two deployments of grader-api. Servers reveive work by pulling work from a Redis list of submissions when they are ready to work.**
- [x] Database query results are cached (when it is meaningful to do so from the performance point of view). As an example, the programming assignments can be stored in a cache either on the server needing them or in a separate Redis cache. Cache purge mechanisms are in place. **Programming API caches the query for the get("/api/assignments") endpoint. **The cache is invalidated when new assignments are inserted.****
- [x] The application looks and feels good to use. The application is styled using TailwindCSS, the styles are meaningful, and the styling is consistent. **The application is styled using TailwindCSS with meaningful and consistant styles.**

