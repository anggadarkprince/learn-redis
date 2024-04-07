import 'dotenv/config';
import { client } from './redis-client';

const run = async () => {
	await client.set('key', 'value');
	const result = await client.get('key');

	console.log(result);
};
run();
