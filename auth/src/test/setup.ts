import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

declare global {
  var signin: () => Promise<string[]>;
}

let mongo: MongoMemoryServer ;
beforeAll(async () => {
  process.env.JWT_KEY = 'secret';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const authRes = await request(app)
    .post('/api/users/signup')
    .send({
        email,
        password
    })
    .expect(201);

    return authRes.get('Set-Cookie');
}
