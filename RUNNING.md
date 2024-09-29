# Running the project

## Prerequisites

- Docker
- Docker Compose

## Running the project

```
docker compose up
```

The application will be available at http://localhost:7800


# Playwright tests

```
docker compose run --rm --entrypoint=npx e2e-playwright playwright test
```
Three tests required for passing the course project are run:

- [x]  (1) creating a submission that fails the tests and checking the feedback on incorrect submission,
- [x]  (2) creating a submission that passes the tests and checking the notification on the correctness of the submission, and
- [x]  (3) creating a submission that passes the tests, checking the notification on the correctness of the submission, moving to the next assignment, and checking that the assignment is a new one.

Requirements for Merits:

- [x] There are additional Playwright tests that verify that the points shown to the user change when the user solves a programming assignment.
