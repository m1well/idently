### build stage
FROM denoland/deno:alpine-2.3.1 AS builder

WORKDIR /app

COPY deno.json ./
COPY . .
COPY .env.cloud .env
# i use a separate .env.cloud here for other values

RUN deno cache --reload server.ts

### run stage
FROM denoland/deno:alpine-2.3.1

ENV TZ=Europe/Amsterdam

WORKDIR /app

USER deno

COPY --from=builder /app .

CMD ["deno", "task", "start"]
