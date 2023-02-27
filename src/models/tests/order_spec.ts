import { Order, OrderStore } from '../order';

const store = new OrderStore();

describe('Order Model', () => {
    it('should have an index method', () => {
        expect(store.index).toBeDefined();
    });

    it('index method should return a list of orders', async () => {
        const result = await store.index();
        expect(result).toEqual([]);
    });
});
