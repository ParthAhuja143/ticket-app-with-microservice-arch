import { ExpirationCompleteEvent, Publisher, Subjects } from "@parthahuja143/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
};