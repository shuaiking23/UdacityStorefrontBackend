import supertest from 'supertest';
import { Product, ProductStore } from '../../models/user';
import route from '../users';
import { CodedError } from '../../utilities/common';

const request = supertest(route);

describe('User Handler', () => {
    it('sample test', async () => {
    	expect(1).toBe(1);
    });
});