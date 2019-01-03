// initialize the application
import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import Environment from "./environment";

// import all the required modules
import * as debug from "debug";
import * as morgan from "koa-morgan";
import * as bodyParser from "koa-body";
import * as helmet from "koa-helmet";
import * as cors from "@koa/cors";

import * as Koa from "koa";
import Router from "./routes";
import { AppError } from "./errors/app.error";

// initialize the database connection
import "./core/sequelize";

const app = new Koa();
const log = debug("app:http");

declare module "koa" {
	interface Context {
		scope: {

		};
	}
}

log(`request log level: ${Environment.config.get("http.logLevel")}`);

// error handler
app.use(async (ctx, next) => {
	try {
		ctx.scope = {};
		await next();
	} catch (err) {
		ctx.status = err.statusCode || 500;
		if (err instanceof AppError || Environment.isDevelopment()) {
			ctx.body = {
				success: false,
				error: err
			};
		} else {
			ctx.body = {
				success: false,
				error: {
					message: "Internal Server Error",
					code: "internalServer"
				}
			};
		}

		ctx.app.emit("error", err, ctx);
	}
});

// request logging middleware
app.use(morgan(Environment.config.get("http.logLevel")));

// request time response header middleware
app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.set("X-Response-Time", `${ms}ms`);
});

// security middleware
app.use(helmet());
app.use(cors({
	origin: (ctx) => {
		const domains = Environment.config.get("http.origins") as string[];

		if (domains.indexOf(ctx.request.header.origin) !== -1) {
			return ctx.request.header.origin;
		}

		return domains[0];
	}
}));

// body parser middleware
app.use(bodyParser({
	text: false,
	strict: false
}));

// app routing
app.use(Router.routes());
app.use(Router.allowedMethods());

// 404 handler
app.use((ctx) => {
	ctx.status = 404;
	ctx.body = {
		success: false,
		error: {
			message: "Route not found",
			code: "notFound"
		}
	};
});

// set up the app
app.listen(Environment.config.get("http.port"));

export default app;
