import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import orderRoutes from './handlers/orders';
import productRoutes from './handlers/products';
import userRoutes from './handlers/users';

const app: express.Application = express();
const routes = express.Router();
const address: string = '0.0.0.0:3000';

app.use(bodyParser.json());
app.use('/api/v1', routes);

routes.get('/', (req: Request, res: Response) => {
    res.send('Storefront API');
});

routes.use('/users', userRoutes);
routes.use('/products', productRoutes);
routes.use('/orders', orderRoutes);

app.listen(3000, () => {
    console.log(`starting app on: ${address}`);
});
