// @ts-ignore
import Client from '../database';

enum order_status {
    Active = 'Active',
    Complete = 'Complete',
}

export type Order = {
    id: number;
    user_id: number;
    status: order_status;
    created: string;
    last_update: string;
    historic: boolean;
};

export class OrderStore {
    async index(): Promise<Order[]> {
        try {
            // @ts-ignore
            const conn = await Client.connect();
            const sql = `SELECT id, user_id, status, created, 
                    created, last_update
                FROM orders
                WHERE NOT historic`;

            const result = await conn.query(sql);

            conn.release();

            return result.rows;
        } catch (err) {
            throw new Error(`Could not get orders. Error: ${err}`);
        }
    }

    async show(id: string): Promise<Order> {
        try {
            const sql = `SELECT * 
                FROM orders
                WHERE id=($1) AND NOT historic`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            conn.release();

            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not find order ${id}. Error: ${err}`);
        }
    }

    async create(o: Order): Promise<Order> {
        try {
            const sql = `INSERT INTO orders (first_name, last_name, password)
                VALUES($1, $2, $3) RETURNING *`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [o.user_id, o.status]);

            const order = result.rows[0];

            conn.release();

            return order;
        } catch (err) {
            throw new Error(`Could not add new order ${name}. Error: ${err}`);
        }
    }

    async delete(id: string): Promise<Order> {
        try {
            const sql = `UPDATE orders
                SET historic = true
                WHERE id=($1)`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            const order = result.rows[0];

            conn.release();

            return order;
        } catch (err) {
            throw new Error(`Could not delete order ${id}. Error: ${err}`);
        }
    }
}
