# Performance test results

## Server
HTTP/1.1

## Computer
Apple M1 MacBook Pro 32GB Memory

## Database
postgres:14.1


### Retrieving Assignments

http_reqs: 
http_req_duration - median: 
http_req_duration - 99th percentile: 


### Posting Submissions (2 Grader-API replicas)
Posting unique solutions, therefore no database caching can be used for already graded solutions.

|                                     | no replicas DEV | 2 replicas PROD | 4 replicas PROD |
|-------------------------------------|-----------------|-----------------|-----------------|
| http_reqs:                          | 11155           | 7093            | 2851            |
| http_req_duration - median:         | 7.06ms          | 10.37ms         | 21.67ms         |  
| http_req_duration - 99th percentile:| 39.37ms         | 61.32ms         | 176.79ms        |


## Reflection

Adding additional replicas to the Grader API was detrimental to the performance in a single machine docker environment.

