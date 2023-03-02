import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';
import { token_check } from '../utilities/common';

const route = express.Router();

const store = new ProductStore();

// Product Routes
/*
get '/', index
get '/:id', show
post '/', create
delete '/:id', destroy
*/

const index = async (_req: Request, res: Response) => {
    const products = await store.index();
    res.json(products);
};
route.get('/', index);


const show = async (req: Request, res: Response) => {
    const product = await store.show(req.params.id);
    res.json(product);
};
route.get('/:id', show);

const create = async (req: Request, res: Response) => {
    try {
        const product: Product = {
            name: req.body.name as string,
            price: req.body.price as number,
            category: req.body.category as string,
        };

        const newProduct = await store.create(product);
        res.json(newProduct);
    } catch (err) {
        res.status(400).json(err);
    }
};
route.post('/', create);

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(req.body.id);
    res.json(deleted);
};
route.delete('/:id', destroy);


export default route;
