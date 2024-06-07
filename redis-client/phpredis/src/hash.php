<?php
require 'vendor/autoload.php';

use Angga\Phpredis\RedisClient;

// Create a new Redis client
$client = RedisClient::getClient();

// HSET car1 color red year 1950
// HSETNX myhash field "Hello" (set if not exist)
$resultCarColor = $client->hset('car1', 'color', 'red');
$resultCarYear = $client->hset('car1', 'year', 1987);
d('Set car1:', $resultCarColor, $resultCarYear);

$resultPersonId = $client->hset('person', 'id', 1);
$resultPersonName = $client->hset('person', 'name', 'Angga Ari Wijaya');
$resultPersonCity = $client->hset('person', 'city', 'Surabaya');
d('Person:', $resultPersonId, $resultPersonName, $resultCarCity);

// HGET car1 color
$car1Color = $client->hget('car1', 'color');
$car1Year = $client->hget('car1', 'year');
d('Car 1:', $car1Color, $car1Year);

// HGETALL person
$person = $client->hgetall('person');
d('Person data:', $person);

// HINCR car1 year 5
$incr = $client->hincrby('car1', 'year', 5);
d('Car year +5:', $incr);

// HEXISTS car1 color
$exists = $client->hexists('car1', 'year');
d('Car has color attribute:', $exists);

// HDEL car1 year
$del = $client->hdel('car1', 'year');
d('Car data after delete year:', $client->hgetall('car1'));

// HKEYS person
$keys = $client->hkeys('person');
d('Person attr:', $keys);

// HEXPIRE person 20 NX FIELDS 2 name city (set expiration if not exists (expiration) in seconds for attribute)

// https://redis.io/docs/latest/commands/hexpire/