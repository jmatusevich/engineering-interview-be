# Instructions

## Summary

This project was created using `Typescript`, `Node` and `Apollo Server`.
`Eslint` was used for linting.
`Postgres` is the chosen database.
There's a `docker-compose` that sets up a running version of the app with `Postgres`.
It's also compatible with running it from the source directly, provided a `Postgres` server is set up.
For this a `.env` file needs to be configured in the root of the directory.
An example `.env.example` file is provided, which can be copied as `.env` and configured with the `Postgres` credentials.
Log files are created and rotated using `Winston`.
Tests are written for `jest` in `*.spec.ts` files next to the file tested.

## Next Steps

This is a non-exhaustive list of some things that could be improved:

- Resolvers that take a sort criteria don't allow you to reverse the order (ascendent vs descendent)
- A transpilation step to javascript could be added for the built docker image to shorten start times
- Database access is not tested, but end to end tests could be added to the project
- Hardening of express, cors headers et. al. could be done
- There's no meaningful difference between the dev and prod environments
  - requiring https in prod, for example, is something that could be added
- required email with validation and some other limits to user account creation are not implemented

## Setup

1. Set up a Postgres database. Postgres `v15` was chosen (unless you are running from docker).
2. Duplicate the `.env.example` into a `.env` file.
3. Configure the `.env` file with the Postgres credentials and database. (overwritten by the `docker-compose` when running for docker)
4. Run `npm install`
5. Use `npm run dev` for rerunning during file changes or `npm start` to run it as is.
6. Go to `http://localhost:3000/graphql` (the port can be changed in the `.env` file)

For anything production, you would be expected to change the secret being passed for JWT generation, which is defined on the .env file but could also be overriden from the `docker-compose` file by passing environment variables.

### Linting

1. You can test the linting running `npm run lint`

### Testing

1. You can run the unit tests with `npm run test`
   Test files named the same as the file being tested but with the extension `.spec.ts` will be run.

### Potential issues

The package `basetag` is being used to have paths using `$` represeting the root of the directory.
This way, imports that would normally look like `../../../../thingImported` now look like `$/src/thingImported`.
The package `basetag` works by generating a symlink to the root directory of the project aliased to `$`.
However, `npm` will mess with this during installs. This is why the `postinstall` script runs bsetag to reconfigure the alias. However, if you find an issue related to this alias not being existent, you can always re run manually `npm run postinstall` to trigger a reconfiguration of the alias.

## Code Generation

The GraphQL schema has types created automatically by doing introspection into the running API. If you change
the `schema.graphql` file, you will need to run the server (e.g. `npm run start`) and on a separate terminal, run `npm run codegen`. This will refresh and update the Typescript types being used to represent the graphQL API throughout the app and imported from `./src/generated/graphql.ts`.

### Steps

1. Edit `schema.graphql`
2. Run the server `npm run start` from scratch
3. While the server is running, run the codegeneration with `npm run codegen`

## Docker

1. Make sure you have the docker daemon running.
2. Run `npm run docker`

This will initialize and build a docker image and set-up that includes a Postgres image based on the `docker-compose` file. The port `35432` is chosen to expose the postgres server to the client machine to avoid collisions with Postgres installed to the system and running on the default `5432`.
The GraphQL server will be exposed on the port `3000`.

## API

### Authentication and Authorization

1. Use the `getJWT` query with `username` and `password`
2. You will receive a `JWT` token to authenticate yourself
3. Set the `Authorization` header to `Bearer <JWT_TOKEN_RECEIVED>` for authenticated queries and mutations.

### Users

#### General Details

Users have the following fields:

- `username` (required)
- `password` (not exposed to API on return types) (required)
- `createdAt` (automatically set)
- `updatedAt` (automatically set)

#### Mutations

##### `createUser`

- Receives `username`, `password` and `passwordRepeated`.
- Returns the created `User`, with the `password` field removed.
- Can throw an error if the `username` already exists or some of the fields passed are missing or too short or the `password` and `passwordRepeated` fields do not match.

This is the only resolver that can be called without authentication.

##### `deleteUser` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Deletes the current active user
- Returns `true` if the user was deleted and `false` if this was not possible

##### `updateUser` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Receives `username` (optional), `passwordDetails` (optional)
  If `passwordDetails` is provided, it must contain the following fields:
- `password` (the new password)
- `passwordRepeated` (the new password, again)
- `oldPassword` (the password that is being changed)

It can throw an error if the username already exists, if the `oldPassword` field is incorrect, if the new password fields are missing or not matching.

It returns the updated user entity, with the `password` field removed.

#### Queries

##### `getCurrentUser` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Returns the current authenticated user entity, with the `password` field removed.

##### `getJWT`

- Receives `username` and `password`
- It can return `null` if one of the fields is missing or the user could not be authenticated
- Returns a `JWT` token to use for authentication as defined in _Authentication and Authorization_

### Tasks

#### General Details

Tasks have the following fields:

- `title`
- `description` (optional)
- `status` (optional) (defaults to `TO_DO`)
- `order`
- `createdAt` (automatically set)
- `updatedAt` (automatically set)

The `order` property represents the position in the list when looking at it sorted by `order` that is set to the next valid `order` value for a given user. The benefit is users can reorder tasks when viewing them sorted by `order` as they please. The database will transform the `order` values during reordering as required to guarantee uniqueness of `order` for a given user.

#### Mutations

##### `batchUpdateTasksStatuses` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Receives `taskIds` (array of ids of tasks) and `status` (the new status to update them to)
- It can throw an error if some of the tasks don't belong to the user or don't exist
- It returns `null` if the user is not authenticated.
- It returns the changed tasks in an array after the update.

##### `createTask` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Receives a field named `input` that contains:
  - `title` (required)
  - `description` (optional)
  - `status` (optional) (defaults to `TO_DO`)
- It returns `null` if the user is not authenticated
- It returns `null` if the input is not provided
- It can throw if the `title` is empty or the `status` is invalid
- It returns the created task

##### `deleteTask` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Receives `taskId` (required)
- Returns `true` if the task was deleted and `false` if this was not possible (e.g. the task does not exist or does not belong to the user)

##### `moveTaskToPosition` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Receives `taskId` and the `position` where the task should go
- It can return `null` for unauthenticated or unauthorized operations, as well as if the id or position are missing, or if the user is moving the task to the same position it holds
- It returns an array of the tasks that had their order change as a result of the move

##### `swapTasks` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Receives the `aTaskId` and `bTaskId` corresponding to the tasks being swapped
- It can return `null` if the user is unauthenticated or unauthorized for the operation, as well as if one of the tasks doesn't exist or the user is swapping the task with itself.
- It returns the tasks that changed in an array

##### `updateTask` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Receives `taskId` of the task being changed
- Receives a field named `input` that contains:
  - `title` (optional)
  - `description` (optional)
  - `status` (optional)
- It returns `null` if the user is not authenticated
- It returns `null` if the input is not provided
- It returns the updated task, changing only the fields that had a provided value

#### Queries

##### `getStatusGroupedTasks` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- It can optionally receive:
  - `sortedBy`: an array of Task's field names to sort by
  - `withStatuses`: an array of possible Task statuses to filter by
- It returns null if the user is not authenticated
- It returns an object like this:

```json
{
  "TO_DO": [],
  "IN_PROGRESS": [],
  "DONE": [],
  "ARCHIVED": []
}
```

with the tasks (optionally filtered and sorted) grouped depending on their current status.

##### `getTask` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- Receives `taskId` of the task being queried
- It returns `null` if the user is not authenticated or authorized for the given task
- It returns `null` if the task doesn't exist
- It returns `null` if the `taskId` is not provided
- It returns the task required

##### `getTasks` (authenticated)

- Receives the `Authorization` header set as defined in _Authentication and Authorization_
- It can optionally receive:
  - `sortedBy`: an array of Task's field names to sort by
  - `withStatuses`: an array of possible Task statuses to filter by
- It returns null if the user is not authenticated
- It returns an array of the tasks (optionally filtered and sorted)

# Getting Started with the Every.io engineering challenge.

Thanks for taking the time to complete the Every.io code challenge. Don't worry, it's not too hard, and please do not spend more than an hour or two. We know you have lots of these to do, and it can be very time consuming.

## The biggest factor will be your code:

1. How readable, is your code.
2. Scalability.
3. Are there any bugs.

## Requirements

You will be creating an API for a task application.

1. This application will have tasks with four different states:
   - To do
   - In Progress
   - Done
   - Archived
2. Each task should contain: Title, Description, and what the current status is.
3. A task can be archived and moved between columns, or statuses.
4. The endpoint for tasks should only display tasks for those users who have authenticated and are authorized to view their tasks.

## Ideal

- Typescript
- Tests
- Dockerized Application

## Extra credit

- Apollo Server GraphQL
- Logging
