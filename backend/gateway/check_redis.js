import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

async function checkRedis() {
  try {
    console.log("Connecting to Redis...");
    const keys = await redis.keys("*");
    console.log(`--- Total Keys in Redis: ${keys.length} ---`);
    for (const key of keys) {
      const type = await redis.type(key);
      let val = "";
      if (type === "string") {
        val = await redis.get(key);
      }
      console.log(`Key: ${key} (${type})`);
      console.log(`Val: ${val}`);
      console.log("-----------------------------------------");
    }
    redis.disconnect();
  } catch (error) {
    console.error("Error checking Redis:", error);
  }
}

checkRedis();
