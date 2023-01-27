import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError } from '@parthahuja143/common';
import { getAllOrdersRouter } from './routes/get-orders';
import { getOrderRouter } from './routes/get-order';
import { createOrderRouter } from './routes/create-order';
import { deleteOrderRouter } from './routes/delete-order';

var cors = require('cors')

const app = express();
app.set('trust proxy', true);
app.use(cors())
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test"
  })
);
app.use(currentUser);

app.use(getAllOrdersRouter);
app.use(getOrderRouter);
app.use(createOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
