import { User, UserStore } from '../user';
import Client from '../../database';
import { CodedError } from '../../utilities/common';
import dotenv from 'dotenv';

dotenv.config();

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

    describe('User Requirement 1', () => {
        it(`index method should return
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
    });

    describe('User Requirement 2', () => {
        it(`show method should return a User
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
    });

    describe('User Requirement 3', () => {
        const user: User = {
            firstname: 'Test_first',
            lastname: 'Test_last',
            username: 'test_user',
            password: 'password123',
        };

        beforeAll(async () => {
            await store.deleteHard(user.username as string);
        });

        afterAll(async () => {
            await store.deleteHard(user.username as string);
        });

        it(`create method should
            create a new user
            and return the user`, async () => {
            //create user
            const create_result = await store.create(user);

            expect((create_result as User).id).toBeDefined();

            //get user_id of created user
            const created_user_id: number = (create_result as User)
                .id as number;

            //check that user exists
            const show_result = await store.show(created_user_id);

            expect((show_result as User).id).toBe(created_user_id);
        });

        it(`create method should fail
            when username exists`, async () => {
            //create user twice
            await store.create(user);
            const result = await store.create(user);

            expect((result as User).id).toBeUndefined();
            expect((result as CodedError).code).toBe('EU301');
            expect((result as CodedError).error).toContain('duplicate key');
        });

        fit(`Authentication should work for created user`, async () => {
            const wrong_password: string = 'password456';

            try {
                // @ts-ignore
                const conn = await Client.connect();

                // run create in case not done
                await store.create(user);

                const pass_result = await store.authenticate(
                    user.username as string,
                    user.password as string
                );
                expect(typeof pass_result).toEqual('string');

                const fail_result = await store.authenticate(
                    user.username as string,
                    wrong_password
                );
                expect(typeof fail_result).not.toEqual('string');
                expect((fail_result as unknown as CodedError).code).toBe(
                    'EU501'
                );
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });
    });
});
