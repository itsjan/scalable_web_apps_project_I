import { connect } from "https://deno.land/x/redis/mod.ts";

const client = await connect({ hostname: "localhost", port: 6379 });

const ok = await client.set("foo", "bar");
const foo = await client.get("foo");

console.log(ok, foo);

await client.xAdd("assignments_to_grade", "*", { assignment_id: 22 });
