import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

// import all the required modules
import Environment from "../environment";
import * as debug from "debug";
import * as request from "es6-request";
import * as moment from "moment";
import { Op } from "sequelize";
import * as Queue from "bull";

// initialize the database
import "../core/sequelize";
import "../core/redis";

import Post from "../models/posts/post.model";
import PostTag from "../models/posts/post-tag.model";
import PostHistory from "../models/posts/post-history.model";
import { sequelize } from "../core/sequelize";

const log = debug("app:workers:fetch-stats");

log(`started worker`);

const updaterQueue = new Queue("updater", Environment.config.get("redis.url"), {
	prefix: "job",
	defaultJobOptions: {
		removeOnComplete: true,
		removeOnFail: true
	},
	limiter: {
		max: 380,
		duration: 60000
	}
});

updaterQueue.process("newPosts", async (job) => {
	log(`checking for new posts`);

	let fullPages = 0;
	let page = 0;
	while (fullPages < 2) {
		let [body, res] = await request.get(`https://api.dumpert.nl/mobile_api/json/latest/${page}`).header("cookie", "cpc=10; nsfw=1");

		if (res.statusCode !== 200) {
			log(`status code !== 200`);
			throw new Error("API returned error");
		}

		let parsed;
		try {
			parsed = JSON.parse((body as string).replace(new RegExp("\u0000", "g"), ""));

			if (!parsed.success) {
				log(`success !== true`);
				throw new Error(`API returned insuccessful ${JSON.stringify(parsed, null, 2)}`);
			}
		} catch (err) {
			log(`api response not valid json`);
			throw new Error("Response not valid JSON");
		}

		const checkedAt = Math.round(Date.now() / 1000);

		let existingItems = await Post.findAll({
			attributes: ["id", "dumpertId"],
			where: {
				dumpertId: {
					[Op.in]: parsed.items.map(i => i.id)
				}
			}
		});

		let newItems: any[] = parsed.items.filter(i => !existingItems.find(p => p.dumpertId === i.id));

		if (newItems.length < parsed.items.length) {
			log(`${parsed.items.length - newItems.length} posts already existing`);

			if (newItems.length === 0) {
				fullPages++;
			}
		}

		let transaction = await sequelize.transaction();

		let newPosts = await Promise.all(newItems.map((post) => {
			const counts = post.media.reduce((acc, curr) => {
				switch (curr.mediatype) {
					case "VIDEO":
						acc.videoCount++;
						break;
					case "FOTO":
						acc.imageCount++;
						break;
					case "AUDIO":
						acc.audioCount++;
						break;
				}

				return acc;
			}, { videoCount: 0, imageCount: 0, audioCount: 0});

			return new Post({
				dumpertId: post.id,
				title: post.title,
				description: post.description,
				thumbnail: post.thumbnail || null,
				postedAt: moment(post.date).toDate(),
				nsfw: post.nsfw,
				rawData: post,
				tags: Post.parseTags(post.tags).map(tag => ({ tag })),
				...counts,
				histories: [{
					checkedAt: sequelize.fn("TO_TIMESTAMP", checkedAt),
					views: 0,
					kudos: 0,
					comments: 0
				}]
			}, {
				include: [{
					model: PostTag
				}, {
					model: PostHistory
				}]
			}).save({ transaction });
		}));

		for (const post of newPosts) {
			await updaterQueue.add("fetchStats", {
				id: post.id,
				dumpertId: post.dumpertId,
				checkedAt
			});
		}

		await transaction.commit();

		page++;
	}
});

updaterQueue.process("updateStats", async (job) => {
	let transaction = await sequelize.transaction();

	let results = await sequelize.query(`
		WITH latest AS (
			SELECT
				DISTINCT ON ("postId") "postId",
				"checkedAt"
			FROM
				"postHistories"
			ORDER BY
				"postId",
				"checkedAt" DESC
		), inserts ("postId", "checkedAt") AS (
			INSERT INTO
				"postHistories"
				SELECT
					p."id" AS "postId",
					DATE_TRUNC('second', NOW()) AS "checkedAt",
					0 AS "views",
					0 AS "kudos",
					0 AS "comments"
				FROM
					"posts" p
				LEFT JOIN
					"latest" l
					ON
						l."postId" = p."id"
				WHERE
					p."deletedAt" IS NULL AND
					(
						l."checkedAt" IS NULL OR
						(p."postedAt" > NOW() - interval '1 day' AND l."checkedAt" < NOW() - interval '5 minutes') OR
						(p."postedAt" > NOW() - interval '2 days' AND l."checkedAt" < NOW() - interval '30 minutes') OR
						(p."postedAt" > NOW() - interval '4 days' AND l."checkedAt" < NOW() - interval '6 hours') OR
						(p."postedAt" > NOW() - interval '8 days' AND l."checkedAt" < NOW() - interval '12 hours') OR
						(p."postedAt" > NOW() - interval '16 days' AND l."checkedAt" < NOW() - interval '1 day') OR
						(p."postedAt" > NOW() - interval '32 days' AND l."checkedAt" < NOW() - interval '2 days') OR
						(l."checkedAt" < NOW() - interval '1 week')
					)
			RETURNING
				"postId",
				"checkedAt"
		)
		SELECT
			i."postId",
			EXTRACT(epoch FROM i."checkedAt") AS "checkedAt",
			p."dumpertId"
		FROM
			inserts i
		LEFT JOIN
			"posts" p ON
				p."id" = i."postId"
	`, {
		transaction,
		type: sequelize.QueryTypes.SELECT
	});

	await transaction.commit();

	for (const row of results) {
		await updaterQueue.add("fetchStats", {
			id: row.postId,
			dumpertId: row.dumpertId,
			checkedAt: row.checkedAt
		});
	}
});

updaterQueue.process("fetchStats", async (job) => {
	log(`processing post ${job.data.dumpertId}`);
	let [post, comments] = await Promise.all([
		(async () => {
			let [body, res] = await request.get(`https://api.dumpert.nl/mobile_api/json/info/${job.data.dumpertId}/`).header("cookie", "cpc=10; nsfw=1");

			if (res.statusCode !== 200) {
				log(`status code !== 200`);
				throw new Error("API returned error");
			}

			let parsed;
			try {
				parsed = JSON.parse((body as string).replace(new RegExp("\u0000", "g"), ""));
			} catch (err) {
				log(`api response not valid json`, err);

				throw new Error("Response not valid JSON");
			}

			if (!parsed.success) {
				if (parsed.errors[0] === "Item niet gevonden") {
					await Post.destroy({
						where: {
							dumpertId: {
								[Op.eq]: job.data.dumpertId
							}
						}
					});

					return;
				}

				throw new Error(parsed.errors[0]);
			}

			return parsed.items[0];
		})(),
		(async () => {
			let [body, res] = await request.get(`https://comments.dumpert.nl/api/v1.0/articles/${job.data.dumpertId.replace("_", "/")}/comments/?includeitems=0`).header("cookie", "cpc=10; nsfw=1");

			if (res.statusCode !== 200) {
				log(`status code !== 200`);

				if (body.includes("Article not found")) {
					log(`post comments (no longer) found`);

					return 0;
				}

				if (body.includes("CRC check failed")) {
					log(`post crc check failed`);

					return 0;
				}

				throw new Error("API returned error");
			}

			let parsed;
			try {
				parsed = JSON.parse(body as string);

				if (parsed.status !== "success") {
					log(`status !== "success"`);
					throw new Error(`API returned insuccessful ${JSON.stringify(parsed, null, 2)}`);
				}
			} catch (err) {
				log(`api response not valid json`);

				throw new Error("Response not valid JSON");
			}

			return parsed.summary.comment_count;
		})()
	]);

	let existing = await Post.findOne({
		where: {
			id: {
				[Op.eq]: job.data.id
			}
		},
		include: [{
			model: PostTag
		}]
	});

	let tags = Post.parseTags(post.tags);

	let addTags = tags.filter(t => !existing.tags.find(tag => tag.tag === t));
	let removeTags = existing.tags.filter(t => tags.indexOf(t.tag) === -1);

	if (addTags.length > 0) {
		await existing.$add("tags", addTags.map(tag => new PostTag({ tag })));
	}

	if (removeTags.length > 0) {
		await existing.$remove("tag", removeTags);
	}

	const counts = post.media.reduce((acc, curr) => {
		switch (curr.mediatype) {
			case "VIDEO":
				acc.videoCount++;
				break;
			case "FOTO":
				acc.imageCount++;
				break;
			case "AUDIO":
				acc.audioCount++;
				break;
		}

		return acc;
	}, { videoCount: 0, imageCount: 0, audioCount: 0});

	await existing.update({
		title: post.title,
		description: post.description,
		thumbnail: post.thumbnail || null,
		nsfw: post.nsfw,
		rawData: post,
		...counts
	});

	await PostHistory.update({
		checkedAt: sequelize.fn("NOW"),
		views: post.stats.views_total,
		kudos: post.stats.kudos_total,
		comments
	}, {
		where: {
			[Op.and]: [
				{
					postId: {
						[Op.eq]: job.data.id
					}
				},
				sequelize.literal(`EXTRACT(epoch FROM "checkedAt") = ${job.data.checkedAt}`)
			]
		}
	});
});

(async () => {
	await updaterQueue.add("newPosts", null, {
		repeat: {
			cron: "* * * * *"
		}
	});

	await updaterQueue.add("updateStats", null, {
		repeat: {
			cron: "* * * * *"
		}
	});
})();
