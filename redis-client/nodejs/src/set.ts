import 'dotenv/config';
import {client} from "../redis-client";

const run = async () => {
    // SADD cars honda toyota mazda
    const result1 = await client.sAdd('cars', 'honda');
    const result2 = await client.sAdd('cars', 'toyota');
    const result3 = await client.sAdd('cars', 'mazda'); // result 1
    const result4 = await client.sAdd('cars', 'mazda'); // result 0
    const carsData = await client.sMembers('cars');

    console.log('Result set of cars2', result1, result2, result3, result4, carsData);

    const result11 = await client.sAdd('cars2', 'hyundai');
    const result22 = await client.sAdd('cars2', 'toyota');

    console.log('Result set of cars2', result11, result22);

    // SISMEMBER cars honda (for large sets, use SSCAN instead)
    const isMember1 = await client.sIsMember('cars', 'honda');
    const isMember2 = await client.sIsMember('cars', 'ford');
    console.log('Is member of cars', isMember1, isMember2);

    // SUNION cars cars2
    const unionCars = await client.sUnion(['cars', 'cars2']);
    console.log('Union', unionCars); // honda, toyota, mazda, hyundai

    // SINTER cars cars2
    const interCars = await client.sInter(['cars', 'cars2']);
    console.log('Intersection', interCars); // toyota

    // SDIFF cars cars2
    const diffCars = await client.sDiff(['cars', 'cars2']);
    console.log('Diff cars', diffCars); // honda, toyota

    // SINTERSTORE interCar car car2 (store result of diff into another set)
    const sInterResult = await client.sInterStore('interCar', ['cars', 'cars2']);
    const interCar = await client.sMembers('interCar');
    console.log('Intersection store result', sInterResult, interCar); // toyota

    // SCARD cars (return length of members)
    const total = await client.sCard('cars');
    console.log('Total cars', total); // 3

    // SSCAN cars 0 COUNT 10 (result all member but result one-by-one with cursor)
    const resultCarsCursor = await client.sScan('cars', 0, {COUNT: 2});
    console.log('Result cars cursor', resultCarsCursor);

    // SREM cars (remove element of cars)
    const resultRem = await client.sRem('cars', 'toyota');
    const carsDataAfterRemove = await client.sMembers('cars');
    console.log('Remove cars member', resultRem, carsDataAfterRemove); // honda, mazda

};
run();
