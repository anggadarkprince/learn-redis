import 'dotenv/config';
import {client} from "../../redis-client";

const run = async () => {
    await client.del('restaurants');

    // JSON.SET profiles $ '"Hyperion"'
    // JSON.SET profiles . '"Hyperion"'

    // Using $ Notation: When you use $ notation, you are specifying that the entire JSON object should be replaced with the new value.
    // In this example, if profiles is a JSON object and you have a nested key like {"profiles": {"name": "John"}},
    // using JSON.SET profiles . '"Hyperion"' would change the value of profiles to {"name": "John", "Hyperion": <value>}.

    // JSON.SET restaurants:1 $ '
    // {
    //    "name: "Tacos Mi 45",
    //    "is_open": true,
    //    "menu": [
    //        {"name": "Burrito", "price": 11.5},
    //        {"name": "Taco", "price": 3.5},
    //        {"name": "Quesadilla", "price": 6.1}
    //    ]
    //
    const restaurant1Set = await client.json.set('restaurants:1', '$', {
        name: 'Tacos Mi 45',
        is_open: true,
        location: {
            address: '',
        },
        wait_time: 0,
        menu: [
            {name: "Burrito", price: 11.5},
            {name: "Taco", price: 3.5},
            {name: "Quesadilla", price: 6.1}
        ]
    });
    console.log('Set restaurant 1:', restaurant1Set);

    // JSON.GET restaurants:1 .
    const restaurant1 = await client.json.get('restaurants:1');
    console.log('Data restaurant 1:', JSON.stringify(restaurant1, null, 2));

    // JSON.GET restaurants:1 .menu
    // JSON.GET restaurants:1 .menu[0].price
    const restaurant1Menu = await client.json.get('restaurants:1', {path: '$.menu'});
    console.log('Data restaurant 1 menu:', JSON.stringify(restaurant1Menu, null, 2));
    const restaurant1MenuPrice = await client.json.get('restaurants:1', {path: '$.menu[0].price'});
    console.log('Data restaurant 1 price:', restaurant1MenuPrice);

    const updatedContact = await client.json.set('restaurants:1', '$.contact', '05627234244');
    console.log('Data update contact:', updatedContact, JSON.stringify(await client.json.get('restaurants:1'), null, 2));

    // JSON.SET restaurants:1 .location.address "\"145 1st ave, oakland, CA 3332\""
    const updateAddress = await client.json.set('restaurants:1', '$.location.address', '145 1st ave, oakland, CA 3332');
    console.log('Data update address:', updateAddress, JSON.stringify(await client.json.get('restaurants:1'), null, 2));

    // JSON.ARRAPPEND restaurants:1 .menu '{"name": "Torta", "price": 4.5}'
    console.log('Append menu', await client.json.arrAppend('restaurants:1', '$.menu', {"name": "Torta", "price": 4.5}))

    // JSON.ARRLEN restaurants .menu
    console.log('Total menu:', await client.json.arrLen('restaurants:1', '$.menu'))

    // JSON.ARRPOP restaurants:1 .menu [0]
    // JSON.NUMINCRBY restaurants:1 .wait_time 10
    await client.json.numIncrBy('restaurants:1', '$.wait_time', 10)

    console.log('Current data:', JSON.stringify(await client.json.get('restaurants:1'), null, 2));
};
run();
