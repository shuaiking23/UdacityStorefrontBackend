import supertest from 'supertest';
import * as cfg from '../../utilities/appConfigs';
import routes from '../../server';
import { Order, OrderStore, order_status } from '../../models/order';
import { CodedError } from '../../utilities/common';

const request = supertest(routes);

fdescribe('Order Handler', () => {
    it('GET / sanity test', async () => {
        try {
            console.log('starto');
            const result = await request.get('/products?category=food');
            console.log(result);
            expect(result.statusCode).toEqual(200);
        } catch (err) {
            console.log(err);
        }

    });

});