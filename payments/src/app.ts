import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError } from '@parthahuja143/common';
import { createTicketRouter } from './routes/create-ticket';
import { getTicketRouter } from './routes/get-ticket';
import { getAllTicketsRouter } from './routes/get-tickets';
import { updateTicketRouter } from './routes/update-ticket';
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

app.use(createTicketRouter);
app.use(getTicketRouter);
app.use(getAllTicketsRouter);
app.use(updateTicketRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
