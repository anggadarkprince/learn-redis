import {client} from "../redis-client";
import {SchemaFieldTypes} from "@redis/search/dist/commands";

const run = async () => {
    // HSET cars#a1 name 'new car' color red year 1980
    await client.hSet('cars#a1', {name: 'new car', color: 'red', year: 1960});
    await client.hSet('cars#a2', {name: 'red car', color: 'red', year: 1970});
    await client.hSet('cars#a3', {name: 'old car', color: 'blue', year: 1980});
    await client.hSet('cars#a4', {name: 'car green', color: 'green', year: 1990});
    await client.hSet('cars#a5', {name: 'fast green', color: 'green', year: 2000});

    await client.ft.DROPINDEX('idx:cars');

    // FT.CREATE idx:cars ON HASH PREFIX 1 cars# SCHEMA name TEXT year NUMERIC color TAG
    // FT.CREATE idx:cars ON HASH PREFIX 2 cars# trucks# SCHEMA name TEXT year NUMERIC color TAG
    const createIndex = await client.ft.CREATE('idx:cars', {
        name: SchemaFieldTypes.TEXT, // text or fuzzy search - similar
        year: SchemaFieldTypes.NUMERIC, // for number
        color: SchemaFieldTypes.TAG, // exact match
    }, {
        ON: 'HASH',
        PREFIX: ['cars#']
    });
    console.log('Create index', createIndex);

    // FT.SEARCH idx:cars '@name:(fast car)'
    // all stop words, punctuation, spaces are removed: 'a fast, fast car!!' become [fast, fast, car]
    // stemming is used to reduce words down to a base form 'fasting', 'fastly', 'fasts' will be reduced to 'fast' (snowballstem.org/demo.html)
    // fast -> search all text fields for 'fast'
    // @name:(fast car) -> name contains 'fast' and 'car'
    // @name:(fast | car) -> name contains 'fast' or 'car'
    // -@name:(fast) -> name doest not include 'fast'
    const searchText = await client.ft.SEARCH('idx:cars', '@name:(fast car)');
    console.log('Search car name "fast car"', searchText);

    // FT.SEARCH idx:cars '@color:{blue}' // color == blue
    // FT.SEARCH idx:cars '-@color:{blue}' // color != blue
    // FT.SEARCH idx:cars '@color:{red | blue}' // color == blue || color == blue
    // FT.SEARCH idx:cars '@color:{light\ blue}' // color == 'light blue' (escape spaces with \)
    // all 'stop' words are removed from TAG and TEXT queries!! @cities:{to | a | or} become @cities:{ }
    const searchTag = await client.ft.SEARCH('idx:cars', '@color:{red}');
    console.log('Search car color "red"', searchTag);

    // FT.SEARCH idx:cars '@year:[1970 1980]' // >=1970 and <=1980
    // FT.SEARCH idx:cars '@year:[(1970 (1980]' // >1970 and <1980
    // FT.SEARCH idx:cars '@year:[(1970 +inf]' // >1970
    // FT.SEARCH idx:cars '-@year:[1970 1980]' // <1970 and >1980
    const searchNumeric = await client.ft.SEARCH('idx:cars', '@year:[1970 1980]');
    console.log('Search car year "1970-1980"', searchNumeric);

    // FT.SEARCH idx:cars '@year:[1955 1980] @color:{red}'
    const searchMultiple = await client.ft.SEARCH('idx:cars', '@year:[1970 1980] @color:{red}');
    console.log('Search cars "red" and "1970-1980"', searchMultiple);

    // fuzzy search
    // wrap a term with '%' to include strings that have a slight difference in characters
    // FT.SEARCH idx:cars '@name:(%dar%)' // 1 character mismatch
    // FT.SEARCH idx:cars '@name:(%%dar%%)' // 2 characters mismatch
    // FT.SEARCH idx:cars '@name:(%%%dar%%%)' // 3 characters mismatch
    const searchFuzzy = await client.ft.SEARCH('idx:cars', '@name:(%dar%)');
    console.log('Search car name "car" but type "dar"', searchFuzzy);

    // prefix
    // add * to a string to do a prefix search
    // FT.SEARCH idx:cars '@name:(fa*)' // return fast, far, fact, fawn, fantastic
    const searchPrefix = await client.ft.SEARCH('idx:cars', '@name:(fast*)');
    console.log('Search car begin with "fast"', searchPrefix);
};
run();
