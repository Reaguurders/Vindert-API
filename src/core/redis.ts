import Environment from "../environment";
import * as Redis from "ioredis";

export default new Redis(Environment.config.get("redis.url"));
