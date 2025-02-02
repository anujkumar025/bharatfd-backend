import client from './../config/redis_cache.js'


// await client.DEL("anuj");

// console.log("done deleting");
// await client.set("anuj", "sdfa", "asdkfahsdoifh");

const answer = await client.flushAll();
// console.log(answer);
console.log("done");