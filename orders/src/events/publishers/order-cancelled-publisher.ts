import { OrderCancelledEvent, Publisher, Subjects } from "@parthahuja143/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
};