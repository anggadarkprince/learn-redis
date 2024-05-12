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
};
run();
