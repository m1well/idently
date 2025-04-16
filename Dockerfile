## stage 1
FROM denoland/deno:alpine-2.2.9 AS builder

WORKDIR /app

COPY deno.json ./
COPY import_map.json ./
COPY . .
COPY .env.cloud .env
## i use a separate .env.cloud here for other values

RUN deno cache --reload server.ts

RUN deno compile --allow-net --allow-read --allow-env --env-file --target x86_64-unknown-linux-gnu --output server server.ts


## stage 2
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/server /app/server

CMD ["/app/server"]
