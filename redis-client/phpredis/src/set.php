<?php
require 'vendor/autoload.php';

use Angga\Phpredis\RedisClient;

// Create a new Redis client
$client = RedisClient::getClient();

$client->del('cars');

// SADD cars honda toyota mazda
$result1 = $client->sadd('cars', 'honda', 'toyota');
$result2 = $client->sadd('cars', 'mazda'); // result 1
$result3 = $client->sadd('cars', 'mazda'); // result 0
d('Result set of cars:', $result1, $result2, $result3);

$carsData = $client->smembers('cars');
d('Cars', $carsData);

// SISMEMBER cars honda (for large sets, use SSCAN instead)
$isMember1 = $client->sismember('cars', 'honda');
$isMember2 = $client->sismember('cars', 'ford');
d('Is member of cars:', $isMember1, $isMember2);

$client->sadd('cars2', 'hyundai');
$client->sadd('cars2', 'toyota');

// SUNION cars cars2
$unionCars = $client->sunion(['cars', 'cars2']);
d('Union:', $unionCars); // honda, toyota, mazda, hyundai

// SINTER cars cars2
$interCars = $client->sinter(['cars', 'cars2']);
d('Intersection:', $interCars); // toyota

// SDIFF cars cars2
$diffCars = $client->sdiff(['cars', 'cars2']);
d('Diff cars:', $diffCars); // honda, mazda

// SINTERSTORE interCar car car2 (store result of diff into another set)
$sInterResult = $client->sinterstore('interCar', ['cars', 'cars2']);
$interMember = $client->smembers('interCar');
d('Intersection store result:', $sInterResult, $interCars); // toyota

// SCARD cars (return length of members)
$total = $client->scard('cars');
d('Total cars:', $total);

// SSCAN cars 0 COUNT 10 (result all member but result one-by-one with cursor)
$resultCarsCursor = $client->sscan('cars', 0, ['COUNT' => 2]);
d('Result cars cursor:', $resultCarsCursor);

// SREM cars (remove element of cars)
$resultRem = $client->srem('cars', 'toyota');
$carsDataAfterRemove = $client->smembers('cars');
d('Remove cars member:', $resultRem, $carsDataAfterRemove);

// https://redis.io/docs/latest/commands/set/