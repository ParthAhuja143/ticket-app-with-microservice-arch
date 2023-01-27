import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@parthahuja143/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from 'mongoose';
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders',requireAuth, [
    body('ticketId').not().isEmpty().custom((input: string) => mongoose.Types.ObjectId.isValid(input)).withMessage("TicketId must be provided")
], validateRequest,
 async (req: Request, res: Response) => {
    // Find the ticket being ordered
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if(!ticket){
        throw new NotFoundError();
    }

    // Make sure the ticket is not reserved
    const isReserved = await ticket.isReserved()

    if(isReserved){
        throw new BadRequestError('Ticket is already reserved');
    }

    // Calc expiration time
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
    });

    await order.save();

    // emit event
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        expiresAt: order.expiresAt.toISOString(),
        userId: order.userId,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    });

    res.status(201).send(order);
});

export {router as createOrderRouter};