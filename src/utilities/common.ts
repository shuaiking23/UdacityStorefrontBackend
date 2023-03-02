import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const token_check = (
    authorizationHeader: string,
    user_id: number | null
): string => {
    try {
        const token = authorizationHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        if (user_id != null && decoded.id !== user_id) {
            throw new Error('User id does not match!');
        }
    } catch (err) {
        return err;
    }
    return 'OK';
};
