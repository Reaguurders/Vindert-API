import * as Router from "koa-router";
import * as debug from "debug";

import Environment from "../environment";
import Post from "../models/posts/post.model";

const log = debug("app:routes:status");

const router = new Router();

router.get("/", async (ctx) => {
	log(`getting api status`);

	let count = await Post.count();

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
