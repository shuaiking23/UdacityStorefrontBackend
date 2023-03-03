// @ts-ignore
import Client from '../database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { CodedError } from '../utilities/common';

dotenv.config();

const pepper: string = process.env.BCRYPT_PASSWORD;
const saltRounds: number = parseInt(process.env.SALT_ROUNDS);

export type User = {
    id?: number;
    firstname: string;
    lastname: string;
    username?: string;
    password?: string;
};

export class UserStore {
    async index(): Promise<User[] | CodedError> {
        try {
            // @ts-ignore
            const conn = await Client.connect();
            const sql = `SELECT id, firstname, lastname, username
                FROM users
                WHERE NOT historic
                ORDER BY firstname`;

            const result = await conn.query(sql);
            conn.release();

            return result.rows;
        } catch (err) {
            return ({
                code: 'EU101',
                error: `Could not get users. Error: ${err}`
            }) as CodedError;
        }
    }

    async show(id: number): Promise<User | CodedError> {
        try {
            const sql = `SELECT * 
                FROM users
                WHERE id=($1) AND NOT historic`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            conn.release();

            return result.rows[0];
        } catch (err) {
            return ({
                code: 'EU201',
                error: `Could not find user ${id}. Error: ${err}`
            }) as CodedError;
        }
    }

    async create(u: User): Promise<User | object> {
        try {
            const sql = `INSERT INTO users (
                    firstname, lastname, username, password)
                VALUES($1, $2, $3) RETURNING *`;
            const hash: string = bcrypt.hashSync(
                u.password + pepper,
                saltRounds
            );

            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [
                u.firstname,
                u.lastname,
                hash,
            ]);

            const user = result.rows[0];

            conn.release();

            return user;
        } catch (err) {
            return ({
                code: 'EU301',
                error: `Could not add new user ${name}. Error: ${err}`
            }) as CodedError;
        }
    }

    async delete(id: number): Promise<User | CodedError> {
        try {
            const sql = `UPDATE users
                SET firstname = 'd_' || name, historic = true
                WHERE id=($1)`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            const user = result.rows[0];

            conn.release();

            return user;
        } catch (err) {
            return ({
                code: 'EU401',
                error: `Could not delete user ${id}. Error: ${err}`
            }) as CodedError;
        }
    }

    async authenticate(
        username: string,
        password: string
    ): Promise<User | CodedError> {
        try {
            const sql = `SELECT username, password
                FROM users
                WHERE username = ($1) AND NOT historic`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [username]);

            conn.release();

            if (result.rows.length) {
                const user = result.rows[0];

                if (bcrypt.compareSync(password + pepper, user.password)) {
                    return user;
                } else {
                    return ({
                        code: 'EU501',
                        error: 'Incorrect username/password.'
                    }) as CodedError;
                }
            } else {
                return ({
                    code: 'EU502',
                    error: 'Incorrect username/password.'
                }) as CodedError;
            }
        } catch (err) {
            console.log(err);
            return ({
                code: 'EU503',
                error: `Unable to authenticate user ${username}. Error: ${err}`
            }) as CodedError;
        }
    }
}
