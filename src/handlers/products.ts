import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';
import { token_check, CodedError } from '../utilities/common';

const route = express.Router();

const store = new ProductStore();

// Product Routes
/*
get '/', index
get '/:id', show
post '/', create
delete '/:id', destroy
*/

const index = async (req: Request, res: Response) => {
    // Optionally allow filter by category
    var category = req.query.category as string;
    if (!category) {
        category = null;
    }

    const products = await store.index(category);
    if((products as CodedError).error) {
        res.status(400);
    };
    res.json(products);
};
route.get('/', index);


const show = async (req: Request, res: Response) => {
    const product = await store.show(parseInt(req.params.id));
    if((product as CodedError).error) {
        res.status(400);
    };
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
        if((newProduct as CodedError).error) {
            res.status(400);
        };
        res.json(newProduct);
    } catch (err) {
        res.status(400).json(err);
    }
};
route.post('/', create);

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(parseInt(req.params.id));
    if((deleted as CodedError).error) {
        res.status(400);
    };
    res.json(deleted);
};
route.delete('/:id', destroy);


export default route;
