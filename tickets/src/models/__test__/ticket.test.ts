import { Ticket } from "../ticket"

it('implement optimistic concurrency control', async () => {
    //create instance of a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '123'
    });

    //save ticket
    await ticket.save();

    //fetch ticket
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    //make two changes to ticket
    firstInstance!.set({price: 1000});
    secondInstance!.set({price: 100000});

    //save first fetch ticket
    await firstInstance!.save();

    //save second fetch ticket and expect an error
    try {
        await secondInstance!.save();
    } catch (error) {
        return;
    }

    throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '123'
    });

    //save ticket
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});