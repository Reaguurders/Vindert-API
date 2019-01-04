import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

// import all the required modules
import * as debug from "debug";
import * as request from "es6-request";
import * as path from "path";
import * as moment from "moment";
import { readJson, writeJson, ensureDir } from "fs-extra";
import { Op } from "sequelize";

// initialize the database
import "../core/sequelize";

import Post from "../models/posts/post.model";
import PostTag from "../models/posts/post-tag.model";
import PostHistory from "../models/posts/post-history.model";
import { sequelize } from "../core/sequelize";

const log = debug("app:workers:fetch-all");

log(`started worker`);

const stateFile = path.join(__dirname, "../../states/fetch-all.json");
const interval = 1000;

const checkPage = async (page) => {
	let start = Date.now();

	log(`checking page ${page}`);
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

		const checkedAt = new Date();

		let existingItems = await Post.findAll({
			attributes: ["id", "dumpertId"],
			where: {
				dumpertId: {
					[Op.in]: parsed.items.map(i => i.id)
				}
			}
		});

		let newItems = parsed.items.filter(i => !existingItems.find(p => p.dumpertId === i.id));

		if (newItems.length < parsed.items.length) {
			log(`${parsed.items.length - newItems.length} posts already existing`);
		}

		let transaction = await sequelize.transaction();

		await Promise.all(newItems.map(post => {
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
					checkedAt,
					views: post.stats.views_total,
					kudos: post.stats.kudos_total,
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

		await transaction.commit();
	} catch (err) {
		log(`api response not valid json`);
		console.log(err);
		throw new Error("Response not valid JSON");
	}

	await new Promise((resolve, reject) => {
		let duration = Math.max(interval - (Date.now() - start), 0);
		setTimeout(resolve, duration);
	});
};

(async () => {
	await ensureDir(path.dirname(stateFile));
	let state = {
		lastCheck: new Date(),
		page: 0
	};

	try {
		log(`attempting to fetch state from previous run`);
		state = await readJson(stateFile);
	} catch (err) {
		log(`not able to get state from previous run`);
	}

	while (true) {
		try {
			await checkPage(state.page);
		} catch (err) {
			console.error(`an error occurred: `, err);
			process.exit(0);
			break;
		}

		state.page++;
		await writeJson(stateFile, state);
	}
})();
