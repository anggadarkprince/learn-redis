## REDIS

### Run Redis With Docker
1. `docker-compose -f docker-compose.yaml up -d`
2. `docker container exec -it redis /bin/sh`
3. `redis-cli -h localhost`
4. `ping` will return `PONG`

### Redis Command Operation

#### Select Database
`select [index]` by default 0-15 or 16 databases (based on default config)

#### Set Value
`set [key] [value]`
`set name "Angga Ari"`

#### Get Value
`get [key]`
`get name`

#### Check If Key Exist
`exists [key] [key] ...`
`exists name age`

#### Delete Value
`del [key]`
`del name`

#### Append Value
`append [key] [value]` (will append the string rather than replace)
`append name "ari wijaya"`
`append not-found-key "hello world"` (will create new key like `set value`)

#### Get Multiple Keys (Pattern)
`keys [patern]`
`keys na*`
`keys *` (get all keys)

#### Operation Range
`getrange [key] [start] [end]`
`setrange [key] [start] [value]`

#### Get Multiple Value
`mget [key] [key] ...`
`mget name age`

#### Set Multiple Value
`mset [key1] [value1] [key2] [value2]`
`mset address "Avenue Street" gender male`

### Expiration
`setex [key] [seconds] [value]`
`expire [key] [seconds]`
`ttl [key]` (result -1 meaning never expired)

### Increment & Decrement
`incr [key]` (key should number, or if not set it will create new value from 1)
`decr [key]`
`incrby [key] [total incr]`
`decrby [key] [total decr]`

### Flush
`flushdb` (remove all keys from current database)
`flushall` (remove all keys from all databases)

### Redis Pipeline
`cat sets.txt | redis-cli -h localhost --pipe` (run command inside file into redis)

### Transaction
`multi` mark the start of a transaction block
`set [key] [value]` set operation
`del [key]` del operation
`another command`
`exec` execute all commands issued after `multi` (will commit or fail if one or more command error)
`discard` discard all commands issued after `multi` (cancel whatever commands after `multi`)

### Monitor
`monitor` will activate state to capture all command

### Server Information
`info` get information and statistics about server
`config [sub: get|set|resetstat|rewrite]` get the value a configuration parameter
`slowlog` return top entries from the slowing

### Client Connection
`client list` get the list of client connections
`client id` return client id for the current connection
`client kill ip:port` kill the connection of a client

### Redis Security
config `bind 127.0.0.1` will setting redis to allowed access outside the host
config `protected-mode yes` will allow connect from outside but only proceed request (command) from localhost

### Redis Authentication
config `user default on +@connection` create default user to making connection
config `user angga on +@all -DEBUG ~* >anggaari` use new user to access all commands
`auth [username] [password]` login with user in redis-cli

### Redis Authorization
`acl cat` show group category of keys
config `user angga on +@all -@set ~* >anggaari` the `~` give key access, the `+@all` give command access, `-@set` prevent set command


### Persistence
redis will periodically store data from memory to persistence storage like harddisk
config `save [seconds] [changes]`
`save` synchronously save the dataset to disk
`bgsave` asynchronously save the dataset to disk

### Eviction
when memory full, by default `noeviction` will reject new data.
redis has strategy that can delete old data and receive new data

eviction has configuration to set max memory and policy to manage the data,
config `maxmemory` need to be set

config eviction policy:
`LRU` means Least Recently Used
`LFU` means Least Frequently Used

`volatile-lru` -> Evict using approximated LRU, only keys with an expire set.
`allkeys-lru` -> Evict any key using approximated LRU.
`volatile-lfu` -> Evict using approximated LFU, only keys with an expire set.
`allkeys-lfu` -> Evict any key using approximated LFU.
`volatile-random` -> Remove a random key having an expire set.
`allkeys-random` -> Remove a random key, any key.
`volatile-ttl` -> Remove the key with the nearest expire time (minor TTL)
`noeviction` -> Don't evict anything, just return an error on write operations.
