import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors';
import orderRoutes from './handlers/orders';
import productRoutes from './handlers/products';
import userRoutes from './handlers/users';
import * as cfg from './utilities/appConfigs';

const app: express.Application = express();
const routes = express.Router();
const address: string = cfg.FULLHOST;

app.use(cors());
app.use(bodyParser.json());
app.use(multer);
//app.use(express.urlencoded({ extended: true }));
app.use(cfg.URL_CONTEXT, routes);

/*
app.get('*', (req: Request, res: Response) => {
    res.status(404).send('Page Not Found!');
});
*/

routes.get('/', (req: Request, res: Response) => {
    res.send('Storefront API');
    return;
});

routes.use('/users', userRoutes);
routes.use('/products', productRoutes);
routes.use('/orders', orderRoutes);

app.listen(3000, () => {
    console.log(`starting app on: ${address}`);
});

export default routes;
