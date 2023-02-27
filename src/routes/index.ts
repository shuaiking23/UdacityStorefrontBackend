import express from 'express';
import { default as storefront } from './api/storefront';

const routes = express.Router();

routes.get('/', (req, res) => {
    const html = `Storefront Backend API`;
    res.status(200).send(html);
});

routes.use('/storefront', storefront);

export default routes;
