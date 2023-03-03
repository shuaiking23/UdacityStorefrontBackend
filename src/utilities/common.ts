import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export type CodedError = {
    'code': string;
    'error': string;
};

export const token_check = (user_id: number | null) => {
    return async (req: Request, res: Response, next) => {
        try {
            const bearerHeader = req.headers.authorization;
            if (typeof bearerHeader !== 'undefined') {

                const token = bearerHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
                // match user_id if not null
                // if user_id = 0, take id from param
                // else skip matching
                if ((user_id != null && decoded.id !== user_id) ||
                    (user_id == 0 && decoded.id != parseInt(req.params.id))) {
                    res.status(401).json(({
                        code: 'EC101',
                        error: 'User id does not match!'
                    }) as CodedError);
                    return;
                }
                res.locals.userid = decoded.id;
            }
            else {
                res.status(401).json(({
                        code: 'EC102',
                        error: 'Missing authorisation token!'
                    }) as CodedError);
                return;
            }    
        } catch (err) {
            res.status(401).json(({
                        code: 'EC103',
                        error: `Error occurred. ${err}`
                    }) as CodedError);
            return;
        }
        next();
    };
};