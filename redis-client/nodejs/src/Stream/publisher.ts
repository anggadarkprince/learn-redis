import 'dotenv/config';
import {client} from "../../redis-client";

const run = async () => {
    await client.del('fruits');

    // Stream is message processing that publish data and consumed by other process
    // XADD fruits * color red name strawberry (The ID is automatically generated if an asterisk (*) is passed as the id argument)
    // XADD fruits 1000-1 color yellow name banana (The ID is the one automatically generated if an asterisk (*) is passed as the id argument)
    const messageId1 = await client.xAdd('fruits', '*', {
        color: 'red',
        name: 'strawberry'
    });
    console.log(`Message id: ${messageId1}`);

    const nextId = +(messageId1.split('-')[0]) + 100;
    const messageId2 = await client.xAdd('fruits', nextId.toString(), { // id should larger than the message before
        color: 'yellow',
        name: 'banana'
    });
    console.log(`Message id: ${messageId2}`);

    const messageId3 = await client.xAdd('fruits', '*', {
        color: 'orange',
        name: 'orange'
    });
    console.log(`Message id: ${messageId3}`);

    const messageId4 = await client.xAdd('fruits', '*', {
        color: 'red',
        name: 'apple'
    });
    console.log(`Message id: ${messageId4}`);
};
run();
