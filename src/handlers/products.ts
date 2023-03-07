import express, { Request, Response } from 'express';
import { Product, ProductStore } from '../models/product';
import { tokenCheck, CodedError } from '../utilities/common';
import * as cfg from '../utilities/appConfigs';

const route = express.Router();

const store = new ProductStore();

// Requirements
/*
RP1 Index - DONE
RP2 Show - DONE
RP3 Create [token required] - DONE
RP4 [OPTIONAL] Top 5 most popular products - DONE
RP5 [OPTIONAL] Products by category (args: product category) - DONE
*/
// Product Routes
/*
get '/', index, public
get '/:id', show, public
post '/', create, token
delete '/:id', destroy, token - DISABLED
get '/top5', top5, public
*/

const index = async (req: Request, res: Response) => {
    // Optionally allow filter by category
    var category: string | null = req.query.category as string;
    if (!category) {
        category = null;
    }
    const products = await store.index(category);
    if ((products as CodedError).error) {
        res.status(400);
    }
    res.json({
        record_count: (products as Product[]).length,
        products,
    });
};
// RP01 Index
// RP05 [OPTIONAL] Products by category (args: product category)
route.get(cfg.URL_BLANK, index);

const topN = (t_num: number) => {
    return async (req: Request, res: Response) => {
        const topProducts = await store.topN(5);
        if ((topProducts as CodedError).error) {
            res.status(400);
        }
        res.json(topProducts);
    };
};
// RP04 [OPTIONAL] Top 5 most popular products
route.get('/top5', topN(5));

const show = async (req: Request, res: Response) => {
    const product = await store.show(parseInt(req.params.id));
    if ((product as CodedError).error) {
        res.status(400);
    }
    res.json(product);
};
// RP02 Show
route.get(cfg.URL_ID, show);

const create = async (req: Request, res: Response) => {
    try {
        const product: Product = {
            name: req.body.name as string,
            price: req.body.price as number,
            category: req.body.category as string,
        };

        const newProduct = await store.create(product);
        if ((newProduct as CodedError).error) {
            res.status(400);
        }
        res.json(newProduct);
    } catch (err) {
        res.status(400).json(err);
    }
};
// RP03 Create [token required]
route.post(cfg.URL_BLANK, tokenCheck(null), create);

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(parseInt(req.params.id));
    if ((deleted as CodedError).error) {
        res.status(400);
    }
    res.json(deleted);
};
// route.delete('/:id', tokenCheck(null), destroy);


export default route;
