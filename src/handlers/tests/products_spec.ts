import supertest from 'supertest';

import { User, UserStore } from '../../models/user';
import { Product, ProductStore } from '../../models/product';
import { Order, OrderStore, order_status } from '../../models/order';

import Client from '../../database';
import app from '../../server';
import { CodedError } from '../../utilities/common';

const request = supertest(app);

const uStore = new UserStore();
const pStore = new ProductStore();

describe('Product Handler', () => {
    let token: string, user_id: string, product_id: string, food_count: number;
    const user: User = {
        firstname: 'Product',
        lastname: 'Tester',
        username: 'ptestuser',
        password: 'password123',
    };
    const product: Product = {
        name: 'Sample_Product_Merch',
        price: 34.5,
        category: 'Merch',
    };

    beforeAll(async () => {
        await uStore.deleteHard(user.username as string);
        const create_result = await uStore.create(user);

        user_id = (create_result as User).id as unknown as string;

        const u_result = await request
            .post('/api/v1/users/authenticate')
            .send(user);

        token = u_result.body.token;
        try {
            // @ts-ignore
            const conn = await Client.connect();
            await conn.query(`SELECT create_sample_products(100)`);
            await conn.query(`SELECT create_sample_orders(${user_id},10,10)`);
            conn.release();
        } catch (err) {
            console.log(err);
        }

        const p_result = await pStore.index('Food');
        product_id = (p_result as Product[])[0].id as unknown as string;
        food_count = (p_result as Product[]).length as unknown as number;
    });
    afterAll(async () => {
        try {
            // @ts-ignore
            const conn = await Client.connect();
            await conn.query(`SELECT clear_sample_orders()`);
            await conn.query(`SELECT clear_sample_products()`);
            conn.release();
        } catch (err) {
            console.log(err);
        }

        await uStore.deleteHard(user.username as string);
    });

    it(`Product Requirement 1 GET /products
        should return status 200 and a list of products`, async () => {
        const result = await request.get('/api/v1/products');

        expect(result.statusCode).toEqual(200);
        expect(result.body.record_count).toEqual(100);
    });

    it(`Product Requirement 2 GET /products/:id
        should return status 200 and details of product id provided
        or 400 if not found`, async () => {
        // product not found
        const result_not_found = await request.get(`/api/v1/products/0`);
        expect(result_not_found.statusCode).toEqual(400);

        // product found
        const result = await request.get(`/api/v1/products/${product_id}`);
        expect(result.statusCode).toEqual(200);
        expect(result.body.id).toEqual(product_id);
    });

    it(`Product Requirement 3 POST /products
        should allow creating a product if authorised`, async () => {
        // no token
        const result_no_token = await request
            .post(`/api/v1/products`)
            .send(product);
        expect(result_no_token.statusCode).toEqual(401);
        expect(result_no_token.body.code).toEqual('EC102');

        // with token
        const result = await request
            .post(`/api/v1/products`)
            .send(product)
            .set('Authorization', 'bearer ' + token);
        expect(result.statusCode).toEqual(200);
        expect(result.body.name).toEqual(product.name);

        const result_show = await request.get(
            `/api/v1/products/${result.body.id}`
        );
        expect(result_show.body.name).toEqual(product.name);
    });

    it(`Product Requirement 4 GET /products/top5
        should return top 5 products based on completed orders`, async () => {
        const result = await request.get(`/api/v1/products/top5`);
        expect(result.statusCode).toEqual(200);
        const p_top5 = await pStore.topN(5);
        expect(result.body).toEqual(p_top5);
    });

    it(`Product Requirement 5 GET /products?category
        should return all products in a category`, async () => {
        // food
        const result = await request.get('/api/v1/products?category=food');
        expect(result.statusCode).toEqual(200);
        expect(result.body.record_count).toEqual(food_count);

        // non existing category
        const result_not_found = await request.get(
            '/api/v1/products?category=qwertyqwerty'
        );
        expect(result_not_found.statusCode).toEqual(200);
        expect(result_not_found.body.record_count).toEqual(0);
    });
});
