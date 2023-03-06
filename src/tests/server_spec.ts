import supertest from 'supertest';
import * as cfg from '../utilities/appConfigs';
import { app } from '../server';
import { CodedError } from '../utilities/common';

const request = supertest(app);

describe('Server', () => {
    fit('GET / sanity test', async () => {
        try {
            const result = await request.get('/api/vi');
            expect(result.statusCode).toEqual(200);
        } catch (err) {
            console.log(err);
            expect(err).toBe('');
        }
    });
});