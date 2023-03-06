import express, { Request, Response, NextFunction } from 'express';
import { Order, OrderProduct, OrderStore, order_status } from '../models/order';
import { tokenCheck, CodedError } from '../utilities/common';
import * as cfg from '../utilities/appConfigs';

const route = express.Router();

const store = new OrderStore();

// Requirements
/*
RO1 Current Order by user (args: user id)[token required] - DONE
RO2 [OPTIONAL] Completed Orders by user (args: user id)[token required] - DONE
*/
// Order Routes
/*
get '/current', showCurrent, token
get '/completed', showByStatus(order_status.Complete), token
get '/active', showByStatus(order_status.Active), token - DISABLED
get '/:id', show, token - DISABLED
post '/', create, token - DISABLED
delete '/:id', destroy, token - DISABLED
*/

// Middleware to check order user
const orderUserCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('orderCheck');
    try {
        const user_id = await store.getOrderUser(parseInt(req.params.id));
        if ((user_id as CodedError).error) {
            res.status(400).json(user_id);
            return;
        }
        if ((user_id as string) != res.locals.userid) {
            res.status(403).json({
                code: 'EOH101',
                error: `You have no access to this order`,
            } as CodedError);
            return;
        }
    } catch (err) {}
    next();
};


// Returns the most recent active order
const showCurrent = async (req: Request, res: Response) => {
    console.log('showCurrent');
    const order = await store.show(parseInt(res.locals.userid), null);
    if ((order as CodedError).error) {
        res.status(400);
    }
    res.json(order);
};
// RO1 Current Order by user (args: user id)[token required]
route.get('/current', tokenCheck(null), showCurrent);

const showByStatus = (status: order_status) => {
    return async (req: Request, res: Response) => {
        const order = await store.showByStatus(
            parseInt(res.locals.userid),
            status
        );
        if ((order as CodedError).error) {
            res.status(400);
        }
        res.json({
            record_count: (order as Order[]).length,
            order,
        });
    };
};
// RO2 [OPTIONAL] Completed Orders by user (args: user id)[token required]
route.get('/completed', tokenCheck(null), showByStatus(order_status.Complete));
//route.get('/active', tokenCheck(null), showByStatus(order_status.Active));

const show = async (req: Request, res: Response) => {
    const order = await store.show(null, parseInt(req.params.id));
    if ((order as CodedError).error) {
        if ((order as CodedError).code == 'EOPH101') {
            res.status(403);
        } else {
            res.status(400);
        }
        res.json(order);
        return;
    }
    res.json(order);
};
//route.get(cfg.URL_ID, tokenCheck(null), order_user_check, show);

const create = async (req: Request, res: Response) => {
    try {
        const order: Order = {
            user_id: res.locals.userid,
            status: order_status.Active,
        };

        const newOrder = await store.create(order);
        if ((newOrder as CodedError).error) {
            res.status(400).json(newOrder);
            return;
        }
        res.json(newOrder);
    } catch (err) {
        res.status(400).json(err);
    }
};
// route.post(cfg.URL_BLANK, tokenCheck(null), create);

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(req.body.orderid);
    if ((deleted as CodedError).error) {
        res.status(400).json(deleted);
        return;
    }
    res.json(deleted);
};
// route.delete('/:id', token_check(null), orderUserCheck, destroy);

// Order Product Routes
/*
post '/:id/products', showProducts - Disabled
post '/:id/product/add', addProduct - Disabled
post '/:id/product/reduce', reduceProduct - Disabled
*/

const showProducts = async (req: Request, res: Response) => {
    try {
        const orderProducts = await store.showProducts(parseInt(req.params.id));
        if ((orderProducts as CodedError).error) {
            res.status(400).json(orderProducts);
            return;
        }
        res.json(orderProducts);
    } catch (err) {
        res.status(400).json(err);
    }
};
// route.post(cfg.URL_ID + cfg.URL_PRODUCT, tokenCheck(null), orderUserCheck, showProducts);

const addProduct = async (req: Request, res: Response) => {
    const op: OrderProduct = {
        order_id: parseInt(req.params.id),
        product_id: parseInt(req.body.productId),
        quantity: parseInt(req.body.quantity),
    };

    try {
        const addedProduct = await store.addProduct(op);
        if ((addedProduct as CodedError).error) {
            res.status(400).json(addedProduct);
        }
        res.json(addedProduct);
    } catch (err) {
        res.status(400).json(err);
    }
};
// route.post(`${cfg.URL_ID}${cfg.URL_PRODUCT}/add`, tokenCheck(null), orderUserCheck, addProduct);

const reduceProduct = async (req: Request, res: Response) => {
    // Quantity should be optional
    // If not provided, remove product from order
    const op: OrderProduct = {
        order_id: parseInt(req.params.id),
        product_id: parseInt(req.body.productId),
        quantity: parseInt(req.body.quantity),
    };

    try {
        const reduceProduct = await store.reduceProduct(op);
        if ((reduceProduct as CodedError).error) {
            res.status(400);
        }
        res.json(reduceProduct);
    } catch (err) {
        res.status(400).json(err);
    }
};
// route.post(`${cfg.URL_ID}${cfg.URL_PRODUCT}/reduce`, tokenCheck(null), orderUserCheck, reduceProduct);


export default route;
