import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@parthahuja143/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth,[
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {

    const ticket = await Ticket.findById(req.params.id);

    if(!ticket){
        throw new NotFoundError();
    }

    if(ticket.userId !== req.currentUser!.id){
        throw new NotAuthorizedError();
    }

    // ticket is being ordered
    if(ticket.orderId){
        throw new BadRequestError('Ticket is reserved, can not edit');
    }

    ticket.set({
        title: req.body.title,
        price: req.body.price
    })

    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
    });
    
    res.send(ticket);
});

export { router as updateTicketRouter };