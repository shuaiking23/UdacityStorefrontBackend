// @ts-ignore
import Client from '../database';
import { CodedError } from '../utilities/common';

export type Product = {
    id?: number;
    name: string;
    price: number;
    category: string;
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
                    AND (${1} IS NULL
                        OR category ILIKE ${1})
                ORDER BY name`;

            const result = await conn.query(sql, [category]);

            conn.release();

            return result.rows;
        } catch (err) {
            return ({
                code: 'EP101',
                error: `Could not get products. Error: ${err}`
            }) as CodedError;
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

            return result.rows[0];
        } catch (err) {
            return ({
                code: 'EP201',
                error: `Could not find product ${id}. Error: ${err}`
            }) as CodedError;
        }
    }

    async create(p: Product): Promise<Product | CodedError> {
        try {
            const sql = `INSERT INTO products (name, category) 
                VALUES($1, $2) RETURNING *`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [p.name, p.category]);

            const product = result.rows[0];

            conn.release();

            return product;
        } catch (err) {
            return ({
                code: 'EP301',
                error: `Could not add new product ${name}. Error: ${err}`
            }) as CodedError;
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
            return ({
                code: 'EP401',
                error: `Could not delete product ${id}. Error: ${err}`
            }) as CodedError;
        }
    }
}
