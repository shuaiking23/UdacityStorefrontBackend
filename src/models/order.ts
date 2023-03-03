// @ts-ignore
import Client from '../database';
import { CodedError } from '../utilities/common';

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
    async index(): Promise<Order[] | CodedError> {
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
            return ({
                code: 'EO101',
                error: `Could not get orders. Error: ${err}`
            }) as CodedError;
        }
    }

    async show(id: number): Promise<Order | CodedError> {
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
            return ({
                code: 'EO201',
                error: `Could not find order ${id}. Error: ${err}`
            }) as CodedError;
        }
    }

    async create(o: Order): Promise<Order | CodedError> {
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
            return ({
                code: 'EO301',
                error: `Could not add new order ${o}. Error: ${err}`
            }) as CodedError;
        }
    }

    async addProduct(
        op: OrderProduct
    ): Promise<Order | CodedError> {
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
                    return ({
                        code: 'EOP101',
                        error: `Could not add product ${op.product_id} to order ${op.order_id} 
                            because order status is ${order.status}`
                    }) as CodedError;
                }
            } else {
                conn.release();
                return ({
                    code: 'EOP102',
                    error: `Order ${op.order_id} is not valid.`
                }) as CodedError;
            }

            result = await conn.query(product_sql, [op.product_id]);

            if (!result.rows.length) {
                conn.release();
                return ({
                    code: 'EOP103',
                    error: `Product ${op.product_id} is not valid.`
                }) as CodedError;
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
            return ({
                code: 'EOP104',
                error: `Could not add product ${op.product_id} to order ${op.order_id}.
                    Error: ${err}`
            }) as CodedError;
        }
    }

    async showProducts(
        orderId: number
    ): Promise<OrderProduct[] | CodedError> {
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
            return ({
                code: 'EOP201',
                error: `Could not get products from order ${orderId}.
                Error: ${err}`
            }) as CodedError;
        }
    }

    async reduceProduct(
        op: OrderProduct
    ): Promise<OrderProduct | null | CodedError> {
        
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
                        return ({
                            code: 'EOP301',
                            error: `Unable to remove ${op.quantity} quantity
                                from product ${op.product_id} in order ${op.order_id}.`
                        }) as CodedError;
                    }
                } else {
                    await this.removeProduct(op);
                    return;
                }
                
            } else {
                conn.release();
                return ({
                    code: 'EOP302',
                    error: `Unable to find product ${op.product_id} in order ${op.order_id}.`
                }) as CodedError;
            }
        } catch (err) {
            return ({
                code: 'EOP303',
                error: `Could not remove product ${op.product_id} from order ${op.order_id}.
                    Error: ${err}`
            }) as CodedError;
        }
    }

    async removeProduct(
        op: OrderProduct
    ): Promise<null | CodedError> {
        
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
                    return ({
                        code: 'EOP401',
                        error: `Unable to find product ${op.product_id} in order ${op.order_id}.`
                    }) as CodedError;
                }
                
                result = await conn.query(sql, [op.order_id, op.product_id]);

                return;

            } else {
                conn.release();
                return ({
                    code: 'EOP402',
                    error: `Unable to find order ${op.order_id}.`
                }) as CodedError;
            }
        } catch (err) {
            return ({
                code: 'EOP403',
                error: `Could not remove product ${op.product_id} from order ${op.order_id}.
                    Error: ${err}`
            }) as CodedError;
        }
    }

    async complete(id: string): Promise<Order | CodedError> {
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
                return ({
                    code: 'EO401',
                    error: `Could not find order ${id}.`
                }) as CodedError;
            }

        } catch (err) {
            return ({
                code: 'EO402',
                error: `Could not delete order ${id}. Error: ${err}`
            }) as CodedError;
        }
    }

    async delete(id: string): Promise<Order | CodedError> {
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
            return ({
                code: 'EO501',
                error: `Could not delete order ${id}. Error: ${err}`
            }) as CodedError;
        }
    }
}
