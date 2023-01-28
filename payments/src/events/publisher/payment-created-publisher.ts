import { Publisher, PaymentCreatedEvent, Subjects } from "@parthahuja143/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
};