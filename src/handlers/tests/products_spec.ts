import supertest from 'supertest';
import { Product, ProductStore } from '../../models/product';
import route from '../products';
import { CodedError } from '../../utilities/common';

const request = supertest(route);

describe('Product Handler', () => {
    it('GET /products', async () => {
        try {
            const result = await request.get('/');
            console.log(result.statusCode);
            expect(result.statusCode).toEqual(200);
        } catch (err) {
            console.log(err);
            expect(err).toBe('');
        }
    });
    it('GET /products?category', async () => {
        try {
            const result = await request.get('?category=food');
            console.log(result.statusCode);
            expect(result.statusCode).toEqual(200);
        } catch (err) {
            console.log(err);
            expect(err).toBe('');
        }
    });
});