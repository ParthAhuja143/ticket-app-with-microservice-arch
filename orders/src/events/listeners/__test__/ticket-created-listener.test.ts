import { TicketCreatedEvent } from "@parthahuja143/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";

const setup = async () => {
    // creates an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // create fake data event
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };

    // create a fake message object
    //@ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    return {listener, data, message};
}

it('creates and saves a ticket', async () => {

    const {listener, data, message} = await setup();

    // call onMessage function with data and message function
    await listener.onMessage(data, message);

    // write assertions to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {

    const {listener, data, message} = await setup();

    // call onMessage function with data and message function
    await listener.onMessage(data, message);

    // write assertions for acknowledging the message
    expect(message.ack).toHaveBeenCalled();
})