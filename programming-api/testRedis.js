// Just a test to see if redis works
// Redis is used to communicate between the grader-api and the programming-api

import { connect } from "https://deno.land/x/redis/mod.ts";

const client = await connect({ hostname: "localhost", port: 6379 });

const ok = await client.set("foo", "bar");
const foo = await client.get("foo");

console.log(ok, foo);

client.lpush("mylist", "21");
client.lpush("mylist", "22");
client.lpush("mylist", "23");
client.lpush("mylist", "24");
client.lpush("mylist", "25");

console.log(await client.rpop("mylist"));
