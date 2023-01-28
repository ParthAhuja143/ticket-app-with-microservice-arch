import { OrderCreatedEvent, OrderStatus } from "@parthahuja143/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../model/order";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        expiresAt: 'random string',
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 100,
        },
    };

    //@ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return {listener, data, message};
};

it('replicates the order info', async () => {
    const {listener, data, message} = await setup();

    await listener.onMessage(data, message);

    const order = await Order.findById(data.id);

    expect(order!.id).toEqual(data.id);
});

it('acks the message', async () => {
    const {listener, data, message} = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});
