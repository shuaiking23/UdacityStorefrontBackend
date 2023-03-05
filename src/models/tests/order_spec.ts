import { Order, OrderStore, order_status } from '../order';
import Client from '../../database';
import { CodedError } from '../../utilities/common';

const store = new OrderStore();

describe('Order Model', () => {
    describe('Methods', () => {
        it('should have an show method', () => {
            expect(store.show).toBeDefined();
        });
        it('should have a showByStatus method', () => {
            expect(store.showByStatus).toBeDefined();
        });
    });

    describe('Requirements', () => {
        it(`should be able to create some sample data`, async () => {
            try {
                // @ts-ignore
                const conn = await Client.connect();

                const p_count = 100;
                const o_count = 50;

                await conn.query(`SELECT clear_sample_orders()`);
                await conn.query(`SELECT clear_sample_products()`);

                await conn.query(`SELECT create_sample_products(${p_count})`);
                await conn.query(`SELECT create_sample_orders(1,${o_count},10)`);

                const p_result = await conn.query(
                    `SELECT count(1) AS num FROM products WHERE NOT HISTORIC`
                );
                const o_result = await conn.query(
                    `SELECT count(1) AS num FROM orders WHERE NOT HISTORIC`
                );

                conn.release();

                const p_r_count: number = parseInt(p_result.rows[0].num);
                const o_r_count: number = parseInt(o_result.rows[0].num);

                expect(p_r_count).toBe(p_count);
                expect(o_r_count).toBe(o_count);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`show method should return the most recent active order for user
                when user id is provided`, async () => {
            try {
                const user_id = 1;

                const sql = `SELECT id, user_id
                    FROM orders
                    WHERE user_id = ${user_id} AND status = 'Active'
                        AND NOT historic
                    ORDER BY created, id desc
                    LIMIT 1`;

                // @ts-ignore
                const conn = await Client.connect();

                const sql_result = await conn.query(sql);

                const oid = parseInt(sql_result.rows[0].id);
                const uid = parseInt(sql_result.rows[0].user_id);

                const result = await store.show(user_id, null);

                conn.release();

                expect((result as Order).id).toBe(oid);
                expect(uid).toBe(user_id);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`show method should return error
                when user provided has no active orders`, async () => {
            try {
                const user_id = 3;

                const result = await store.show(user_id, null);

                expect((result as CodedError).code).toBe('EOP101');
            } catch (err) {
                console.log(err);
            }
        });

        it(`showByStatus method should return 
                all records of completed orders for user`, async () => {
            try {
                const user_id = 1;

                const sql = `SELECT count(1) as num
                    FROM orders
                    WHERE user_id = ${user_id} AND status = 'Complete'
                        AND NOT historic`;

                // @ts-ignore
                const conn = await Client.connect();

                const sql_result = await conn.query(sql);
                conn.release();

                const o_count = parseInt(sql_result.rows[0].num);

                const result = await store.showByStatus(
                    user_id,
                    order_status.Complete
                );

                expect((result as Order[]).length).toBe(o_count);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`showByStatus method should return empty Order list
                when user provided does not have completed orders`, async () => {
            try {
                const user_id = 3;

                const result = await store.showByStatus(
                    user_id,
                    order_status.Complete
                );

                expect(typeof (result as CodedError).code).toBe('undefined');
                expect((result as Order[]).length).toBe(0);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });
    });
});
