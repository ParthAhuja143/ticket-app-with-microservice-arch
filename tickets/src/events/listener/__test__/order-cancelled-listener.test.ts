import { OrderCancelledEvent } from "@parthahuja143/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 30,
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    ticket.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: ticket.orderId!,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    //@ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return {ticket, message, listener, data}
};

it('updates the ticket, publishes an event, and acks the message', async () => {
    const {message, data, listener, ticket} = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(message.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})