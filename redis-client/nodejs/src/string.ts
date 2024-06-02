import 'dotenv/config';
import {client} from "../redis-client";

const run = async () => {
    // String is the most basic redis data structure (key-value pair)
    // SET name "angga"
    // SET age 12
    const nameResult = await client.set('name', 'angga');
    const ageResult = await client.set('age', 12);
    console.log(`${nameResult} - ${ageResult}`);
    console.log(await client.get('name'));
    console.log(await client.get('age'));


    console.log('Remember me before?', await client.get('remember_me'));
    const rememberMe = await client.set('remember_me', '1', {
        EX: 3600 * 24 * 7, // expired in seconds
        //PX: 3600 * 24 * 7 * 1000,   // Set the specified expire time, in milliseconds.
        //EXAT: Date.now() + 60, // Set the specified Unix time at which the key will expire, in seconds.
        //PXAT: Date.now() + 6000, // Set the specified Unix time at which the key will expire, in milliseconds.
        //KEEPTTL: true, // Retain the TTL previously set on the key.

        //NX: true, // Only set the key if it does not already exist.
        //XX: true, // Only set the key if it already exists.

        GET: true, // Return the old value stored at key, or nil when key did not exist.
    });

    console.log('Remember me', rememberMe);
};
run();
