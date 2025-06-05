# Every Health - Log Monitor Service Developers Guide

## Description

This repository contains the codebase for the Every Health Log Monitor Service (Test Challenge Task), which is responsible for monitoring and logging various health-related information from different sources. The service uses NestJS to provide and maintain API.

Please note that this [README.md](./README.md) README file provides guidance for installation and usage.

## Project Terms

- **Logging**: Recording technical (server) events or activities for future reference and analysis.
- **HealthLog**: One record of events or activities for future reference and analysis.
- **Healthlog Sources**: Different places where health data points originate, such as medical devices, wearables, or other systems.
- **Healthlog Severity**: The level of importance or urgency associated with a particular event or activity.
- **Healthlog Patient**: The individual whose health data is being monitored.

### GDPR considerations

Europe has set up a very strict privacy law called General Data Protection Regulation (GDPR). It requires organizations to protect personal data and ensure transparency regarding its collection, processing, and sharing.

In this project, we use
- personal data and
- qualified sensitive personal data.

Any identification of the person and the person's qualified sensitive personal data must be protected.

The business project itself is related to a group of patients where the existence of the patient personal data itself is also considered as _qualified sensitive personal data_.

This service is getting _qualified sensitive personal data_ as an event (health log) where the patient_id is already identifies the patient (there is an other database in another service where we can get the personal data via this patient id). So we must anonymize the patient id immediately without storing it.

Anonymization:
- We should not store the patient id except temporarily in the request body (only under processing).
- We should generate a obfuscated or randomized patient id for each incoming request.
- We should remove the patient id from the response body if it exists there even if it is anonymized.

Considerations in the Statistics:
- Random UUID is fully GDPR-compliant because it does not contain any identifiable information - however the statistics cannot aggregate per user basis anymore.
- If we create the same anonymized UUID for a patient over every requests, then the statistics can already aggregate per user basis but the possibility of tracking back the patient is higher than before. (It is possible to find out the original patient id if we have enough data)

## Domain Entities

### HealthLog

Represents a single health log entry in the Log Monitor service. It includes fields like `id`, `source`, `severity`, `patientId`, `message`, `timestamp`. This is a base domain entity used by the HealthLog Module in the service.

## Layers

### Presentation Layer

Handles HTTP requests and responses using controllers and DTOs. Provides endpoints for batch uploadiong and retrieving health logs and connected stats.

### Application Layer

Contains use cases and services that handle business logic. Includes operations like upload of the healthlog entries, retrieving is with optional filtering and/or paginations, and getting some basic statistics about health logs.

### Repository Layer

Provides infrastructure components like database connections, repositories required and used by the application layer. This encapsulates the ORM (Sequelize in this project that is an efficient ORM in larger scaled projects too). This layer also handles any necessary database interactions and queries, converting between domain models and database representations.

## Deployment

### local deployment

To run the project locally you need to follow the [README.md](./README.md) instructions. 

### Docker deployment

Dockerfile is prepared and it can be used to build and deploy the image in the standard way (docker build or docker compose). Environment variables are passed by the docker environment.

### Cloud deployment

NestJS has got a simplified way to deploy the app on cloud platforms like AWS GCP etc. [Mau](https://mau.nestjs.com), this is the official NestJS applications on AWS. Mau makes deployment simple however it is not suitable for large scale enterprise projects. The required deployment strategy can differ in the whole business ecosystem. It is usually recommended to standarize the deployment and automation processes across all environments and all apps (like frontends or other non-NestJS services or the staging and production environments).

#### GitHub Actions Workflow Example

The GitHub Actions workflow can be used to automate the deployment processes from GitHub. When changes are pushed to i.e. the main branch, the GitHub Action will automatically trigger and perform the necessary tasks (checkout the code, build the image and using github secrets to push the image to the registry, to cloud provider, onpremise servers, etc.

There are AWS, GCP, etc deployment strategies and deployment images available too.

#### GitLab CI/CD Example

GitLab CI pipelines can be configured similarly in the `.gitlab-ci.yml` file. They offer similar features to achieve automated deployments.

## Testing

Unit tests are written using Jest testing framework. One example unit test is included now in the repository for the controller class.

Integration tests are written using Supertest library. This is not implemented yet, just a small example shows how to do it.

## Documentations

There are some necessary documentations. I.e. Code of Conduct,API documentation, architecture diagrams, design documents, etc. (TODO in the real project)

### Conventions

ESLint for linting and Prettier for code auto formatting. The following conventions are applied:

### Naming conventions

#### Generic conventions

Typical TypeScript conventions are applicable here.
Examples:

- **PascalCase** for:
  - Class names: `HealthLogService`, `HealthLogController`
  - Interface names: `HealthLog`, `HealthLogFilters`, `IHealthLogRepository`
  - Type names: `HealthLogStatisticsResult`
  - Enum names with prefixing: `EHealthLogSeverities`, `EStatisticTypes`, `ENodeEnvironments`, `ELogLevels`

- **camelCase** for:
  - Variables: `healthLogs`, `queryParams`, `logMessage`
  - Function names: `save()`, `getLogs()`, `getStatsByType()`
  - Method names: `findAndCountAll()`, `upload()`
  - Properties: `timestamp`, `severity`, `source`, `message`, `patientId`
  - Parameters: `filters`, `pagination`, `type`

- **UPPER_SNAKE_CASE** for:
  - Global accessable constants: `DEFAULT_DB_PAGINATION_LIMIT`, `DEFAULT_ENVIRONMENT`, `DEFAULT_HTTP_PORT`

- **Suffixes**:
  - DTOs: `Dto` suffix (e.g., `CreateLogDto`, `QueryLogsDto`)
  - Services: `Service` suffix (e.g., `HealthLogService`)
  - Controllers: `Controller` suffix (e.g., `HealthLogController`)
  - Repositories: `Repository` suffix (e.g., `HealthLogRepository`)
  - Guards: `Guard` suffix (e.g., `ApiTokenGuard`)

#### NestJS conventions

- **File names** should be descriptive of the content and use kebab-case (lowercase with hyphens) in the NestJS application:
  - Module files: `healthlog.module.ts`
  - Service files: `healthlog.service.ts`
  - Controller files: `healthlog.controller.ts`
  - Repository files: `healthlog.repo.ts`
  - Interface files: `healthlog.repo.interface.ts`
  - DTO files: `healthlog.create.dto.ts`, `healthlog.query.dto.ts`
  - Entity files: `HealthLog.ts` (note: entity files use PascalCase because this should be moved into a package)
  - Middleware files: `http.logger.middleware.ts`
  - Guard files: `apitoken.guard.ts`
  - Utility files: `enum.util.ts`

- **Directory structure** follows NestJS conventions:
  - Feature modules in their own directories (e.g., `src/healthlog/`)
  - API controllers in an `api` subdirectory (e.g., `src/healthlog/api/`)
  - DTOs in a `dto` subdirectory (e.g., `src/healthlog/api/dto/`)
  - Repositories in a `repositories` subdirectory (e.g., `src/healthlog/repositories/`)
  - Shared entities in an `entities` directory (e.g., `src/entities/`)
  - Configuration in a `config` directory (e.g., `src/config/`)
  - Guards in a `guards` directory (e.g., `src/guards/`)
  - Utilities in a `utils` directory (e.g., `src/utils/`)

*Prefixes*

I have used the "E" prefix for enum types to indicate they represent enumerated values. This helps differentiate them from regular classes, types or objects.

In some projects I am also using the "I" prefix for interfaces. For example: `interface IHealthLog { ... }` can be used as a type alias like this: `const healthLog: IHealthLog = {...}` This is useful in NestJS as classes have sometimes the same name as interfaces. 

Both approaches are valid and widely used in the community. The choice depends on team preferences and existing conventions within the project.
