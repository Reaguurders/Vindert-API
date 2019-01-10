import * as Router from "koa-router";
import * as debug from "debug";

import { sequelize } from "../core/sequelize";
import { AppError } from "../errors/app.error";
import moment = require("moment");

const parser = require("search-query-parser");

const log = debug("app:routes:search");

const router = new Router();

router.get("/", async (ctx) => {
	log(`searching request`);

	if (!ctx.query.q || ctx.query.q.length < 3) {
		throw new AppError("search too short");
	}

	const options = {
		nsfw: null,
		type: ["video", "image", "audio"],
		query: null,
		before: null,
		after: null,
		sort: ["date", "desc"],
		page: 0
	};

	const parsed = parser.parse(ctx.query.q || "", {
		tokenize: true,
		offsets: false,
		keywords: [
			"nsfw",
			"type",
			"before",
			"voor",
			"after",
			"na",
			"sort",
			"sorteren"
		]
	});

	if (parsed.text && Array.isArray(parsed.text)) {
		parsed.text = parsed.text.join(" ");
	}

	if (!parsed || !parsed.text || parsed.text.length < 3) {
		throw new AppError("search too short");
	}

	// set the query words
	options.query = parsed.text;

	// parse nsfw
	let nsfw = ctx.query.nsfw || parsed.nsfw;
	const yes = ["true", "yes", "ja"];
	const no = ["false", "no", "nee"];
	if (nsfw && [...yes, ...no].indexOf(nsfw) !== -1) {
		if (yes.indexOf(nsfw) !== -1) {
			options.nsfw = true;
		} else if (no.indexOf(nsfw) !== -1) {
			options.nsfw = false;
		}
	}

	// parse type
	let type = [];
	if (ctx.query.type) {
		type.push(...ctx.query.type.split(",").filter(t => t && t.length > 1));
	} else if (parsed.type) {
		if (Array.isArray(parsed.type)) {
			type.push(...parsed.type);
		} else {
			type.push(parsed.type);
		}
	}
	if (type.length > 0) {
		const types = ["video", "image", "audio", "foto", "plaatje"];
		if (type.every(t => types.indexOf(t) !== -1)) {
			options.type = [...new Set(type.map(t => {
				if (t === "foto") {
					return "image";
				} else if (t === "plaatje") {
					return "image";
				}

				return t;
			}))];
		}
	}

	// parse before
	let before = ctx.query.before || parsed.before || parsed.voor;
	if (before) {
		// check for full date
		let date = moment(before, "DD-MM-YYYY");

		// check for month and year
		if (!date.isValid()) {
			date = moment(before, "MM-YYYY");
		}

		// check for only year
		if (!date.isValid()) {
			date = moment(before, "YYYY");
		}

		if (date.isValid()) {
			options.before = date;
		}
	}

	// parse after
	let after = ctx.query.after || parsed.after || parsed.na;
	if (after) {
		// check for full date
		let date = moment(after, "DD-MM-YYYY");

		// check for month and year
		if (!date.isValid()) {
			date = moment(after, "MM-YYYY");
		}

		// check for only year
		if (!date.isValid()) {
			date = moment(after, "YYYY");
		}

		if (date.isValid()) {
			options.after = date;
		}
	}

	// parse sort
	let sort = ctx.query.sort || parsed.sort || parsed.sorteren;
	if (sort) {
		let direction = "desc";
		if (sort.indexOf(">") !== -1) {
			direction = "asc";
		}

		sort = sort.replace(/\<|\>/g, "");

		if (["score", "date", "datum", "kudos", "views", "comments", "reaguursels"].indexOf(sort) !== -1) {
			if (sort === "datum") {
				sort = "date";
			} else if (sort === "reaguursels") {
				sort = "comments";
			}

			options.sort = [sort, direction];
		}
	}

	if (ctx.query.page) {
		options.page = parseInt(ctx.query.page, 10);
		if (Number.isNaN(options.page) || options.page < 0) {
			options.page = 0;
		}
	}

	// build the query
	let score;
	if (options.sort[0] === "score") {
		score = `ts_rank(p."searchable", websearch_to_tsquery('dutch_nostop', :query), 1) AS "score"`;
	}

	let where = [];
	if (options.nsfw !== null) {
		where.push(`p."nsfw" = ${options.nsfw}`);
	}

	if (options.type.length > 0 && options.type.length !== 3) {
		where.push(`((${options.type.map(t => {
			return `p."${t}Count" > 0`;
		}).join(`) OR (`)}))`);
	}

	if (options.before) {
		where.push(`p."postedAt" < :before`);
	}

	if (options.after) {
		where.push(`p."postedAt" > :after`);
	}

	where.push(`"searchable" @@ websearch_to_tsquery('dutch_nostop', :query)`);

	let orderColumn;
	let orderDirection;
	switch (options.sort[0]) {
		case "score":
			orderColumn = `"score"`;
			break;
		case "date":
			orderColumn = `p."postedAt"`;
			break;
		case "kudos":
			orderColumn = `ph."kudos"`;
			break;
		case "views":
			orderColumn = `ph."views"`;
			break;
		case "comments":
			orderColumn = `ph."comments"`;
			break;
	}
	orderDirection = options.sort[1];

	const results = await sequelize.query(`
		SELECT
			DISTINCT ON (${orderColumn}, p."id") p."id",
			COUNT(p."id") OVER() AS "fullCount",
			p."id",
			p."dumpertId",
			p."title",
			p."description",
			p."thumbnail",
			p."postedAt",
			p."nsfw",
			p."videoCount",
			p."imageCount",
			p."audioCount"${score ? `,
			${score}` : ""},
			string_agg(pt."tag", ',') AS "tags",
			ph."views",
			ph."kudos",
			ph."comments"
		FROM
			"posts" p
		LEFT JOIN
			"postTags" pt
			ON
				pt."postId" = p."id"
		LEFT JOIN
			"postHistories" ph
			ON
				ph."postId" = p."id"
		WHERE
			${where.join(" AND\n")}
		GROUP BY
			p."id",
			ph."checkedAt",
			ph."views",
			ph."kudos",
			ph."comments"
		ORDER BY
			${orderColumn} ${orderDirection},
			p."id" ASC,
			ph."checkedAt" DESC
		LIMIT 30
		OFFSET ${options.page * 30}
	`, {
		type: sequelize.QueryTypes.SELECT,
		replacements: {
			query: options.query,
			before: options.before && options.before.format("YYYY-MM-DD"),
			after: options.after && options.after.format("YYYY-MM-DD")
		}
	});

	let pages = 0;
	let total = 0;
	if (results.length > 0) {
		pages = Math.ceil(results[0].fullCount / 30);
		total = results[0].fullCount;
	}

	ctx.status = 200;
	ctx.body = {
		success: true,
		options,
		pages,
		total,
		data: results.map(row => ({
			...row,
			fullCount: undefined,
			tags: (row.tags && row.tags.split(",")) || []
		}))
	};
});

export default router;
