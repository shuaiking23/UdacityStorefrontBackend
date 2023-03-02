// @ts-ignore
import Client from '../database';

export enum order_status {
    Active = 'Active',
    Complete = 'Complete',
}

export type Order = {
    id?: number;
    user_id: number;
    status: order_status;
};

export type OrderProduct = {
    id?: number;
    order_id: number;
    product_id: number;
    name?: string;
    quantity?: number;
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
            throw new Error(`[EO101] Could not get orders. Error: ${err}`);
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
            throw new Error(`[EO201] Could not find order ${id}. Error: ${err}`);
        }
    }

    async create(o: Order): Promise<Order> {
        try {
            const sql = `INSERT INTO orders (user_id, status)
                VALUES($1, $2) RETURNING *`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [o.user_id, o.status]);

            const order = result.rows[0];

            conn.release();

            return order;
        } catch (err) {
            throw new Error(`[EO301] Could not add new order ${o}. Error: ${err}`);
        }
    }

    async addProduct(
        op: OrderProduct
    ): Promise<Order> {
        try {
            const order_sql = `SELECT * 
                FROM orders
                WHERE id=($1) AND NOT historic`;
            const product_sql = `SELECT * 
                FROM products
                WHERE id=($1) AND NOT historic`;
            const exists_sql = `SELECT count(1) > 0
                FROM order_products
                WHERE order_id = ($1) AND product_id = ($2)
                    AND NOT historic`;
            const insert_sql = `INSERT INTO order_products (
                    order_id, product_id, quantity)
                VALUES($1, $2, $3) RETURNING *`;
            const update_sql = `UPDATE order_products
                SET quantity = quantity + ($3)
                WHERE order_id = ($1) AND product_id = ($2)`;
            // @ts-ignore
            const conn = await Client.connect();

            let result = await conn.query(order_sql, [op.order_id]);

            if (result.rows.length) {
                const order = result.rows[0];
                if (order.status !== 'Active') {
                    conn.release();
                    throw new Error(
                        `[EOP101] Could not add product ${op.product_id} to order ${op.order_id} 
                            because order status is ${order.status}`
                    );
                }
            } else {
                conn.release();
                throw new Error(`[EOP102] Order ${op.order_id} is not valid.`);
            }

            result = await conn.query(product_sql, [op.product_id]);

            if (!result.rows.length) {
                conn.release();
                throw new Error(`[EOP103] Product ${op.product_id} is not valid.`);
            }

            result = await conn.query(exists_sql, [op.order_id, op.product_id]);

            const exists = result.rows[0];

            let sql = insert_sql;
            if (exists) {
                sql = update_sql;
            }
            result = await conn.query(sql, [
                op.order_id,
                op.product_id,
                op.quantity,
            ]);

            const order = result.rows[0];

            conn.release();

            return order;
        } catch (err) {
            throw new Error(`[EOP104] Could not add product ${op.product_id} to order ${op.order_id}.
                Error: ${err}`);
        }
    }

    async showProducts(
        orderId: string
    ): Promise<OrderProduct[]> {
        try {
            const order_product_sql = `SELECT op.order_id, p.name, op.quantity
                FROM order_products op
                LEFT JOIN products p on p.id = op.product_id
                LEFT JOIN order o on o.id = op.order_id
                WHERE op.order_id=($1)
                    AND NOT op.historic AND NOT o.historic`;
            // @ts-ignore
            const conn = await Client.connect();

            let result = await conn.query(order_product_sql, [orderId]);
            const order: OrderProduct[] = result.rows;

            return order;
        } catch (err) {
            throw new Error(`[EOP201] Could not get products from order ${orderId}.
                Error: ${err}`);
        }
    }

    async reduceProduct(
        op: OrderProduct
    ): Promise<OrderProduct|null> {
        
        try {
            const order_product_sql = `SELECT op.quantity
                FROM order_products op
                LEFT JOIN order o on o.id = op.order_id 
                WHERE op.order_id=($1) AND op.product_id=($2)
                    AND NOT o.historic AND NOT op.historic`;
            const remove_product_sql = ``
            // @ts-ignore
            const conn = await Client.connect();

            let result = await conn.query(order_product_sql, [op.order_id, op.product_id]);

            if (result.rows.length) {
                if (op.quantity) {
                    const quantity: number = result.rows[0];
                    if (op.quantity > quantity) {
                        conn.release();
                        throw new Error(`[EOP301] Unable to remove ${op.quantity} quantity from product ${op.product_id} in order ${op.order_id}.`);
                    }
                } else {
                    await this.removeProduct(op);
                    return;
                }
                
            } else {
                conn.release();
                throw new Error(`[EOP302] Unable to find product ${op.product_id} in order ${op.order_id}.`);
            }
        } catch (err) {
            throw new Error(`[EOP303] Could not remove product ${op.product_id} from order ${op.order_id}.
                Error: ${err}`);
        }
    }

    async removeProduct(
        op: OrderProduct
    ) {
        
        try {
            const active_sql = `SELECT status='Active'
                FROM order
                WHERE id = ($1) AND NOT historic`;
            const exists_sql = `SELECT count(1)>0 AS exists
                FROM order_products
                WHERE order_id=($1) AND product_id=($2) NOT historic`;
            const delete_sql = `DELETE FROM order_products
                WHERE order_id=($1) AND product_id=($2)
                RETURNING id`;
            const historic_sql = `UPDATE order_products
                SET historic = true
                WHERE order_id=($1) AND product_id=($2)
                RETURNING id`;
            // @ts-ignore
            const conn = await Client.connect();

            let result = await conn.query(active_sql, [op.order_id]);
            if (result.rows.length) {
                const status_active = result.rows[0];
                result = await conn.query(exists_sql, [op.order_id, op.product_id]);
                
                let sql = historic_sql;

                if (result.rows[0].exists) {    
                    // Only delete order_product record if order is active
                    if (status_active) {
                        sql = delete_sql;
                    }
                } else {
                    conn.release();
                    throw new Error(`[EOP401] Unable to find product ${op.product_id} in order ${op.order_id}.`);
                }
                
                result = await conn.query(sql, [op.order_id, op.product_id]);

                console.log(result);

            } else {
                conn.release();
                throw new Error(`[EOP402] Unable to find order ${op.order_id}.`);
            }
        } catch (err) {
            throw new Error(`[EOP403] Could not remove product ${op.product_id} from order ${op.order_id}.
                Error: ${err}`);
        }
    }

    async complete(id: string): Promise<Order> {
        try {
            const sql = `UPDATE orders status='Complete'
                WHERE id=($1) AND NOT historic
                RETURNING id`;
            // @ts-ignore
            const conn = await Client.connect();

            const result = await conn.query(sql, [id]);

            conn.release();

            if (result.rows.length) {
                const order = result.rows[0];
                return order;
            }
            else {
                throw new Error(`[EO401] Could not find order ${id}.`);
            }
            

            

            
        } catch (err) {
            throw new Error(`[EO402] Could not delete order ${id}. Error: ${err}`);
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
            throw new Error(`[EO401] Could not delete order ${id}. Error: ${err}`);
        }
    }
}
