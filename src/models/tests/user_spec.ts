import { User, UserStore } from '../user';
import Client from '../../database';
import { CodedError } from '../../utilities/common';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pepper: string = process.env.BCRYPT_PASSWORD as unknown as string;
const saltRounds: number = parseInt(
    process.env.SALT_ROUNDS as unknown as string
);

const store = new UserStore();

describe('User Model', () => {
    describe('Methods', () => {
        it('should have an index method', () => {
            expect(store.index).toBeDefined();
        });
        it('should have a show method', () => {
            expect(store.show).toBeDefined();
        });
        it('should have a create method', () => {
            expect(store.create).toBeDefined();
        });
        it('should have an authenticate method', () => {
            expect(store.authenticate).toBeDefined();
        });
    });

    describe('Requirements', () => {
        it(`RU1 index method should return
            a list of active users`, async () => {
            try {
                // @ts-ignore
                const conn = await Client.connect();

                const u_result = await conn.query(
                    `SELECT count(1) AS num FROM users WHERE NOT HISTORIC`
                );
                conn.release();

                const u_r_count: number = parseInt(u_result.rows[0].num);

                const result = await store.index();

                expect((result as User[]).length).toBe(u_r_count);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`RU2 show method should return a User
            based on user id provided`, async () => {
            const user_id = 1;

            const sql = `SELECT id
                FROM users
                WHERE NOT HISTORIC
                    AND id = ($1)`;
            try {
                // @ts-ignore
                const conn = await Client.connect();

                const u_result = await conn.query(sql, [user_id]);
                conn.release();

                const uid: number = parseInt(u_result.rows[0].id);

                expect(u_result.rows[0].id).toBe(user_id);

                const result = await store.show(uid);

                expect((result as User).id).toBe(uid);
                expect((result as User).password).toBeUndefined();
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`RU3 create method should
            create a new user
            and return the user`, async () => {
            const u_username = 'test_username';
            const u_password = 'password123';
            const hash: string = bcrypt.hashSync(
                u_password + pepper,
                saltRounds
            );

            const user: User = {
                firstname: 'Test_first',
                lastname: 'Test_last',
                username: u_username,
                password: hash,
            };

            const sql = `SELECT id
                FROM users
                WHERE NOT HISTORIC
                    AND username = ($1)
                LIMIT 1`;

            const delete_sql = `DELETE
                FROM users
                WHERE username = ($1)`;

            try {
                // @ts-ignore
                const conn = await Client.connect();

                await conn.query(delete_sql, [u_username]);
                const pre_result = await conn.query(sql, [u_username]);

                expect(pre_result.rows.length).toBe(0);

                const result = await store.create(user);
                console.log(result);
                const post_result = await conn.query(sql, [u_username]);

                const u = post_result.rows[0];

                await conn.query(delete_sql, [u_username]);

                conn.release();

                expect(post_result.rows.length).toBe(1);
                expect((result as User).id).toBe(parseInt(u.id));
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });
    });
});
