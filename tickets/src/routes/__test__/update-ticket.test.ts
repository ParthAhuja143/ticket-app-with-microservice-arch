import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

it('returns 404 if the provided id doesn\'t exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
        title: 'concert',
        price: 10
    })
    .expect(404);
});

it('ruturns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .send({
        title: 'concert',
        price: 20
    })
    .expect(401);
});

it('returns a 401 if the user doesn\'t own the ticket', async () => {
    const response = await request(app)
                    .post('/api/tickets')
                    .set('Cookie', global.signin())
                    .send({
                        title: 'concert',
                        price: 20
                    })
                    .expect(201);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'concert',
        price: 30
    })
    .expect(401);

    const ticket = await request(app)
                    .get(`/api/tickets/${response.body.id}`)
                    .send()
                    .expect(200);
    
    const { body } = ticket;

    const { price, title } = body;

    expect(price).toEqual(20);
    expect(title).toEqual('concert');
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app)
                    .post('/api/tickets')
                    .set('Cookie', cookie)
                    .send({
                        title: 'concert',
                        price: 20
                    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: '',
        price: 20
    })
    expect(400);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'concert',
        price: -20
    })
    expect(400);

});

it('updates the ticket with valid inputs', async () => {
    const cookie = global.signin();

    const response = await request(app)
                    .post('/api/tickets')
                    .set('Cookie', cookie)
                    .send({
                        title: 'concert',
                        price: 20
                    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'new concert',
        price: 30
    })
    .expect(200);

    const ticket = await request(app)
                    .get(`/api/tickets/${response.body.id}`)
                    .send()
                    .expect(200);

    const { body } = ticket;

    const { price, title } = body;

    expect(price).toEqual(30);
    expect(title).toEqual('new concert');

});