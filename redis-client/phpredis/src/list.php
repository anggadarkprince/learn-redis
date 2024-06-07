<?php
require 'vendor/autoload.php';

use Angga\Phpredis\RedisClient;
use Predis\Command\Command as RedisCommand;

// Create a new Redis client
$client = RedisClient::getClient();

// List is an ordered collection of values associated with a unique index

// DEL temps
$client->del('temps');

// LPUSH temps 25 (add in front)
$client->lpush('temps', "25");

// RPUSH temps 27 (add in rear)
$client->rpush('temps', "27");
$client->rpush('temps', "26");
$client->rpush('temps', "23");
$client->rpush('temps', "25");
$client->rpush('temps', "21");
$client->rpush('temps', "25");
$client->rpush('temps', "30");

// LLEN temp (get size of list)
d('List size', $client->llen('temps'));

// LINDEX temp 0 (get value of list element by its index - can be negative number to get from behind)
d('List element index 0: ', $client->lindex('temps', 0));

// LRANGE get element in range (index start from 0) to get all value: LRANGE temps 0 -1
d('List element index 1 - 2: ', $client->lrange('temps', 1, 2));

// LPOS get position of element (RANK: get element in order - start from 1 - any)
//d('position value "25" 2nd: ', $client->lpos('temps', "25", ['RANK' => 2]));
//d('position value "25" search from 10 first element: ', $client->lpos('temps', "25", ['MAXLEN' => 10]));
//d('position value "25" take first 2 matches: ', $client->lposcount('temps', "25", 2));

// LPOP temps 2 (remove 2 elements from front, total element is optional argument)
$client->lpop('temps');
d('Current value of index 0: ', $client->lindex('temps', 0)); // 27 because 25 is removed

// RPOP temp (take out the last element)
$client->rpop('temps');
d('Current value of last index: ', $client->lindex('temps', -1)); // 25 because 30 is removed (behind)

// LSET temps 2 32 (change value stored at the given index - set value 32 on index 2)
$client->lset('temps', 0, '35');
d('Current value of index 0: ', $client->lindex('temps', 0)); // 35 because 27 is replaced

// LTRIM temps 2 5 (remove all elements outside of this range)
d('Current list before trim:', $client->lrange('temps', 0, -1));
$client->ltrim('temps', 1, 3);
d('Current list after trim:', $client->lrange('temps', 0, -1));

// LINSERT temps BEFORE 25 15 (find an element in a list, then insert a value before or after it - find first element value 25 then insert 15 before it)
$client->linsert('temps', 'BEFORE', '23', '15');
d('Current list after trim:', $client->lrange('temps', 0, -1));

// LREM temps -2 25 (remove some elements from a list - moving from right to left and remove 2 element that have value 25)
// LREM temps 1 25 (remove from left to right 1 copy of 25)
// LREM temps 0 25 (remove all value of 25)
$client->lrem('temps', -2, '23');
d('Current list after trim:', $client->lrange('temps', 0, -1));

// using list to get value from hash
// del reviews
// rpush reviews b2
// rpush reviews a1
//
// hset books:a1 title 'Good book'
// hset books:b2 title 'Bad book'
//
// sort reviews by nosort get books:*->title