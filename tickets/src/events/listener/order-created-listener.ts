import { Listener, OrderCreatedEvent, Subjects } from "@parthahuja143/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName= queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], message: Message){
        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
        
        // if no ticket throw error
        if(!ticket){
            throw new Error('Ticket not found');
        }

        // mark ticket as reserved
        ticket.set({orderId: data.id});

        // save the ticket
        await ticket.save();

        // update version of ticket since it is updated
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
        });

        // ack the message
        message.ack();
    }
};