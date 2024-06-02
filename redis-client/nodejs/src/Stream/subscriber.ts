import 'dotenv/config';
import {client} from "../../redis-client";

const run = async () => {
    await client.del('fruits');
    // Stream is message processing that publish data and consumed by other process
    // XREAD STREAMS fruits 1650383447884-0  (read all messages after (but not including) this timestamp)
    // XREAD STREAMS fruits 0-0  (read all message from beginning)
    // XREAD COUNT 3 STREAM fruits 0-0  (read all message from beginning, take 3 messages)
    const result = await client.xRead({key: 'fruits', id: '0-0'}, {COUNT: 2});
    console.log('Stream data:', JSON.stringify(result, null, 2));

    // XREAD BLOCK 3000 STREAMS fruits 0-0  (read and waiting for 3 seconds from given id)
    // XREAD BLOCK 3000 STREAMS fruits $  (read message from right now)
    // XRANGE fruits 12345-0 55555-0 COUNT 5 (read message from Stream from 12345-0 55555-0 (inclusive), different than XREAD (exclusive))
    // XRANGE fruits (12345-0 (55555-0 COUNT 5 (including the message id)

    // Consumer Group
    // XGROUP CREATE fruits fruits-group $ MKSTREAM (create group from Stream "fruits" (create the Stream "fruits" if not exist) and consume from now)
    // XGROUP CREATE fruits fruits-group 0-0 MKSTREAM (start from beginning)
    try {
        await client.xGroupCreate('fruits', 'fruits-group', '$', {MKSTREAM: true});
    } catch (e: any) {
        // another client may have created the group since our `XINFO_GROUPS` command
        if (e.message.includes('BUSYGROUP')) {
            console.log(`Consumer group already exists.`);
        } else if (e.message.includes('NOGROUP')) {
            console.log(`Stream does not exist and MKSTREAM is set to false.`);
        } else {
            throw e;
        }
    }
    // XGROUP CREATCONSUMER fruits fruits-group worker-1
    const worker1 = await client.xGroupCreateConsumer('fruits', 'fruits-group', 'worker-1')
    // XGROUP CREATCONSUMER fruits fruits-group worker-2
    const worker2 = await client.xGroupCreateConsumer('fruits', 'fruits-group', 'worker-2')
    console.log('Create consumers:', worker1, worker2);

    const messageId1 = await client.xAdd('fruits', '*', {color: 'green', name: 'guava'});
    console.log(`Message id: ${messageId1}`);
    const messageId2 = await client.xAdd('fruits', '*', {color: 'purple', name: 'grape'});
    console.log(`Message id: ${messageId2}`);
    const messageId3 = await client.xAdd('fruits', '*', {color: 'red', name: 'apple'});
    console.log(`Message id: ${messageId3}`);

    // XREADGROUP GROUP fruits-group worker-1 COUNT 1 BLOCK 2000 STREAMS fruits 0-0 (get message as it's pretend that I'm a worker-1
    // XREADGROUP GROUP fruits-group worker-1 COUNT 1 BLOCK 2000 STREAMS fruits > (any undelivered message, that not yet processed to other customer members)
     const consumer1 = await client.xReadGroup('fruits-group', 'worker-1', {key: 'fruits', id: '>'}, {COUNT: 1}); // NOACK: false
    console.log('Read group from consumer 1:', JSON.stringify(consumer1, null, 2));
     const consumer2 = await client.xReadGroup('fruits-group', 'worker-2', {key: 'fruits', id: '>'}, {COUNT: 1});
    console.log('Read group from consumer 2:', JSON.stringify(consumer2, null, 2));
    const consumer1again = await client.xReadGroup('fruits-group', 'worker-1', {key: 'fruits', id: '>'}, {COUNT: 1, NOACK: true});
    console.log('Read group from consumer 1 again:', JSON.stringify(consumer1again, null, 2));

    // XINFO GROUPS fruits
    const infoGroup = await client.xInfoGroups('fruits');
    console.log('Info group:', infoGroup);
    // XINFO CONSUMERS fruits fruits-group
    const infoConsumer = await client.xInfoConsumers('fruits', 'fruits-group');
    console.log('Info consumer:', infoConsumer);

    // all message that consumed by worker will be have "pending" state, it should be acknowledged or will be hanging and consider as failed message
    // XACK fruits fruits-group 10-0 (acknowledge the message that received by worker / consumer to mark that the message is successfully processed)
    const acknowledge1 = await client.xAck('fruits', 'fruits-group', messageId1);
    console.log('Acknowledge message 1:', acknowledge1);
    console.log('Info group:', await client.xInfoGroups('fruits'));

    // XAUTOCLAIM fruits fruits-group worker-2 10000 0-0 (claim the messages that have been pending with other works for too long (10 seconds))
    console.log('Sleep for 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));
    const autoClaim = await client.xAutoClaim('fruits', 'fruits-group', 'worker-2', 2000, '0-0');
    console.log('Auto claim from worker 2:', JSON.stringify(autoClaim, null, 2));
    // then acknowledge
    const acknowledge2 = await client.xAck('fruits', 'fruits-group', messageId2);
    console.log('Acknowledge message 2:', acknowledge2);
    console.log('Info group:', await client.xInfoGroups('fruits'));
};
run();

