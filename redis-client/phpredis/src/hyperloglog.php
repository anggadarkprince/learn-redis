<?php
require 'vendor/autoload.php';

use Angga\Phpredis\RedisClient;

// Create a new Redis client
$client = RedisClient::getClient();

// Hyper log log similar to set but more optimum to keeping track the uniqueness (only use 12kb whatever items are added with error of 0.81% and max 2^64 items)
// PFADD vegetables celery  (return 1 if first added, 0 if already exit)
// PFADD vegetables potato
// PFCOUNT vegetables (return 2 - total of element)
$client->pfadd('product1:likes', 'angga');
$client->pfadd('product1:likes', 'ari');
$client->pfadd('product1:likes', 'ari');
$value = $client->pfcount('product1:likes');
d('Total unique like', $value);

// PFADD hll1 foo bar zap a
// PFADD hll2 a b c foo
// PFMERGE hll3 hll1 hll2
// PFCOUNT hll3 (return 6)
$client->pfadd('product2:likes', 'angga');
$client->pfadd('product2:likes', 'wijaya');
$value2 = $client->pfmerge('product3:likes', 'product1:likes', 'product2:likes');
d('Total merged like', $client->pfcount('product3:likes'));