import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';

const store = new OrderProductStore();

const index = async (_req: Request, res: Response) => {
    const products = await store.index();
    res.json(products);
};

const show = async (req: Request, res: Response) => {
    const product = await store.show(req.params.id);
    res.json(product);
};

const create = async (req: Request, res: Response) => {
    try {
        const product: Product = {
            title: req.body.title,
            content: req.body.content,
        };

        const newProduct = await store.create(product);
        res.json(newProduct);
    } catch (err) {
        res.status(400);
        res.json(err);
    }
};

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(req.body.id);
    res.json(deleted);
};

const productRoutes = (app: express.Application) => {
    app.get('/products', index);
    app.get('/products/:id', show);
    app.post('/products', create);
    app.delete('/products/:id', destroy);
};

export default productRoutes;
