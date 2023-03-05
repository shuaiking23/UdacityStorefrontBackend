import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export type CodedError = {
    code: string;
    error: string;
};

interface JwtPayload {
    id: number,
    user: string
}

export const tokenCheck = (user_id: number | null) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('authy');
        console.log(typeof req);
        console.log(typeof res);
        console.log(typeof next);
        try {
            const bearerHeader = req.headers.authorization;
            if (typeof bearerHeader !== 'undefined') {
                const token = bearerHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.TOKEN_SECRET as string) as JwtPayload;
                // match user_id if not null
                // if user_id = 0, take id from param
                // else skip matching

                const decoded_id: number = decoded.id;
                console.log('authy2');
                if (
                    (user_id != null && decoded_id !== user_id) ||
                    (user_id == 0 && decoded_id != parseInt(req.params.id))
                ) {
                    console.log('authy3');
                    (res as Response).status(401).json({
                        code: 'EC101',
                        error: 'User id does not match!',
                    } as CodedError);
                    return;
                }
                res.locals.userid = decoded.id;
            } else {
                console.log('authy4');
                (res as Response).status(401).json({
                    code: 'EC102',
                    error: 'Missing authorisation token!',
                } as CodedError);
                return;
            }
        } catch (err) {
            console.log('authy5');
            console.log(err);
            (res as Response).status(401).json({
                code: 'EC103',
                error: `Error occurred. ${err}`,
            } as CodedError);
            return;
        }
        next();
    };
};
