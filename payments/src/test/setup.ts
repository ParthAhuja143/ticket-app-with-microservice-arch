import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import jwt from 'jsonwebtoken'

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

let mongo: MongoMemoryServer ;
beforeAll(async () => {
  process.env.JWT_KEY = 'secret';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
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

global.signin = (id ?: string) => {
  // build jwt payload
  const payload = {
    email: 'test@test.com',
    id: id || new mongoose.Types.ObjectId().toHexString()
  };

  // create jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session obj
  const session = {
    jwt: token
  };

  // turn session into json
  const sessionJSON = JSON.stringify(session);

  // take json and convert to base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
}
