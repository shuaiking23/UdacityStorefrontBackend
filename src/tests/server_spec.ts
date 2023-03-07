import supertest from 'supertest';
import * as cfg from '../utilities/appConfigs';
import app from '../server';
import { CodedError } from '../utilities/common';

const request = supertest(app);

describe('Server', () => {
    it('GET / sanity 200 test', async () => {
        try {
            const result = await request.get('/api/v1');
            expect(result.statusCode).toEqual(200);
        } catch (err) {
            console.log(err);
            expect(err).toBe('');
        }
    });
    it('GET / sanity 404 test', async () => {
        try {
            const result = await request.get('/random');
            expect(result.statusCode).toEqual(404);
        } catch (err) {
            console.log(err);
            expect(err).toBe('');
        }
    });
});