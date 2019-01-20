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
		// check for date formats
		let date = moment(before, ["YYYY", "MM-YYYY", "DD-MM-YYYY"]);

		if (date.isValid()) {
			options.before = date;
		}
	}

	// parse after
	let after = ctx.query.after || parsed.after || parsed.na;
	if (after) {
		// check for date formats
		let date = moment(after, ["YYYY", "MM-YYYY", "DD-MM-YYYY"]);

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
		score = `ts_rank("searchable", websearch_to_tsquery('dutch_nostop', :query), 1) AS "score"`;
	}

	let where = [`"deletedAt" IS NULL`];
	if (options.nsfw !== null) {
		where.push(`"nsfw" = ${options.nsfw}`);
	}

	if (options.type.length > 0 && options.type.length !== 3) {
		where.push(`((${options.type.map(t => {
			return `"${t}Count" > 0`;
		}).join(`) OR (`)}))`);
	}

	if (options.before) {
		where.push(`"postedAt" < :before`);
	}

	if (options.after) {
		where.push(`"postedAt" > :after`);
	}

	where.push(`"searchable" @@ websearch_to_tsquery('dutch_nostop', :query)`);

	let orderColumn;
	let orderDirection;
	switch (options.sort[0]) {
		case "score":
			orderColumn = `"score"`;
			break;
		case "date":
			orderColumn = `"postedAt"`;
			break;
		case "kudos":
			orderColumn = `"kudos"`;
			break;
		case "views":
			orderColumn = `"views"`;
			break;
		case "comments":
			orderColumn = `"comments"`;
			break;
	}
	orderDirection = options.sort[1];

	const results = await sequelize.query(`
		SELECT
			p."id",
			p1."fullCount",
			p."dumpertId",
			p."title",
			p."description",
			p."thumbnail",
			p."nsfw",
			p."videoCount",
			p."imageCount",
			p."audioCount",
			p1."postedAt",
			p1."views",
			p1."kudos",
			p1."comments"${score ? `,
			p1."score"` : ""},
			string_agg(pt."tag", ',') AS "tags"
		FROM
			(
				SELECT
					p2.*,
					COUNT("id") OVER() AS "fullCount"
				FROM
					(
						SELECT
							DISTINCT ON("id") "id",
							"postedAt"${score ? `,
							${score}` : ""},
							ph."views",
							ph."kudos",
							ph."comments"
						FROM
							"posts"
						LEFT JOIN
							"postHistories" ph
							ON
								ph."postId" = "id"
						WHERE
							${where.join(" AND\n")}
						ORDER BY
							"id",
							ph."checkedAt" DESC
					) p2
				ORDER BY
					${orderColumn} ${orderDirection}
				LIMIT 30
				OFFSET ${options.page * 30}
			) p1
		JOIN
			"posts" p
			ON
				p."id" = p1."id"
		LEFT JOIN
			"postTags" pt
			ON
				pt."postId" = p."id"
		GROUP BY
			p."id",
			p1."fullCount",
			p1."postedAt",
			p1."views",
			p1."kudos",
			p1."comments"${score ? `,
			p1."score"` : ""}
		ORDER BY
			${orderColumn} ${orderDirection}
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
