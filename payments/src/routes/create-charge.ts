import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@parthahuja143/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-publisher';
import { Order } from '../model/order';
import { Payment } from '../model/payment';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post('/api/payments', 
    requireAuth,
    [
        body('token').not().isEmpty(),
        body('orderId').not().isEmail()
    ]
    ,validateRequest,
    async (req: Request, res: Response) => {
        const {token, orderId} = req.body;

        const order = await Order.findById(orderId);

        if(!order){
            throw new NotFoundError();
        }

        if(order.userId !== req.currentUser!.id){
            throw new NotAuthorizedError();
        }

        if(order.status === OrderStatus.Cancelled){
            throw new BadRequestError('Order is cancelled');
        }

        const charge = await stripe.charges.create({
            currency: 'inr',
            amount: order.price*100,
            source: token,
            description: 'Payment Service - ticketing'
        });

        const payment = Payment.build({
            orderId: orderId,
            stripeId: charge.id,
        });
        await payment.save();
        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(201).send({id: payment.id});
    });

export {router as createChargeRouter};