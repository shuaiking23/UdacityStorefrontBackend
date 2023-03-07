import supertest from 'supertest';

import { User, UserStore } from '../../models/user';
import { Product, ProductStore } from '../../models/product';
import { Order, OrderStore, order_status } from '../../models/order';

import app from '../../server';
import { CodedError } from '../../utilities/common';

const request = supertest(app);

const uStore = new UserStore();
const oStore = new OrderStore();

describe('Order Handler', () => {
    let token: string, user_id: string;
    const user: User = {
        firstname: 'Order',
        lastname: 'Tester',
        username: 'otestuser',
        password: 'password123'
    };
    beforeAll(async () => {
        await uStore.deleteHard(user.username as string);
        const create_result = await uStore.create(user);

        user_id = (create_result as User).id as unknown as string;

        const result = await request.post('/api/v1/users/authenticate').send(user);
        
        token = result.body.token;

    })
    afterAll(async () => {
        await uStore.deleteHard(user.username as string);
    })

    it('GET /orders Invalid test', async () => {
        try {
            const result = await request.get('/api/v1/orders');
            expect(result.statusCode).toEqual(404);
        } catch (err) {
            console.log(err);
            expect(err).toBe('');
        }
    });

    describe('No orders', () => {
        it(`R1 GET /orders/current test - No Token
            should return 401`, async () => {
            try {
                const result = await request.get('/api/v1/orders/current');
                    expect(result.statusCode).toEqual(401);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });
        it(`R1 GET /orders/current test - with Token
            No active Order should return 400`, async () => {
            try {
                const result = await request
                    .get('/api/v1/orders/current')
                    .set("Authorization", "bearer " + token);
                expect(result.statusCode).toEqual(400);
                expect(result.body.code).toEqual('EOP101');
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });
    });

    describe('Has orders', () => {
        let active_order_id: string, completed_order_id: string;
        beforeAll(async () => {
            // Create 3 orders and complete 1
            await request
                .post('/api/v1/orders')
                .set("Authorization", "bearer " + token);
            const order_result1 = await request
                .post('/api/v1/orders')
                .set("Authorization", "bearer " + token);
            active_order_id = order_result1.body.id;
            const order_result2 = await request
                .post('/api/v1/orders')
                .set("Authorization", "bearer " + token);
            completed_order_id = order_result2.body.id;
            await oStore.complete(completed_order_id);
            console.log(`active ${active_order_id}`);
            console.log(`completed ${completed_order_id}`);
        }) 
        it(`R1 GET /orders/current test - with Token
            Active Order should return 200
            AND latest active order for user`, async () => {
            try {
                const result = await request
                    .get('/api/v1/orders/current')
                    .set("Authorization", "bearer " + token);
                expect(result.statusCode).toEqual(200);
                expect(parseInt(result.body.id)).toEqual(parseInt(active_order_id));
                expect(parseInt(result.body.user_id)).toEqual(parseInt(user_id));
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`R2 GET /orders/complete test - no Token
            should return 401`, async () => {
            try {
                const result = await request
                    .get('/api/v1/orders/completed');
                expect(result.statusCode).toEqual(401);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });
        it(`R2 GET /orders/complete test - with Token
            should 1 completed order`, async () => {
            try {
                const result = await request
                    .get('/api/v1/orders/completed')
                    .set("Authorization", "bearer " + token);
                expect(result.statusCode).toEqual(200);
                console.log(result.body);
                expect(result.body.record_count).toEqual(1);
                expect(result.body.order[0].id).toEqual(parseInt(completed_order_id));
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });
    });
});
