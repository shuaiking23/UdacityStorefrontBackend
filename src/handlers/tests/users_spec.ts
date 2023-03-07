import supertest from 'supertest';

import { User, UserStore } from '../../models/user';
import { Product, ProductStore } from '../../models/product';
import { Order, OrderStore, order_status } from '../../models/order';

import app from '../../server';
import { CodedError } from '../../utilities/common';

const request = supertest(app);

const uStore = new UserStore();

describe('User Handler', () => {
    let token: string, user_id: string;
    const new_username = 'otestuser2';
    const user: User = {
        firstname: 'Order',
        lastname: 'Tester',
        username: 'otestuser',
        password: 'password123',
    };
    beforeAll(async () => {
        await uStore.deleteHard(user.username as string);
        await uStore.deleteHard(new_username as string);

        const create_result = await uStore.create(user);

        user_id = (create_result as User).id as unknown as string;

        const result = await request
            .post('/api/v1/users/authenticate')
            .send(user);

        token = result.body.token;
    });
    afterAll(async () => {
        await uStore.deleteHard(user.username as string);
        await uStore.deleteHard(new_username as string);
    });

    it(`User Requirement 1 GET /users
        should return a list of users if authorised`, async () => {
        // no token
        const result_no_token = await request.get('/api/v1/users');
        expect(result_no_token.statusCode).toEqual(401);
        expect(result_no_token.body.code).toEqual('EC102');

        // with token
        const result = await request
            .get('/api/v1/users')
            .set('Authorization', 'bearer ' + token);
        expect(result.statusCode).toEqual(200);
        expect(result.body.code).toBeUndefined();
    });

    it(`User Requirement 2 GET /users/:id
        Should Allow retrieving user information 
        if authorised and user matches`, async () => {
        // no token
        const result_no_token = await request.get(`/api/v1/users/${user_id}`);
        expect(result_no_token.statusCode).toEqual(401);
        expect(result_no_token.body.code).toEqual('EC102');

        // with token user mismatch
        const result_mismatch = await request
            .get(`/api/v1/users/0`)
            .set('Authorization', 'bearer ' + token);
        expect(result_mismatch.statusCode).toEqual(401);
        expect(result_mismatch.body.code).toEqual('EC101');

        // with token user match
        const result = await request
            .get(`/api/v1/users/${user_id}`)
            .set('Authorization', 'bearer ' + token);
        expect(result.statusCode).toEqual(200);
        expect(result.body.code).toBeUndefined();
    });

    it(`User Requirement 3 POST /users
        should allow creating a new user if authorised`, async () => {
        // no token
        const result_no_token = await request.post('/api/v1/users');
        expect(result_no_token.statusCode).toEqual(401);
        expect(result_no_token.body.code).toEqual('EC102');

        // with token existing user
        const result_existing = await request
            .post('/api/v1/users')
            .send(user)
            .set('Authorization', 'bearer ' + token);
        expect(result_existing.statusCode).toEqual(400);
        expect(result_existing.body.code).toEqual('EU301');
        expect(result_existing.body.error).toContain('duplicate key');

        // with token distinct user
        const user2: User = {
            firstname: 'Order2',
            lastname: 'Tester',
            username: new_username,
            password: 'password123',
        };
        const result = await request
            .post('/api/v1/users')
            .send(user2)
            .set('Authorization', 'bearer ' + token);
        expect(result.statusCode).toEqual(200);
        expect(result.body.code).toBeUndefined();
        console.log(result.body);
    });
});
