import { OrderCancelledEvent, OrderStatus } from "@parthahuja143/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../model/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        },
    };

    //@ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return {listener, message, data, order};
};

it('updates the status of the order', async () => {
    const {listener, message, data, order} = await setup();

    await listener.onMessage(data, message);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const {listener, message, data, order} = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

