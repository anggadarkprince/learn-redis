import {withLock} from "./lock";
import {client} from "../../redis-lua-script";
import {DateTime} from 'luxon';
import {randomBytes} from "crypto";

interface Item {
    id: string;
    name: string;
    createdAt: DateTime;
    price: number;
    bids: number;
    highestBidUserId: string;
}

interface CreateBidAttrs {
    itemId: string;
    userId: string;
    amount: number;
    createdAt: DateTime;
}

const createItem = async (attrs: Item) => {
    const id = randomBytes(6).toString('hex');
    attrs.id = id;
    await Promise.all([
        client.hSet(`item#${id}`, {
            ...attrs,
            createdAt: attrs.createdAt.toMillis(),
        }),
        client.zAdd('item-prices', {
            value: id,
            score: 0,
        })
    ])
    return id;
};

const serializeHistory = (amount: number, createdAt: number) => {
    return `${amount}:${createdAt}`;
}

export const deserialize = (id: string, item: { [key: string]: string }): Item => {
    return {
        id,
        name: item.name,
        createdAt: DateTime.fromMillis(parseInt(item.createdAt)),
        bids: parseInt(item.bids),
        price: parseFloat(item.price),
        highestBidUserId: item.highestBidUserId,
    }
};

const getItem = async (id: string) => {
    const item = await client.hGetAll(`item#${id}`);
    if (Object.keys(item).length === 0) {
        return null;
    }
    return deserialize(id, item);
};

export const createBid = async (attrs: CreateBidAttrs) => {
    // using simple RedLock algorithm
    return withLock(attrs.itemId, async (lockedClient: typeof client, signal: any) => {
        // fetching the item
        // doing validation
        // writing some data
        const item = await getItem(attrs.itemId);

        // simulate long process to make lock expired before callback is completed
        //await pause(5000);

        if (!item) {
            throw new Error('Item does not exist!');
        }
        if (item.price >= attrs.amount) {
            throw new Error('Bid too low, try ' + (item.price + 0.01));
        }
        const serialized = serializeHistory(attrs.amount, attrs.createdAt.toMillis());

        if (signal.expired) {
            //throw new Error('Lock expired, cant write any more data');
        }

        return Promise.all([
            lockedClient.rPush(`bids#${attrs.itemId}`, serialized),
            lockedClient.hSet(`item#${attrs.itemId}`, {
                bids: item.bids + 1,
                price: attrs.amount,
                highestBidUserId: attrs.userId,
            }),
            lockedClient.zAdd('item-prices', {
                value: item.id,
                score: attrs.amount,
            })
        ])
    });
}
const run = async () => {
    console.info('Create item');
    const itemId = await createItem({
        id: '',
        name: 'Car',
        createdAt: DateTime.now(),
        price: 0,
        bids: 0,
        highestBidUserId: '',
    })

    console.info('Create bid 20');
    await createBid({
        itemId: itemId,
        userId: '1',
        amount: 20,
        createdAt: DateTime.now(),
    })

    console.info('Create bid 15');
    try {
        await createBid({
            itemId: itemId,
            userId: '1',
            amount: 15,
            createdAt: DateTime.now(),
        })
    } catch (e) {
        console.error(e);
    }

    console.info('Create bid 22');
    await createBid({
        itemId: itemId,
        userId: '1',
        amount: 22,
        createdAt: DateTime.now(),
    });
}
run();
