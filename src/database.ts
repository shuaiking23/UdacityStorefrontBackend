import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
    POSTGRES_HOST,
    POSTGRES_DB,
    POSTGRES_DB_TEST,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    ENV,
} = process.env;

let target_DB = POSTGRES_DB;

if (ENV == 'test') {
    target_DB = POSTGRES_DB_TEST;
}

const Client = new Pool({
    host: POSTGRES_HOST,
    database: target_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
});

export default Client;
