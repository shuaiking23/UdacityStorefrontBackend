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

## Current status
Not able to get handler tests to work but the endpoints seem to deliver when tested on postman.