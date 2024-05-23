import 'dotenv/config';
import {client} from "../redis-client";

const run = async () => {
    // Start the transaction - group command similar like pipeline, but it cannot be undone or reverse
    // MULTI
    // SET name "angga"
    // SET age 12
    // EXEC
    const result = await client.multi()
        .set('name', 'angga')
        .set('age', '12')
        .get('name')
        .exec();
    console.log('result: ', result);

    // WATCH - watch the key until the next transaction is executed, if it changes, cancel the transaction
    // WATCH color
    // MULTI
    // SET color red
    // SET count 5
    // EXEC
    const result2 = await client.watch('color');
    const result3 = await client.multi()
        .set('color', 'red') // error when color is set by other connection before this transaction complete
        .set('count', '5')
        .exec();

    console.log('result watch: ', result2, result3);
};
run();
