import * as Router from "koa-router";
import * as debug from "debug";

import { AppError } from "../errors/app.error";
import Post from "../models/posts/post.model";
import { Op } from "sequelize";
import PostHistory from "../models/posts/post-history.model";
import PostTag from "../models/posts/post-tag.model";

const log = debug("app:routes:posts");

const router = new Router();

router.use("/:postId", async (ctx, next) => {
	log(`getting a single post`);

	let post = await Post.findOne({
		where: {
			dumpertId: {
				[Op.eq]: ctx.params.postId
			}
		},
		include: [
			PostTag
		]
	});

	if (!post) {
		throw new AppError("notFound");
	}

	let history = await PostHistory.findOne({
		where: {
			postId: {
				[Op.eq]: post.id
			}
		},
		order: [
			["checkedAt", "DESC"]
		]
	});

	post.views = history.views;
	post.kudos = history.kudos;
	post.comments = history.comments;

	ctx.scope.post = post;

	return next();
});

router.get("/:postId", async (ctx) => {
	if (ctx.query.histories && ctx.query.histories === "true") {
		await ctx.scope.post.reload({
			include: [
				PostTag,
				PostHistory
			],
			order: [
				["histories", "checkedAt", "ASC"]
			]
		});
	}

	let data = ctx.scope.post.get({ plain: true });

	if (data.tags) {
		data.tags = data.tags.map(t => t.tag);
	}

	if (data.histories) {
		data.histories = data.histories.map(h => ({
			checkedAt: h.checkedAt,
			views: h.views,
			kudos: h.kudos,
			comments: h.comments
		}));
	}

	ctx.status = 200;
	ctx.body = {
		success: true,
		data
	};
});

export default router;
