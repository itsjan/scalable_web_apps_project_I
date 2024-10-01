# Running the project

## Prerequisites

- Docker
- Docker Compose

## Deploying and running the DEVELOPMENT environment

1. Open a terminal and navigate to the project directory.
2. Run the following command:

```
docker compose up
```
3. Open a browser and navigate to http://localhost:7800

## Deploying and running the PRODUCTION environment

1. Open a terminal and navigate to the project directory.
2. Run the following command:

```
docker compose -f docker-compose.prod.yml up -d
```

3. Open a browser and navigate to http://localhost:80

## Playwright tests

```
docker compose run --entrypoint=npx e2e-playwright playwright test && docker rm $(docker ps -a -q --filter name=e2e-playwright)
```
Three tests required for passing the course project are run:

- [x]  (1) creating a submission that fails the tests and checking the feedback on incorrect submission,
- [x]  (2) creating a submission that passes the tests and checking the notification on the correctness of the submission, and
- [x]  (3) creating a submission that passes the tests, checking the notification on the correctness of the submission, moving to the next assignment, and checking that the assignment is a new one.

Requirements for Merits:

- [x] (4) verify that the points shown to the user change when the user solves a programming assignment.
