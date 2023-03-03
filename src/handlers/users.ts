import express, { Request, Response } from 'express';
import { User, UserStore } from '../models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { token_check, CodedError } from '../utilities/common';

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
    try {
        const users = await store.index();
        if((users as CodedError).error) {
            res.status(400);
        };
        res.json(users);
    } catch (err) {
        res.status(400).json(err);
    }    
};
route.get('/', token_check(null), index);

const show = async (req: Request, res: Response) => {
    const user = await store.show(parseInt(req.params.id));
    if((user as CodedError).error) {
        res.status(400);
    };
    res.json(user);
};
route.get('/:id', token_check(0), show);

const create = async (req: Request, res: Response) => {
    const user: User = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: req.body.password,
    };
    try {
        const newUser = await store.create(user);
        if((newUser as CodedError).error) {
            res.status(400).json(newUser);
            return;
        };
        var token = jwt.sign({ user: newUser }, process.env.TOKEN_SECRET);
        res.json(token);
    } catch (err) {
        res.status(400).json(err + user);
    }
};
route.post('/', token_check(null), create);

const destroy = async (req: Request, res: Response) => {
    const deleted = await store.delete(parseInt(req.params.id));
    if((deleted as CodedError).error) {
        res.status(400);
    };
    res.json(deleted);
};
route.delete('/:id', destroy);

const authenticate = async (req: Request, res: Response) => {
    const username = req.body.username as string;
    const password = req.body.password as string;
    try {
        const u = await store.authenticate(username, password);
        if ((u as CodedError).error) {
            res.status(401).json(u);
            return;
        }
        else {
            var token = jwt.sign({ user: (u as User).username }, process.env.TOKEN_SECRET);
            res.json({
                'token':token
            });
        }
    } catch (err) {
        res.status(401).json({ err });
    }
};

route.post('/authenticate', authenticate);

export default route;
