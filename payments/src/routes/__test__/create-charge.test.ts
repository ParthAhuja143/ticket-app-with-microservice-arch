import { OrderStatus } from '@parthahuja143/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../model/order';
import { stripe } from '../../stripe';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'dvdfbdfbd',
        orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0, 
        userId: new mongoose.Types.ObjectId().toHexString(), 
        price: 100, 
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'dvdfbdfbd',
        orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0, 
        userId: userId,
        price: 100, 
        status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'dvdfbdfbd',
        orderId: order.id,
    })
    .expect(400);
});

/*
it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0, 
        userId: userId,
        price: 100, 
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'tok_visa',
        orderId: order.id,
    })
    .expect(201);

    ONLY FOR REALISTIC TESTING

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(100 * 100);
    expect(chargeOptions.currency).toEqual('inr');
});
*/

/*
Create a STRIPE_KEY
and remove stripe.ts in __mocks__ to run this realisitc test

it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random()*100000);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0, 
        userId: userId,
        price: price, 
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'tok_visa',
        orderId: order.id,
    })
    .expect(201);

    const stripeCharges = await stripe.charges.list({
        limit: 50
    });

    const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100);

    expect(stripeCharge).toBeDefined();

    const payment = await Payment.findone({
        orderId: order.id,
        stripeId: stripeCharge.id,
    });

    expect(payment).not.toBeNull();
});
*/