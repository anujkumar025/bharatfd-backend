import dotenv from "dotenv";
import { createClient } from 'redis';

dotenv.config();

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)

