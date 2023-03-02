// @ts-ignore
import Client from '../database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

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
    async index(): Promise<User[]> {
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
            throw new Error(`Could not get users. Error: ${err}`);
        }
    }

    async show(id: string): Promise<User> {
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
            throw new Error(`Could not find user ${id}. Error: ${err}`);
        }
    }

    async create(u: User): Promise<User> {
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
            throw new Error(`Could not add new user ${name}. Error: ${err}`);
        }
    }

    async delete(id: string): Promise<User> {
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
            throw new Error(`Could not delete user ${id}. Error: ${err}`);
        }
    }

    async authenticate(
        username: string,
        password: string
    ): Promise<User | null> {
        try {
            const sql = `SELECT password
                FROM users
                WHERE username = ($1) AND NOT historic`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [username]);

            conn.release();

            if (result.rows.length) {
                const user = result.rows[0];

                if ((bcrypt.compareSync(password + pepper), user.password)) {
                    return user;
                }
            }
        } catch (err) {
            throw new Error(
                `Unable to authenticate user ${username}. Error: ${err}`
            );
        }
        return null;
    }
}
