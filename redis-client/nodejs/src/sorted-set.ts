import 'dotenv/config';
import {client} from "../redis-client";

const run = async () => {
    // sorted set is a set with score, and it keeps sorted by redis, we can get or manipulate set by its score
    // tabulating the most or the least of a collection of hashes, eg: product ratings, total purchases of product, most reviewed book
    // creating relationship between records, sorted by some criteria

    // ZADD products 45 monitor
    const result1 = await client.zAdd('products', {score: 45, value: 'monitor'});
    const result2 = await client.zAdd('products', {score: 20, value: 'mouse'});
    const result3 = await client.zAdd('products', {score: 10, value: 'keyboard'});
    const result4 = await client.zAdd('products', {score: 65, value: 'cpu'});

    // ZSCORE products monitor
    const monitorScore = await client.zScore('products', 'monitor');
    console.log('Monitor result & score', result1, result2, result3, result4, monitorScore); // score monitor 45

    // ZREM products monitor
    const monitorRemoved = await client.zRem('products', 'monitor');
    console.log('Monitor remove & score', monitorRemoved, await client.zScore('products', 'monitor'));

    // ZCARD products
    const productTotal = await client.zCard('products');
    console.log('Total product', productTotal); // 3 (mouse, keyboard, cpu)

    // ZCOUNT products 0 50   (get member that has score 0 <= products <= 50)
    const totalInRange = await client.zCount('products', 0, 50);
    console.log('Product with score 0 - 50', totalInRange); // 2 (mouse, keyboard)

    // ZCOUNT products (0 (50  (find product 0 < products < 50)
    const totalInRangeBellow = await client.zCount('products', 0, '(20');
    console.log('Product with score 0 - 19', totalInRangeBellow); // 1 (keyboard)

    // ZCOUNT products -inf +inf   (find product -Infinity < products < Infinity)
    const totalInRange1Side = await client.zCount('products', 15, '+inf');
    console.log('Product with score 15 - Infinity', totalInRange1Side); // 2 (mouse, cpu)

    // ZPOPMIN products 2  (remove 2 lowest score member, and return it)
    const productMin = await client.zPopMinCount('products', 2); // zPopMin('products')
    console.log('Product min', productMin); // keyboard: 10, mouse: 20

    // ZPOPMAX products 2 (remove 2 highest score member, and return in)
    // return removed item first, and try to run the command
    await client.zAdd('products', {score: 20, value: 'mouse'});
    await client.zAdd('products', {score: 10, value: 'keyboard'});
    const productMax = await client.zPopMaxCount('products', 2); // zPopMax('products')
    console.log('Product max', productMax); // mouse: 20, cpu: 65

    // return removed item
    await client.zAdd('products', {score: 20, value: 'mouse'});
    await client.zAdd('products', {score: 65, value: 'cpu'});

    // ZINCRBY products 15 keyboard  (add score by 15 of keyboard)
    const keyboardResult = await client.zIncrBy('products', 15, 'keyboard');
    console.log('Keyboard score', keyboardResult); // 25 = 10 + 15

    // ZRANGE products 0 2
    const rangeIndex = await client.zRange('products', 1, 2);
    console.log('Product range index', rangeIndex); // keyboard, cpu

    // ZRANGE products 10 50 BYSCORE WITHSCORES  (min max by score value, and include score information as result)
    const rangeScore = await client.zRangeWithScores('products', 10, 50, {BY: 'SCORE'}); // zRangeByScoreWithScores
    console.log('Product range score', rangeScore); // mouse: 20, keyboard: 25

    // ZRANGE products -inf (65 BYSCORE WITHSCORES LIMIT 1 2  (get member with score < 65 by score value, take 2 offset 1)
    const rangeScore2 = await client.zRangeWithScores('products', '-inf', '(65', {BY: 'SCORE', LIMIT: {offset: 1, count: 2}}); // zRangeByScoreWithScores
    console.log('Product range score2', rangeScore2); // keyboard: 25

    // ZRANGE products 0 1 REV  (get member index 0-1 reverse the sorted set, limit 1 count 2)
    const rangeScoreRev = await client.zRangeWithScores('products', 0, 1, {REV: true});
    console.log('Product range reverse', rangeScoreRev); // cpu: 65, keyboard: 25
};
run();
