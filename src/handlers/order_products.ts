import express, { Request, Response } from 'express';
import { OrderProduct, OrderProductStore } from '../models/order_product';

const store = new OrderProductStore();

const index = async (_req: Request, res: Response) => {
    const order_products = await store.index();
    res.json(order_products);
};

const show = async (req: Request, res: Response) => {
    const order_product = await store.show(req.params.id);
    res.json(order_product);
};

const create = async (req: Request, res: Response) => {
    try {
        const order_product: OrderProduct = {
            title: req.body.title,
            content: req.body.content,
        };

        const newProductOrder = await store.create(order_product);
        res.json(newProductOrder);
    } catch (err) {
        res.status(400);
        res.json(err);
    }
};

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(req.body.id);
    res.json(deleted);
};

const orderProductRoutes = (app: express.Application) => {
    app.get('/orderproducts', index);
    app.get('/orderproducts/:id', show);
    app.post('/orderproducts', create);
    app.delete('/orderproducts/:id', destroy);
};

export default orderProductRoutes;
