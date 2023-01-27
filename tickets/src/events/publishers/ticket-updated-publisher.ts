import { Publisher, Subjects, TicketUpdatedEvent } from "@parthahuja143/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
};