import { randomBytes } from 'crypto';
import {client} from "../../redis-lua-script";

export const withLock = async (key: string, cb: (redisClient: Client, signal: any) => any) => {
	// initialized a few variables to control retry behavior
	const retryDelayMs = 100;
	const expiredLockMs = 2000;
	let retries = 20;

	console.log('check lock:')
	// generate a random value to store at the lock key
	const token = randomBytes(6).toString('hex');
	console.log(' token', token)

	// create the lock key
	const lockKey = ` lock:${key}`;

	// set up a while loop to implement the retry behavior
	while(retries > 0) {
		retries--;

		// try to do a SET NX operation (set only if not set)
		const acquired = await client.set(lockKey, token, {
			NX: true,
			PX: expiredLockMs, // set key expired in 2s (in case app crash and locked key never unset)
		});
		console.log(` acquired ${lockKey}`, acquired);

		// IF the set is successful, then run the callback
		if (!acquired) {
			// ELSE brief pause (retryDelayMs) and then retry
			console.log('  retry');
			await pause(retryDelayMs);
			continue;
		}

		console.log(' run callback');
		try {
			const signal = {expired: false};
			setTimeout(() => {
				signal.expired = true;
			}, expiredLockMs);

			// proxy client is alternative version to make sure expired lock is intercept without callback running check about signal.expired
			const proxiedClient = buildClientProxy(expiredLockMs);
			const result = cb(proxiedClient, signal);

			console.log(' success');

			return result;
		} finally {
			// unset the locked set
			//await client.del(lockKey);

			// create custom script to make sure delete the same token
			// to prevent delete key from another process (if current process is deleted by PX)
			await client.unlock(lockKey, token);
		}
	}
};

type Client = typeof client;
const buildClientProxy = (timeoutMs: number) => {
	const startTime = Date.now();

	const handler = {
		get(target: Client, prop: keyof Client) {
			if (Date.now() >= startTime + timeoutMs) {
				throw new Error('Lock has expired');
			}
			const value = target[prop];
			return typeof value === 'function' ? value.bind(target) : value;
		}
	}
	return new Proxy(client, handler) as Client;
};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};
