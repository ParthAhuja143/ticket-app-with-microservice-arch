import { OrderCreatedEvent, OrderStatus } from '@parthahuja143/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
    // create instance of listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    //create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    // create the fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'random string',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    };

    //@ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    return {listener, ticket, message, data};
};

it('sets the orderId of the ticket', async () => {
    const {data, message, ticket, listener} = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const {data, message, ticket, listener} = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

it('publishes a ticket update event', async () => {
    const {data, message, ticket, listener} = await setup();

    await listener.onMessage(data, message);

    // we call publish to publish the ticket:updated event
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // event data
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatedData.orderId);
});