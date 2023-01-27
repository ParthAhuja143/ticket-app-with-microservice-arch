import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if order is not found', async () => {
    await request(app)
    .delete(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set('Cookie', global.signin())
    .expect(404);
});

it('returns 401 if user is not equal to order.userId', async () => {
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
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .expect(401);
});

it('marks the order cancelled successfully', async () => {
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
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

    const updateOrder = await Order.findById(order.id);

    expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
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
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

    const updateOrder = await Order.findById(order.id);

    expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})