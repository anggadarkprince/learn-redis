import 'dotenv/config';
import {client} from "../redis-client";

const run = async () => {
    // Hyper log log similar to set but more optimum to keeping track the uniqueness (only use 12kb whatever items are added with error of 0.81% and max 2^64 items)
    // PFADD vegetables celery  (return 1 if first added, 0 if already exit)
    // PFADD vegetables potato
    // PFCOUNT vegetables (return 2 - total of element)
    const inserted1 = await client.pfAdd('product1#likes', 'angga');
    const inserted2 = await client.pfAdd('product1#likes', 'ari');
    console.log(await client.pfCount('product1#likes'));
};
run();
