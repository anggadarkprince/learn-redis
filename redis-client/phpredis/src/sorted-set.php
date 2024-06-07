<?php
require 'vendor/autoload.php';

use Angga\Phpredis\RedisClient;

// Create a new Redis client
$client = RedisClient::getClient();

// sorted set is a set with score, and it keeps sorted by redis, we can get or manipulate set by its score
// tabulating the most or the least of a collection of hashes, eg: product ratings, total purchases of product, most reviewed book
// creating relationship between records, sorted by some criteria

// ZADD products 45 monitor
$result1 = $client->zadd('products', 45, 'monitor');
$result2 = $client->zadd('products', 20, 'mouse');
$result3 = $client->zadd('products', 10, 'keyboard');
$result4 = $client->zadd('products', 65,'cpu');

// ZSCORE products monitor
$monitorScore = $client->zscore('products', 'monitor');
d('Monitor result & score', $result1, $result2, $result3, $result4, $monitorScore); // score monitor 45

// ZREM products monitor
$monitorRemoved = $client->zrem('products', 'monitor');
d('Monitor remove & score', $monitorRemoved, $client->zscore('products', 'monitor'));

// ZCARD products
$productTotal = $client->zcard('products');
d('Total product', $productTotal); // 3 (mouse, keyboard, cpu)

// ZCOUNT products 0 50   (get member that has score 0 <= products <= 50)
$totalInRange = $client->zcount('products', 0, 50);
d('Product with score 0 - 50', $totalInRange); // 2 (mouse, keyboard)

// ZCOUNT products (0 (50  (find product 0 < products < 50)
$totalInRangeBellow = $client->zCount('products', 0, '(20');
d('Product with score 0 - 19', $totalInRangeBellow); // 1 (keyboard)

// ZCOUNT products -inf +inf   (find product -Infinity < products < Infinity)
$totalInRange1Side = $client->zcount('products', 15, '+inf');
d('Product with score 15 - Infinity', $totalInRange1Side); // 2 (mouse, cpu)

// ZPOPMAX products
$client->zadd('products', 100, 'tws');
$popMax = $client->zpopmax('products', 1);
d('Remove max product', $popMax);

// ZPOPMIN products
$client->zadd('products', 5, 'hp');
$popMin = $client->zpopmin('products', 1);
d('Remove max product', $popMin);

// ZPOPMIN products 2  (remove 2 lowest score member, and return it)
//$productMin = $client->zPopMinCount('products', 2); // zPopMin('products')
//d('Product min', $productMin); // keyboard: 10, mouse: 20

// ZPOPMAX products 2 (remove 2 highest score member, and return in)
// return removed item first, and try to run the command
//$client->zadd('products', 20, 'mouse');
//$client->zadd('products', 10, 'keyboard');
//$productMax = $client->zPopMaxCount('products', 2); // zPopMax('products')
//d('Product max', $productMax); // mouse: 20, cpu: 65

// return removed item
$client->zadd('products', 20, 'mouse');
$client->zadd('products', 65, 'cpu');

// ZINCRBY products 15 keyboard  (add score by 15 of keyboard)
$keyboardResult = $client->zincrby('products', 15, 'keyboard');
d('Keyboard score', $keyboardResult); // 25 = 10 + 15

// ZRANGE products 0 2
$rangeIndex = $client->zrange('products', 1, 2);
d('Product range index', $rangeIndex); // keyboard, cpu

// ZRANGE products 10 50 BYSCORE WITHSCORES  (min max by score value, and include score information as result)
//$rangeScore = $client->zRangeWithScores('products', 10, 50, ['BY' => 'SCORE']); // zRangeByScoreWithScores
//d('Product range score', $rangeScore); // mouse: 20, keyboard: 25

// ZRANGE products -inf (65 BYSCORE WITHSCORES LIMIT 1 2  (get member with score < 65 by score value, take 2 offset 1)
//$rangeScore2 = $client->zRangeWithScores('products', '-inf', '(65', ['BY' => 'SCORE', 'LIMIT' => ['offset' => 1, 'count' => 2]]); // zRangeByScoreWithScores
//d('Product range score2', $rangeScore2); // keyboard: 25

// ZRANGE products 0 1 REV  (get member index 0-1 reverse the sorted set, limit 1 count 2)
//$rangeScoreRev = $client->zRangeWithScores('products', 0, 1, ['REV' => true]);
//d('Product range reverse', $rangeScoreRev); // cpu: 65, keyboard: 25
