import * as Router from "koa-router";
import * as debug from "debug";

import Environment from "../environment";
import Post from "../models/posts/post.model";
import { sequelize } from "../core/sequelize";

const log = debug("app:routes:status");

const router = new Router();

router.get("/", async (ctx) => {
	log(`getting api status`);

	let [postCount, uniqueTags, mostUsed] = await Promise.all([
		Post.count(),
		sequelize.query(`
			SELECT COUNT(DISTINCT tag) AS "count" FROM "postTags"
		`, {
			type: sequelize.QueryTypes.SELECT
		}),
		sequelize.query(`
			SELECT COUNT("postId") AS "count", "tag" FROM "postTags" GROUP BY "tag" ORDER BY "count" DESC LIMIT 20
		`, {
			type: sequelize.QueryTypes.SELECT
		})
	]);

	ctx.status = 200;
	ctx.body = {
		success: true,
		data: {
			version: Environment.getPackage().version,
			posts: {
				count: postCount
			},
			tags: {
				uniqueCount: uniqueTags[0].count,
				mostUsed: mostUsed
			}
		}
	};
});

export default router;
