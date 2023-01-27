import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('returns a 404 if no order is found', async () => {

    await request(app)
    .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set('Cookie', global.signin())
    .expect(404);
    
});

it('returns 401 if order user', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    const user = global.signin();

    const {body: order} = await request(app)
                    .post('/api/orders')
                    .set('Cookie', user)
                    .send({ ticketId: ticket.id })
                    .expect(201);

    await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .expect(401);
});

it('fetches the order', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    const user = global.signin();

    const {body: order} = await request(app)
                    .post('/api/orders')
                    .set('Cookie', user)
                    .send({ ticketId: ticket.id })
                    .expect(201);

    const { body: fetchOrder} = await request(app)
                                .get(`/api/orders/${order.id}`)
                                .set('Cookie', user)
                                .expect(200);

    expect(fetchOrder.id).toEqual(order.id);
});