<?php

namespace Angga\Phpredis;

require 'vendor/autoload.php';

use Predis\Client;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . "/..");
$dotenv->load();

class RedisClient {
    private static $client;

    public static function getClient() {
        if (is_null(self::$client)) {
            // Specify Redis server connection details
            $redisParams = [
                'scheme' => 'tcp',
                'host'   => $_ENV['REDIS_HOST'],
                'port'   => $_ENV['REDIS_PORT'],
            ];
            // Check if a password is set and add it to the connection parameters
            if ($_ENV['REDIS_PASSWORD']) {
                $redisParams['password'] = $_ENV['REDIS_PASSWORD'];
            }

            // Create a new Redis client
            self::$client = new Client($redisParams);
        }
        return self::$client;
    }
}
