import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors';
import orderRoutes from './handlers/orders';
import productRoutes from './handlers/products';
import userRoutes from './handlers/users';

const app: express.Application = express();
const routes = express.Router();
const address: string = '0.0.0.0:3000';

app.use(bodyParser.json());
app.use(multer().array())
//app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', routes);

app.get('*', function (req, res) {
  res.status(404).send('Page Not Found!');
});

routes.get('/', (req: Request, res: Response) => {
    res.send('Storefront API');
});

routes.use('/users', userRoutes);
routes.use('/products', productRoutes);
routes.use('/orders', orderRoutes);

app.listen(3000, () => {
    console.log(`starting app on: ${address}`);
});
