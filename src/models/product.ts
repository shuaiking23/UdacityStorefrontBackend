// @ts-ignore
import Client from '../database';
import { CodedError } from '../utilities/common';

export type Product = {
    id?: number;
    name: string;
    price?: number;
    category?: string;
    historic?: boolean;
    order_sum?: number;
};

export class ProductStore {
    async index(category: string | null): Promise<Product[] | CodedError> {
        try {
            // @ts-ignore
            const conn = await Client.connect();
            const sql = `SELECT id, name, category,
                    created, last_update
                FROM products
                WHERE NOT historic
                    AND (($1)::text IS NULL
                        OR category ILIKE ($1)::text)
                ORDER BY name`;

            const result = await conn.query(sql, [category]);

            conn.release();

            return result.rows as Product[];
        } catch (err) {
            return {
                code: 'EP101',
                error: `Could not get products. Error: ${err}`,
            } as CodedError;
        }
    }

    async show(id: number): Promise<Product | object> {
        try {
            const sql = `SELECT *
                FROM products
                WHERE id=($1) AND NOT historic`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            conn.release();

            if (!result.rows.length) {
                return {
                    code: 'EP201',
                    error: `Could not find product ${id}.`,
                } as CodedError;
            } else {
                return result.rows[0];
            }
        } catch (err) {
            return {
                code: 'EP202',
                error: `Could not find product ${id}. Error: ${err}`,
            } as CodedError;
        }
    }

    async create(p: Product): Promise<Product | CodedError> {
        try {
            const sql = `INSERT INTO products (name, category, price) 
                VALUES($1, $2, $3) RETURNING *`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [p.name, p.category, p.price]);

            const p_result = result.rows[0];

            const product: Product = {
                id: p_result.id,
                name: p_result.name,
                price: p_result.price,
                category: p_result.category,
            };

            conn.release();

            return product;
        } catch (err) {
            return {
                code: 'EP301',
                error: `Could not add new product ${p.name}. Error: ${err}`,
            } as CodedError;
        }
    }

    async delete(id: number): Promise<Product | CodedError> {
        try {
            const sql = `UPDATE products
                SET name = 'd_' || name, historic = true
                WHERE id=($1)`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            const product = result.rows[0];

            conn.release();

            return product;
        } catch (err) {
            return {
                code: 'EP401',
                error: `Could not delete product ${id}. Error: ${err}`,
            } as CodedError;
        }
    }

    async topN(top_num: number): Promise<Product[] | CodedError> {
        try {
            const sql = `SELECT tp.id, tp.name, tp.historic, 
                    tp.order_quantity as order_sum
                FROM top_selling_products(${top_num}) tp`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql);

            const products = result.rows;

            conn.release();

            return products;
        } catch (err) {
            return {
                code: 'EP501',
                error: `Could not get top5 products. Error: ${err}`,
            } as CodedError;
        }
    }
}
