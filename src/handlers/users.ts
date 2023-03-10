import express, { Request, Response } from 'express';
import { User, UserStore } from '../models/user';
import dotenv from 'dotenv';
import { tokenCheck, CodedError } from '../utilities/common';
import * as cfg from '../utilities/appConfigs';

const route = express.Router();

dotenv.config();

const store = new UserStore();

// Requirements
/*
RU1 Index [token required] - DONE
RU2 Show [token required] - DONE
RU3 Create N[token required] - DONE
*/
// User Routes
/*
get '/', index, token
get '/:id', show, token
post '/', create, token
delete '/:id', destroy, token - DISABLED
post '/authenticate', authenticate
*/

const index = async (req: Request, res: Response) => {
    try {
        const users = await store.index();
        if ((users as CodedError).error) {
            res.status(400);
        }
        res.json(users);
    } catch (err) {
        res.status(400).json(err);
    }
};
// RU1 Index [token required]
route.get(cfg.URL_BLANK, tokenCheck(null), index);

const authenticate = async (req: Request, res: Response) => {
    try {
        const username = req.body.username as string;
        const password = req.body.password as string;
        const u = await store.authenticate(username, password);
        if ((u as CodedError).error) {
            res.status(401).json(u);
            return;
        } else {
            res.json({
                token: u,
            });
        }
    } catch (err) {
        res.status(401).json({ err });
    }
};
route.post('/authenticate', authenticate);

const show = async (req: Request, res: Response) => {
    try {
        const user = await store.show(parseInt(req.params.id));
        if ((user as CodedError).error) {
            res.status(400);
        }
        res.json(user);
    } catch (err) {
        res.status(401).json({ err });
    }
};
// RU2 Show [token required]
route.get(cfg.URL_ID, tokenCheck(0), show);

const create = async (req: Request, res: Response) => {
    try {
        const user: User = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            password: req.body.password,
        };
        const newUser = await store.create(user);
        if ((newUser as CodedError).error) {
            res.status(400).json(newUser);
            return;
        }
        res.json(newUser);
    } catch (err) {
        res.status(400).json(err);
    }
};
// RU3 Create N[token required]
route.post(cfg.URL_BLANK, tokenCheck(null), create);

const destroy = async (req: Request, res: Response) => {
    try {
        const deleted = await store.deleteSoft(parseInt(req.params.id));
        if ((deleted as CodedError).error) {
            res.status(400);
        }
        res.json(deleted);
    } catch (err) {
        res.status(400).json(err);
    }
};
// route.delete('/:id', tokenCheck(null), destroy);

export default route;
