import supertest from 'supertest';
import * as cfg from '../../utilities/appConfigs';
import app from '../../server';
import { Order, OrderStore, order_status } from '../../models/order';
import { CodedError } from '../../utilities/common';

const request = supertest(app);

fdescribe('Order Handler', () => {
    it('GET / sanity test', async () => {
        try {
            console.log('starto');
            const result = await request.get('/');
            console.log(result);
            expect(result.statusCode).toEqual(200);
        } catch (err) {
            console.log(err);
        }

    });

});