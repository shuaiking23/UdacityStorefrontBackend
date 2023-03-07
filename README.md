"# UdacityStorefrontBackend" 

## Dependencies:
- Node version - v19.6.1
- NPM version - v9.4.0
- PostgreSQL version - v15.2

- Packages Used - Refer to [DEPENDENCIES.txt](./DEPENDENCIES.txt)

## Notes:

- API app root is set as `0.0.0.0:3000/api/v1`

- For more information, refer to [REQUIREMENTS.md](./REQUIREMENTS.md)

## ENV variables used
- POSTGRES_HOST=127.0.0.1
- POSTGRES_DB=shopping
- POSTGRES_DB_TEST=shopping_test
- POSTGRES_USER=shopping_user
- POSTGRES_PASSWORD=***
- ENV=dev
- BCRYPT_PASSWORD=***
- SALT_ROUNDS=10
- TOKEN_SECRET=***

## Database Setup

- PostgreSQL can be downloaded via the [official website](https://www.postgresql.org/download/)
- After Installing, it can be run via the `psql` command on the terminal.
- Postgres runs on port 5432 by default. This does not need to change.

The following commands can be used to set up the Database

1. psql -U postgres (enter password hen prompted)
2. CREATE USER shopping_user WITH ENCRYPTED PASSWORD '\*\*\*';
2. ALTER USER shopping_user WITH SUPERUSER;
3. CREATE DATABASE shopping;
4. CREATE DATABASE shopping_test;
5. \c shopping
6. GRANT ALL ON shopping TO shopping_user;
7. GRANT ALL ON shopping_test TO shopping_user;
8. GRANT ALL ON SCHEMA "public" TO shopping_user;

## Current status
Completed Project and added testing for handlers and models