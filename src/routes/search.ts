import * as Router from "koa-router";
import * as debug from "debug";

import Post from "../models/posts/post.model";
import { sequelize } from "../core/sequelize";
import { Op } from "sequelize";
import PostTag from "../models/posts/post-tag.model";

const log = debug("app:routes:search");

const router = new Router();

router.get("/", async (ctx) => {
	log(`searching request`);

	if (!ctx.query.q || ctx.query.q.length < 3) {
		throw new Error("search too short");
	}

	let posts = await Post.findAll({
		attributes: {
			include: [
				sequelize.literal(`ts_rank("searchable", plainto_tsquery('dutch', ${sequelize.escape(ctx.query.q)})) AS "rank"`)
			],
			exclude: [
				"rawData",
				"createdAt",
				"updatedAt"
			]
		},
		where: {
			[Op.and]: [
				sequelize.literal(`"searchable" @@ plainto_tsquery('dutch', ${sequelize.escape(ctx.query.q)})`)
			]
		},
		order: [
			sequelize.literal(`"rank" DESC`),
			["postedAt", "DESC"]
		],
		include: [{
			model: PostTag
		}],
		limit: 20
	});

	ctx.status = 200;
	ctx.body = {
		success: true,
		data: posts
	};
});

export default router;
