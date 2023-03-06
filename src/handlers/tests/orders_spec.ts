import supertest from 'supertest';
import { Order, OrderStore, order_status } from '../../models/order';
import route from '../orders';
import { CodedError } from '../../utilities/common';

const request = supertest(route);

describe('Order Handler', () => {
    it('GET /orders Invalid test', async () => {
        try {
            const result = await request.get('/');
            console.log(result);
            expect(result.statusCode).toEqual(404);
        } catch (err) {
            console.log(err);
            expect(err).toBe('');
        }
    });
    it('GET /orders/current test - No Token', async () => {
        try {
            const result = await request.get('/current');
            console.log(result);
            expect(result.statusCode).toEqual(403);
        } catch (err) {
            console.log(err);
            expect(err).toBe('');
        }
    });
});
