# idently

A tiny, stateless, code-based Deno identity server with code login and a JSON
user store.

**idently** provides a dead-simple authentication layer for internal tools,
admin panels, or APIs:

- login via secret code (no email, no passwords)
- flat file `store/users.json` user store
- generates short and long valid JWTs and verifies them
- additional endpoint to get all users as an admin

## why?

Sometimes you don't need OAuth, Firebase, or Keycloak. You just want a damn code
and a JWT.

**idently**: _simple identity, stateless, stylish._

## current features

- `GET /token/short` – login with code & source in header, get a short valid JWT
- `GET /token/long` – login with code & source in header, get a long valid JWT
- `GET /token/verify` – verify JWT (with source header!) & return claims
- `GET /users` – return user data if you have an admin JWT
- configurable `JWT_SECRET`
- configurable additional header `REQUIRED_HEADER`
- configurable value for additional header `EXPECTED_HEADER_VALUE`
- configurable seconds for short valid token `TOKEN_SHORT_EXPIRES_IN_S` (3
  minutes in example config)
- configurable seconds for long valid token `TOKEN_LONG_EXPIRES_IN_S` (5 hours
  in example config)
- JSON-based user store
- minimal Docker image (~50 MB)
- built on **Deno** – no npm, no install

## local dev mode

```bash
git clone https://github.com/m1well/idently.git
cd idently
cp .env.example .env
```

change env vars the way you want them

### quickstart

```bash
deno task start
```

### test endpoints

just use the [requests.http](requests.http) to test the current endpoints

### unit tests

```bash
deno task tests
```

### format & lint code

```bash
deno task format
```

## customization

### own user properties

- just add more optional properties to the user type

### additional claims

- add the mapping to the claims (only propertys you need in the jwt claim!)

## Docker

### build & run

add additional `.env.cloud` file to have separate env values for Docker

```bash
docker build -t idently .
docker run -p 8000:8000 idently
```

## Kubernetes

you can find an example deployment file here
[k8s/deployment.example.yml](k8s/deployment.example.yml)

## Contribution

just go for it :)\
clean code is a prerequisite - then simply create a pull request!

### commit messages

it would be cool if we could keep conventional commits\
(fix:... / feat:... / chore:... / docs:... / refactor:... / test:...)

## License

This project is licensed under the [MIT License](LICENSE)

## Author

Created by [m1well](https://m1well.com)
