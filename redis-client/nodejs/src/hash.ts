import 'dotenv/config';
import {client} from "../redis-client";

const run = async () => {
    // HSET car1 color red year 1950
    await client.hSet('car1', {
        color: 'red',
        year: 1950
    });
    await client.hSet('person', {
        id: 1,
        name: 'Angga Ari Wijaya',
        city: 'Surabaya',
    });

    // HGET car1 color
    const car1Color = await client.hGet('car1', 'color');
    console.log(car1Color);

    // HGETALL person
    const person = await client.hGetAll('person');
    console.log(person);
};
run();
