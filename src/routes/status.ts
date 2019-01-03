import * as Router from "koa-router";
import * as debug from "debug";

import Environment from "../environment";
import { getConnection } from "typeorm";
import { Post } from "../entities/post.entity";

const log = debug("app:routes:status");

const router = new Router();

router.get("/", async (ctx) => {
	log(`getting api status`);
	let repository = await getConnection().getRepository(Post);

	let count = await repository.count();

	ctx.status = 200;
	ctx.body = {
		success: true,
		data: {
			version: Environment.getPackage().version,
			posts: {
				count
			}
		}
	};
});

export default router;
