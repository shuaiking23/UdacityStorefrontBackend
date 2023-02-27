// @ts-ignore
import Client from '../database';

export type OrderProduct = {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    created: string;
    last_update: string;
    historic: boolean;
};

export class OrderProductStore {
    async index(): Promise<OrderProduct[]> {
        try {
            // @ts-ignore
            const conn = await Client.connect();
            const sql = `SELECT id, order_id, product_id, quantity, 
                    created, last_update
                FROM order_products
                WHERE NOT historic`;

            const result = await conn.query(sql);

            conn.release();

            return result.rows;
        } catch (err) {
            throw new Error(`Could not get order products. Error: ${err}`);
        }
    }

    async show(id: string): Promise<OrderProduct> {
        try {
            const sql = `SELECT * 
                FROM order_products
                WHERE id=($1) AND NOT historic`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            conn.release();

            return result.rows[0];
        } catch (err) {
            throw new Error(
                `Could not find order product ${id}. Error: ${err}`
            );
        }
    }

    async create(op: OrderProduct): Promise<OrderProduct> {
        try {
            const sql = `INSERT INTO order_products (order_id, product_id, quantity)
                VALUES($1, $2, $3) RETURNING *`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [
                op.order_id,
                op.product_id,
                op.quantity,
            ]);

            const order_product = result.rows[0];

            conn.release();

            return order_product;
        } catch (err) {
            throw new Error(
                `Could not add new order product ${name}. Error: ${err}`
            );
        }
    }

    async delete(id: string): Promise<OrderProduct> {
        try {
            const sql = `UPDATE order_products
                SET historic = true
                WHERE id=($1)`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            const order_product = result.rows[0];

            conn.release();

            return order_product;
        } catch (err) {
            throw new Error(
                `Could not delete order product ${id}. Error: ${err}`
            );
        }
    }
}
