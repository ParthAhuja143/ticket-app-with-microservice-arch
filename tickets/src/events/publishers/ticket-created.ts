import { Publisher, Subjects, TicketCreatedEvent } from "@parthahuja143/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
};

