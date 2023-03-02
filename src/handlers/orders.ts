import express, { Request, Response } from 'express';
import { Order, OrderProduct, OrderStore, order_status } from '../models/order';
import { token_check } from '../utilities/common';

const route = express.Router();

const store = new OrderStore();

// Order Routes
/*
get '/', index
get '/:id', show
post '/', create
delete '/:id', destroy
*/

const index = async (_req: Request, res: Response) => {
    const orders = await store.index();
    res.json(orders);
};
route.get('/', index);

const show = async (req: Request, res: Response) => {
    const order = await store.show(parseInt(req.params.id));
    res.json(order);
};
route.get('/:id', show);

const checkOrderUser = async (req: Request, res: Response, next) => {
    const order = await store.show(parseInt(req.params.id));
    if (res.locals.userid !== order.user_id) {
        res.status(403).json({
            'error': '[EO301] User does not match!'
        })
        return;
    }
    next();
};

const create = async (req: Request, res: Response) => {
    try {
        const order: Order = {
            user_id: req.body.userid,
            status: order_status.Active,
        };

        const newOrder = await store.create(order);
        res.json(newOrder);
    } catch (err) {
        res.status(400).json(err);
    }
};
route.post('/', token_check(null), create);

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(req.body.orderid);
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
        res.json(reduceProduct);
    } catch (err) {
        res.status(400).json(err);
    }
};
route.post('/:id/product/reduce', token_check(null), checkOrderUser, reduceProduct);

export default route;
