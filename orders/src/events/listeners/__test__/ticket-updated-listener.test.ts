import { TicketUpdatedEvent } from "@parthahuja143/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"

const setup = async () => {

    // create listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    // create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version+1,
        title: 'CONCERT',
        price: 13343,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // create a fake message object
    //@ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    //return all
    return {listener, message, data, ticket};
};

it('finds, updates and saves the ticket', async () => {
    const {data, listener, message, ticket} = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const {message, data, ticket, listener} = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
    const {message, data, ticket, listener} = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, message);
    } catch (error) {
        
    }
    expect(message.ack).not.toHaveBeenCalled();
});