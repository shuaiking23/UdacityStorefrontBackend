import express, { Request, Response } from 'express';
import { User, UserStore } from '../models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { token_check } from '../utilities/common';

const route = express.Router();

dotenv.config();

const store = new UserStore();

// User Routes
/*
get '/', index
get '/:id', show
post '/', create
delete '/:id', destroy
post '/authenticate', authenticate
*/

const index = async (req: Request, res: Response) => {
    const auth_status = token_check(req.headers.token as string, null);

    if (auth_status != 'OK') {
        res.status(401).json(auth_status);
        return;
    }
    const users = await store.index();
    res.json(users);
};
route.get('/', index);

const show = async (req: Request, res: Response) => {
    const auth_status = await token_check(req.headers.token as string, req.params.id as unknown as number);

    if (auth_status != 'OK') {
        res.status(401).json(auth_status);
        return;
    }
    const user = await store.show(req.params.id);
    res.json(user);
};
route.get('/:id', show);

const create = async (req: Request, res: Response) => {
    const user: User = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: req.body.password,
    };
    try {
        const newUser = await store.create(user);
        var token = jwt.sign({ user: newUser }, process.env.TOKEN_SECRET);
        res.json(token);
    } catch (err) {
        res.status(400).json(err + user);
    }
};
route.post('/', create);

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(req.body.id);
    res.json(deleted);
};
route.delete('/:id', destroy);

const authenticate = async (req: Request, res: Response) => {
    const username = req.body.username as string;
    const password = req.body.password as string;
    try {
        const u = await store.authenticate(username, password);
        if (typeof u === 'string') {
            res.status(401).json({
                'error': u
            });
            return;
        }
        var token = jwt.sign({ user: u }, process.env.TOKEN_SECRET);

        res.json({
            'token':token
        });
    } catch (err) {
        res.status(401).json({ err });
    }
};
route.post('/authenticate', authenticate);

export default route;
