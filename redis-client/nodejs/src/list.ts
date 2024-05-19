import 'dotenv/config';
import {client} from "../redis-client";

const run = async () => {
    // List is an ordered collection of values associated with a unique index

    // DEL temps
    await client.del('temps');

    // LPUSH temps 25 (add in front)
    await client.lPush('temps', "25");

    // RPUSH temps 27 (add in rear)
    await client.rPush('temps', "27");
    await client.rPush('temps', "26");
    await client.rPush('temps', "23");
    await client.rPush('temps', "25");
    await client.rPush('temps', "21");
    await client.rPush('temps', "25");
    await client.rPush('temps', "30");

    // LLEN temp (get size of list)
    console.log('list size', await client.lLen('temps'))

    // LINDEX temp 0 (get value of list element by its index - can be negative number to get from behind)
    console.log('list element index 0: ', await client.lIndex('temps', 0))

    // LRANGE get element in range (index start from 0) to get all value: LRANGE temps 0 -1
    console.log('list element index 1 - 2: ', await client.lRange('temps', 1, 2))

    // LPOS get position of element (RANK: get element in order - start from 1 - any)
    console.log('position value "25" 2nd: ', await client.lPos('temps', "25", {RANK: 2}))
    console.log('position value "25" search from 10 first element: ', await client.lPos('temps', "25", {MAXLEN: 10}))
    console.log('position value "25" take first 2 matches: ', await client.lPosCount('temps', "25", 2))

    // LPOP temps 2 (remove 2 elements from front, total element is optional argument)
    await client.lPop('temps')
    console.log('current value of index 0: ' + await client.lIndex('temps', 0)); // 27 because 25 is removed

    // RPOP temp (take out the last element)
    await client.rPop('temps')
    console.log('current value of last index: ' + await client.lIndex('temps', -1)); // 25 because 30 is removed (behind)

    // LSET temps 2 32 (change value stored at the given index - set value 32 on index 2)
    await client.lSet('temps', 0, '35');
    console.log('current value of index 0: ', await client.lIndex('temps', 0)); // 35 because 27 is replaced

    // LTRIM temps 2 5 (remove all elements outside of this range)
    console.log('current list before trim:', await client.lRange('temps', 0, -1));
    await client.lTrim('temps', 1, 3);
    console.log('current list after trim:', await client.lRange('temps', 0, -1));

    // LINSERT temps BEFORE 25 15 (find an element in a list, then insert a value before or after it - find first element value 25 then insert 15 before it)
    await client.lInsert('temps', 'BEFORE', '23', '15');
    console.log('current list after trim:', await client.lRange('temps', 0, -1));

    // LREM temps -2 25 (remove some elements from a list - moving from right to left and remove 2 element that have value 25)
    // LREM temps 1 25 (remove from left to right 1 copy of 25)
    // LREM temps 0 25 (remove all value of 25)
    await client.lRem('temps', -2, '23');
    console.log('current list after trim:', await client.lRange('temps', 0, -1));

    // using list to get value from hash
    // del reviews
    // rpush reviews b2
    // rpush reviews a1
    //
    // hset books:a1 title 'Good book'
    // hset books:b2 title 'Bad book'
    //
    // sort reviews by nosort get books:*->title
};
run();
