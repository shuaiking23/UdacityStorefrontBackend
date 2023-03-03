import express, { Request, Response } from 'express';
import { Order, OrderProduct, OrderStore, order_status } from '../models/order';
import { token_check, CodedError } from '../utilities/common';

const route = express.Router();

const store = new OrderStore();

// Middleware to check order user
const checkOrderUser = async (req: Request, res: Response, next) => {
    const order = await store.show(parseInt(req.params.id));
    if ((order as CodedError).error) {
        res.status(400).json(order)
    }
    else if (res.locals.userid !== (order as Order).user_id) {
        res.status(403).json(({
            code: 'EO301',
            error: 'User does not match!'
        }) as CodedError)
        return;
    }
    next();
};

// Order Routes
/*
get '/', index
get '/:id', show
post '/', create
delete '/:id', destroy
*/

const index = async (_req: Request, res: Response) => {
    const orders = await store.index();
    if((orders as CodedError).error) {
        res.status(400);
    };
    res.json(orders);
};
route.get('/', index);

const show = async (req: Request, res: Response) => {
    const order = await store.show(parseInt(req.params.id));
    if((order as CodedError).error) {
        res.status(400);
    }
    res.json(order);
};
route.get('/:id', show);

const create = async (req: Request, res: Response) => {
    try {
        const order: Order = {
            user_id: req.body.userid,
            status: order_status.Active,
        };

        const newOrder = await store.create(order);
        if((newOrder as CodedError).error) {
            res.status(400);
        };
        res.json(newOrder);
    } catch (err) {
        res.status(400).json(err);
    }
};
route.post('/', token_check(null), create);

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(req.body.orderid);
    if((deleted as CodedError).error) {
        res.status(400);
    };
    res.json(deleted);
};
route.delete('/:id', token_check(null), checkOrderUser, destroy);

// Order Product Routes
/*
post '/:id/products', showProducts
post '/:id/product/add', addProduct
post '/:id/product/reduce', reduceProduct
*/

const showProducts = async (req: Request, res: Response) => {
    try {
        const orderProducts = await store.showProducts(
            parseInt(req.params.id)
        );
        if((orderProducts as CodedError).error) {
            res.status(400);
        };
        res.json(orderProducts);
    } catch (err) {
        res.status(400).json(err);
    }
};
route.post('/:id/products', token_check(null), checkOrderUser, showProducts);

const addProduct = async (req: Request, res: Response) => {
    const op: OrderProduct = {
        order_id: parseInt(req.params.id),
        product_id: parseInt(req.body.productId),
        quantity: parseInt(req.body.quantity)
    }

    try {
        const addedProduct = await store.addProduct(
            op
        );
        if((addedProduct as CodedError).error) {
            res.status(400);
        };
        res.json(addedProduct);
    } catch (err) {
        res.status(400).json(err);
    }
};
route.post('/:id/product/add', token_check(null), checkOrderUser, addProduct);

const reduceProduct = async (req: Request, res: Response) => {
    // Quantity should be optional
    // If not provided, remove product from order
    const op: OrderProduct = {
        order_id: parseInt(req.params.id),
        product_id: parseInt(req.body.productId),
        quantity: parseInt(req.body.quantity)
    }
    
    try {
        const reduceProduct = await store.reduceProduct(
            op
        );
        if((reduceProduct as CodedError).error) {
            res.status(400);
        };
        res.json(reduceProduct);
    } catch (err) {
        res.status(400).json(err);
    }
};
route.post('/:id/product/reduce', token_check(null), checkOrderUser, reduceProduct);

export default route;
