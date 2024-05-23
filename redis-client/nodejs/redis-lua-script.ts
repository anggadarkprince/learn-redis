import 'dotenv/config';
import {createClient, defineScript} from "redis";

const client = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '')
    },
    password: process.env.REDIS_PW,
    // redis script (lua) tread as single command (atomic)
    // we can run some redis command without worry other process interfere (get to set value)
    scripts: {
        addOneAndStore: defineScript({
            NUMBER_OF_KEYS: 1,
            SCRIPT: `
				local storeAtKey = KEYS[1]
				local addOneTo = 1 + tonumber(ARGV[1])
				
				return redis.call('SET', storeAtKey, addOneTo)
			`,
            transformArguments(key: string, value: number) {
                return [key, value.toString()];
            },
            transformReply(reply: any) {
                return reply;
            }
        }),
        incrementView: defineScript({
            NUMBER_OF_KEYS: 3,
            SCRIPT: `
				local itemsViewsKey = KEYS[1]
				local itemsKey = KEYS[2]
				local itemsByViewsKey = KEYS[3]
				local itemId = ARGV[1]
				local userId = ARGV[2]
				
				local inserted = redis.call('PFADD', itemsViewsKey, userId)
				
				if inserted == 1 then
					redis.call('HINCRBY', itemsKey, 'views', 1)
					redis.call('ZINCRBY', itemsByViewsKey, itemId)
				end
			`,
            transformArguments(itemId: string, userId: string) {
                return [
                    `views#${itemId}`,
                    `items#${itemId}`,
                    `items:views#${itemId}`,
                    itemId,
                    userId,
                ];
            },
            transformReply(): any {
            }
        }),
        unlock: defineScript({
            NUMBER_OF_KEYS: 1,
            SCRIPT: `
				local key = KEYS[1]
				local token = ARGV[1]
				if redis.call('GET', key) == token then
					return redis.call('DEL', key)
				end
			`,
            transformArguments(key: string, token: string) {
                return [key, token];
            },
            transformReply(reply: any): any {
                return reply;
            }
        }),
    }
});

client.on('error', (err) => console.error(err));
client.connect();

export { client };
