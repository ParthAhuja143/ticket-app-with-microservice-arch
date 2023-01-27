import { OrderCreatedEvent, Publisher, Subjects } from "@parthahuja143/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
};