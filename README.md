# Every Health - log monitor service

## Description

Every Health Log Monior is an internal tool to help monitor anonymized health logs and prepares us for future features like audit trails and role-based access.

1. Accepts uploaded logs (JSON format).
2. Stores them in memory or a local database (SQLite is fine).
3. Exposes an API to:
    - List logs
    - Filter by severity and timestamp
    - Return basic stats (e.g. counts per severity level)
4. Handles data validation and prevents exposure of sensitive fields like patient_id.


[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

Please create your own .env file based on the example.env file. You can use the `.env.sample` file as a template.

```bash
cp .env.sample .env
```


## Initialize the database

For now, the app is using SQLite as a database. To initialize the database, please run the following command:

```bash
npm run db:init
```

This will create a new local database file called `db-healthlog.sqlite` and seeds some dummy data into it.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Usage

The app is providing some API endpoints:

- POST /logs
- GET /logs
- GET /stats/[type]

where `type` can be either `severity` or `source`.

We can use any HTTP client to make HTTP requests to these endpoints (Postman, curl, etc.). Default port is 3000 that can be overridden via the `PORT` environment variable. All requests are protected by a simple api token. This is also has to be configured in the `.env` file.

On local machine, you can use curl commands to send requests to the server. For example, query all health logs:

```bash
curl 'http://localhost:3000/logs' --header 'Authorization: Bearer <YOUR_API_TOKEN>'
```

Getting a list of health logs filtered by `severity` and `after` date:

```ts
curl --header 'Authorization: Bearer xxx_servertoken' "http://localhost:3000/logs?severity=info&after=2025-05-02T18:12:00Z"
```

Or a small statistics about severities:

```ts
curl --header 'Authorization: Bearer <YOUR_API_TOKEN>' "http://localhost:3000/stats/severity"
```


## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Notes to Test Challenge

This implementation is a demonstration of a way how we might approach this problem using NestJS.

Design decisions are described in [DEV-GUIDE.md](./DEV-GUIDE.md).

Some comments:
- The tests are not complete, only the controller spec has been implemented, so no full coverage.
- Logging is only standard NestJS module. Usually we use different adapters for different deployments to be able to set up the necessary media for logging. Then the infrastructure will decide what to do with logging output (i.e. redirect to Splunk, Fluentd, database or files, etc).
- There is only the most basic, single api token authorization. RBAC needs further improvements on it (i.e. admin, auditor, viewer roles).
- Error handling is basic version and needs standardization. An ecosystem-wide error message and code structure should be defined in the proper documentations.
- We use SQLite as a database, which is suitable for this test challenge but is not scalable. (i.e. scaling the service horizontally). We can use other databases like MzSQL or PostgreSQL,. Sequelize ORM is used to interact with the database, no DB-specific code is used here, just the proper instantiation and migrations have to be implemented. (i.e. setting up the connection string in env vars, etc).
- Naming conventions follow usual TS and NestJS conventions. See Dev's guidebook for more infos.
- This is a base API implementation without protection mechanism. No rate-limiting or throttling mechanisms have been included. This can be implemented in the app as well (NestJS also has got some support) or in the infrastructure itself as well. Usually load balancers or the API gateways are offering it, so better to leave it to the infrastructure layer.
- No https is enabled. It also depends on the infrastructure how to manage it.

Further improvements can include:
- Implementing a proper logging system.
- Adding authentication and authorization mechanism - using user tokens (i.e.  JWT) or other service.
- Improving error handling and response messages (ecosystem wide error codes and standardized responses on API).
- Scaling the database if needed.
- Database migrations and version control.
- Extend coverage with unit testing and implement functional testing.
