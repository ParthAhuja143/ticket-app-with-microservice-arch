import request from 'supertest';
import { app } from '../../app';

it('fails when a email does not exist', async () => {
  await request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: 'xfcvdsvvvdf'
  })
  .expect(400);
});

it('fails when incorrect password is given', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

    await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'pasord'
    })
    .expect(400);
});

it('returns 200 on successful signin', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

    const response = await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
})