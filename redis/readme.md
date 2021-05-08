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
`decs [key]`
`incrby [key] [total incr]`
`decrby [key] [total decr]`

### Flush
`flushdb` (remove all keys from current database)
`flushall` (remove all keys from all databases)

### Redis Pipeline
`cat sets.txt | redis-cli -h localhost --pipe` (run command inside file into redis)