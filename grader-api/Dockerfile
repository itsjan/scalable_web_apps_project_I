FROM denoland/deno:alpine-1.42.2

EXPOSE 7000

WORKDIR /app

# RUN apk add --update docker openrc
# RUN rc-update add docker boot

RUN addgroup deno docker

COPY deps.js .

RUN deno cache deps.js

COPY . .

CMD [ "run", "--unstable", "--watch", "--allow-all", "allow-net", "grader-job.js" ]
