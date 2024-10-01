# REFLECTION

This provides a brief description of the Programming Assignments App, highlighting its key design decisions. It also includes a reflection on possible improvements that could be implemented to enhance the application's performance.


## Key Design Decisions

- **Microservices Architecture**: 
The architecture was given in the project starter pack. The app is built using a microservices architecture. The final app consist of the following services:
   - **SQL Database** (database) with a persistant storage volume in the local file system. This should be backed up at regular intervals in production.
   - **Redis Cache** (redis). Redis is for chaching relevant database queries. Only programming-api service uses Redis for caching the get("/api/assignments") endpoint. Cache is invalidated when new assignments are inserted. _The project does not have an Admin UI for maintaining the Assignments at this time_
   - **Nginx Reverse Proxy** (nginx) provides an entrypoint to the application, and routes http requests to each relevat services based on the request URL.
   - **Programming API** (programming-api) provides a REST API for the Programming UI to submit solutions for grading. It also provides a WebSocket endpoint for the Programming UI to receive updates on grading results. The Programming API is responsible for caching the get("/api/assignments") endpoint. Cache is invalidated when new assignments are inserted. Also, the database is checked for every new submission if a the solution is already graded (same code and assignment), thus preventing duplicate grading work. Therefore the database acts as a cache for the post("/api/submissions") endpoint.
   - **Programming UI** (programming-ui): Astro, Svelte, Tailwind CSS. Production configuration includes a Node web server.
   - **Grader API** (grader-api). A scalable microservice that receives requests from the Programming API through a Redis queue. Responsible for grading submissions, and returning the result to a Redis queue. There is no HTTP API for this service, therefore it is easy to scale by adding more replicas. - Adding more replicas was not beneficial for performance in a single computer environment. See [PERFORMANCE_TEST_RESULTS.md](PERFORMANCE_TEST_RESULTS.md)   
   - **Flyway** for Database Migrations (flyway)

### **Docker Containerization**
Each service is deployed as a Docker container. This simplifies deployment and ensures consistency across different environments.

## Possible Improvements to Improve Performance

### **Scaling**
Have some services run several replicas to allow for more users. This requires changes to the Docker Compose files. For global deployment, more study is needed to understand how to scale the backend services (Kubernetes, CDN, etc.)

### **Better Caching**
Better caching may be useful when the application is extended to handle more users.

### **Monitoring and Logging**
Logging and monitoring can help identify and resolve issues, and also help identify bottlenecks for performance improvements.
