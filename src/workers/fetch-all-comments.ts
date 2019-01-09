// Used to fetch all the comments of all posts in the database
// Only used to fetch the result for old posts, because data should be
// accurate and the comment count can't change for posts where can comment is false

import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

// import all the required modules
import * as debug from "debug";
import * as request from "es6-request";
import { Op } from "sequelize";

// initialize the database
import "../core/sequelize";
import "../core/redis";

import PostHistory from "../models/posts/post-history.model";
import { sequelize } from "../core/sequelize";

const log = debug("app:workers:fetch-all-comments");

log(`started worker`);

// 400 requests per minute
const rateLimit = 60000 / 400;

const getPosts = async () => {
	const results = await sequelize.query(`
		SELECT
			p."id",
			p."dumpertId",
			ph."checkedAt",
			ph."comments"
		FROM
			"posts" p
		LEFT JOIN
			"postHistories" ph
			ON
				ph."postId" = p."id"
		WHERE
			p."postedAt" < '2019-01-01' AND
			ph."comments" = -1
		ORDER BY
			p."postedAt" ASC
		LIMIT 400
	`, {
		type: sequelize.QueryTypes.SELECT
	});

	return results;
};

const fetchComments = async (post) => {
	let start = Date.now();

	log(`checking post ${post.dumpertId}`);
	let [body, res] = await request.get(`https://comments.dumpert.nl/api/v1.0/articles/${post.dumpertId.replace("_", "/")}/comments/?includeitems=0`).header("cookie", "cpc=10; nsfw=1");

	if (res.statusCode !== 200) {
		log(`status code !== 200`);

		if (body.includes("Article not found")) {
			log(`post (no longer) found`);
			PostHistory.update({
				comments: 0
			}, {
				where: {
					postId: {
						[Op.eq]: post.id
					},
					checkedAt: {
						[Op.eq]: post.checkedAt
					}
				}
			}).catch((err) => {
				throw err;
			});

			return;
		}

		if (body.includes("CRC check failed")) {
			log(`post crc check failed`);
			PostHistory.update({
				comments: 0
			}, {
				where: {
					postId: {
						[Op.eq]: post.id
					},
					checkedAt: {
						[Op.eq]: post.checkedAt
					}
				}
			}).catch((err) => {
				throw err;
			});

			return;
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

	PostHistory.update({
		comments: parsed.summary.comment_count
	}, {
		where: {
			postId: {
				[Op.eq]: post.id
			},
			checkedAt: {
				[Op.eq]: post.checkedAt
			}
		}
	}).catch((err) => {
		throw err;
	});

	await new Promise((resolve, reject) => {
		let duration = Math.max(rateLimit - (Date.now() - start), 0);
		setTimeout(resolve, duration);
	});
};

(async () => {
	while (true) {
		try {
			let posts = await getPosts();

			if (posts.length === 0) {
				break;
			}

			for (const post of posts) {
				await fetchComments(post);
			}
		} catch (err) {
			console.error(`an error occurred: `, err);
			process.exit(0);
			break;
		}
	}

	log(`done processing`);
})();
