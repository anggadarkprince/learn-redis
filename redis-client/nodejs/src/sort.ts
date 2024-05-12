import 'dotenv/config';
import {client} from "../redis-client";

const run = async () => {
    // ZADD books:likes 45 good
    // ZADD books:likes 100 bad
    // ZADD books:likes 60 ok

    // HSET books:good title 'Good Book' year 1950
    // HSET books:bad title 'Bad Book' year 1930
    // HSET books:ok title 'Ok Book' year 1940

    // ZADD books:likes 99 good
    // ZADD books:likes 0 bad
    // ZADD books:likes 40 ok

    // by default SORT operates on members of a sorted set not the scores (refers to these members as scores)
    // SORT books:likes // error: try to parse good, bad, ok to number

    // tell redis that member is an alphabet
    // SORT books:likes ALPHA // ["bad", "good", "ok] it's sorted
    // SORT books:likes ALPHA LIMIT 0 2 // ["bad", "good"] it's sorted


    // SORT books:likes ALPHA GET books:*->year (it will find hash with key)
    // - books:bad->year (year key inside books:bad which is 1930) bad->1930 = 100 (score in books:likes)
    // - books:ok->year (year key inside books:ok which is 1940) ok->1940 = 60
    // - books:good->year (year key inside books:good which is 1950) good->1950 = 45
    // then sort by its like then the result is [1930, 1950, 1940] (alpha order bad, good, ok)

    // SORT books:likes BY books:*->year
    // same like above extract the year value in books:* hash then sort by its likes and return the member (name)
    // the result is: ["bad", "ok", "good"]  (bad: 100 likes, ok:60 likes, good: 45 likes)


    // SORT books:likes BY books:*->year GET books:*->title
    // same as above but get the other key rather than the pattern

    // SORT books:likes BY books:*->year GET # GET books:*->title GET books:*->year (# mean keep the key: bad "Bad Book" 1930)
    // SORT books:likes BY nosort GET books:*->title (nosort is special keyword to prevent get data sorted before operate SORT command - give little performance)


    await client.zAdd('books:likes', {score: 45, value: 'good'});
    await client.zAdd('books:likes', {score: 100, value: 'bad'});
    await client.zAdd('books:likes', {score: 60, value: 'ok'});

    await client.hSet('books:good', {title: 'Good Book', year: 1950});
    await client.hSet('books:bad', {title: 'Bad Book', year: 1940});
    await client.hSet('books:ok', {title: 'Ok Book', year: 1930});

    const results: any = await client.sort(
        'books:likes',
        {
            GET: [
                '#',
                `books:*->title`,
                `books:*->year`,
            ],
            BY: 'books:*->year',
            DIRECTION: "ASC",
            LIMIT: {
                offset: 0,
                count: 10,
            }
        }
    );

    console.log(results);
};
run();
