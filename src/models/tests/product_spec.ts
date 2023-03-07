import { Product, ProductStore } from '../product';
import Client from '../../database';
import { CodedError } from '../../utilities/common';

const store = new ProductStore();

describe('Product Model', () => {
    describe('Methods', () => {
        it('should have an index method', () => {
            expect(store.index).toBeDefined();
        });
        it('should have a show method', () => {
            expect(store.show).toBeDefined();
        });
        it('should have a create method', () => {
            expect(store.create).toBeDefined();
        });
        it('should have a top5 method', () => {
            expect(store.topN).toBeDefined();
        });
    });

    describe('Requirements', () => {
        it(`Product Requirement 1 index method 
            should return a list of active products`, async () => {
            const category = null;

            try {
                // @ts-ignore
                const conn = await Client.connect();

                await conn.query(`SELECT clear_sample_orders()`);
                await conn.query(`SELECT clear_sample_products()`);
                await conn.query(`SELECT create_sample_products(100)`);
                await conn.query(`SELECT create_sample_orders(1,10,10)`);
                await conn.query(`SELECT create_sample_orders(2,5,5)`);

                const p_result = await conn.query(
                    `SELECT count(1) AS num FROM products WHERE NOT HISTORIC`
                );
                conn.release();

                const p_r_count: number = parseInt(p_result.rows[0].num);

                const result = await store.index(category);

                expect((result as Product[]).length).toBe(p_r_count);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`Product Requirement 2 show method 
            should return a Product
            based on product id provided`, async () => {
            const sql = `SELECT id
                FROM products
                WHERE NOT HISTORIC
                LIMIT 1`;
            let result;
            try {
                // @ts-ignore
                const conn = await Client.connect();

                const p_result = await conn.query(sql);
                conn.release();

                const pid: number = parseInt(p_result.rows[0].id);

                result = await store.show(pid);

                expect((result as Product).id).toBe(pid);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`Product Requirement 2 show method 
            should return CodedError
            when product id provided is not an active product`, async () => {
            const pid = -1;

            const result = await store.show(pid);

            expect((result as Product).id).toBeUndefined();
            expect((result as CodedError).code).toBe('EP201');
        });

        it(`Product Requirement 3 create method 
            should create a new product
            and return the product`, async () => {
            const p_name = 'Sample_Product_testRP03';

            const product: Product = {
                name: p_name,
                price: 34.5,
                category: 'Food',
            };

            const sql = `SELECT id
                FROM products
                WHERE NOT HISTORIC
                    AND name = ($1)
                LIMIT 1`;

            const delete_sql = `DELETE
                FROM products
                WHERE name = ($1)`;

            try {
                // @ts-ignore
                const conn = await Client.connect();

                await conn.query(delete_sql, [p_name]);
                const pre_result = await conn.query(sql, [p_name]);

                expect(pre_result.rows.length).toBe(0);

                const result = await store.create(product);

                const post_result = await conn.query(sql, [p_name]);

                const p = post_result.rows[0];

                await conn.query(delete_sql, [p_name]);

                conn.release();

                expect(post_result.rows.length).toBe(1);
                expect((result as Product).id).toBe(parseInt(p.id));
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`Product Requirement 4 top5 method
            should return top 5 products
            based on completed orders`, async () => {
            const sql = `SELECT p.id, p.historic,
                    sum(op.quantity)::INTEGER as order_sum
                FROM order_products op
                LEFT JOIN products p on p.id = op.product_id
                LEFT JOIN orders o on o.id = op.order_id
                WHERE NOT op.historic
                    AND NOT o.historic
                    AND o.status = 'Complete'
                GROUP BY p.id, p.historic
                ORDER BY order_sum desc
                LIMIT 5`;
            try {
                // @ts-ignore
                const conn = await Client.connect();

                const p_result = await conn.query(sql);

                conn.release();

                expect(p_result.rows.length).toBe(5);

                const result = await store.topN(5);

                expect((result as Product[]).length).toBe(5);

                for (let i = 0; i < 5; i++) {
                    expect((result as Product[])[i].id).toBe(
                        p_result.rows[i].id
                    );
                    expect((result as Product[])[i].order_sum).toBe(
                        p_result.rows[i].order_sum
                    );
                }
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`Product Requirement 5 index method
            should return a list of active products filtered by category`, async () => {
            const category = 'food';

            const sql = `SELECT count(1) AS num 
                FROM products
                WHERE NOT HISTORIC AND category ILIKE ($1)`;

            try {
                // @ts-ignore
                const conn = await Client.connect();

                const p_result = await conn.query(sql, [category]);
                conn.release();

                const p_r_count: number = parseInt(p_result.rows[0].num);

                const result = await store.index(category);

                expect((result as Product[]).length).toBe(p_r_count);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });

        it(`Product Requirement 5 index method
            should return empty Product list
            when filtered by category without active products`, async () => {
            const category = 'nonexistingcategory';

            const sql = `SELECT count(1) AS num 
                FROM products
                WHERE NOT HISTORIC AND category ILIKE ($1)`;

            try {
                // @ts-ignore
                const conn = await Client.connect();

                const p_result = await conn.query(sql, [category]);
                conn.release();

                const p_r_count: number = parseInt(p_result.rows[0].num);

                const result = await store.index(category);

                expect(p_r_count).toBe(0);
                expect((result as Product[]).length).toBe(p_r_count);
            } catch (err) {
                console.log(err);
                expect(err).toBe('');
            }
        });
    });
});
