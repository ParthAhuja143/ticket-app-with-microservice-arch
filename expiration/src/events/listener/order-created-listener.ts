import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@parthahuja143/common"
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queueGroupName";


export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        const delayInMs = new Date(data.expiresAt).getTime() - new Date().getTime();

        // add to queue
        await expirationQueue.add({
            orderId: data.id
        }, {
            delay: delayInMs
        });

        msg.ack();
    }
}