// @ts-ignore
import Client from '../database';

export type Product = {
    id: number;
    name: string;
    category: string;
    created: string;
    last_update: string;
    historic: boolean;
};

export class ProductStore {
    async index(): Promise<Product[]> {
        try {
            // @ts-ignore
            const conn = await Client.connect();
            const sql = `SELECT id, name, category,
                    created, last_update
                FROM products
                WHERE NOT historic`;

            const result = await conn.query(sql);

            conn.release();

            return result.rows;
        } catch (err) {
            throw new Error(`Could not get products. Error: ${err}`);
        }
    }

    async show(id: string): Promise<Product> {
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
            throw new Error(`Could not find product ${id}. Error: ${err}`);
        }
    }

    async create(p: Product): Promise<Product> {
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
            throw new Error(`Could not add new product ${name}. Error: ${err}`);
        }
    }

    async delete(id: string): Promise<Product> {
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
            throw new Error(`Could not delete product ${id}. Error: ${err}`);
        }
    }
}
