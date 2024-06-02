<?php
require 'vendor/autoload.php';

use Angga\Phpredis\RedisClient;

// Create a new Redis client
$client = RedisClient::getClient();

// Example: set a key and retrieve its value
$client->set('name', 'Angga');
$value = $client->get('name');

echo $value;
