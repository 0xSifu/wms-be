## Description

[Nest](https://github.com/nestjs/nest) Microservice framework auth service TypeScript repository.

## Prerequisite

- NodeJS LTS
- Yarn
- Docker

## Docker Compose

```bash
$ docker compose -f docker-compose.yml up -d
```

## Installation

```bash
$ yarn
```

## Env

```bash
$ cp .env.local .env
```

## Database

```bash
# create migration
$ npx prisma migrate dev --name initialization

# check migration status
$ npx prisma migrate status

# apply pending migrations
$ npx prisma migrate deploy

# generate prisma client
$ npx prisma generate

## IN CASE OF ERROR

```bash
$ npx prisma migrate reset
```

## Running the app

```bash
# development watch mode
$ yarn run start

# production mode
$ yarn start
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## License

Nest is [MIT licensed](LICENSE).
