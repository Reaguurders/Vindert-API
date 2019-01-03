"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// initialize the application
require("reflect-metadata");
const dotenv = require("dotenv");
dotenv.config();
const environment_1 = require("./environment");
// import router from "./routes";
// import all the required modules
const debug = require("debug");
const morgan = require("koa-morgan");
const bodyParser = require("koa-body");
const helmet = require("koa-helmet");
const cors = require("@koa/cors");
const Koa = require("koa");
const routes_1 = require("./routes");
const app_error_1 = require("./errors/app.error");
// initialize the database connection
require("./core/typeorm");
const app = new Koa();
const log = debug("app:http");
log(`request log level: ${environment_1.default.config.get("http.logLevel")}`);
// error handler
app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        ctx.scope = {};
        yield next();
    }
    catch (err) {
        ctx.status = err.statusCode || 500;
        if (err instanceof app_error_1.AppError || environment_1.default.isDevelopment()) {
            ctx.body = {
                success: false,
                error: err
            };
        }
        else {
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
}));
// request logging middleware
app.use(morgan(environment_1.default.config.get("http.logLevel")));
// request time response header middleware
app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
    const start = Date.now();
    yield next();
    const ms = Date.now() - start;
    ctx.set("X-Response-Time", `${ms}ms`);
}));
// security middleware
app.use(helmet());
app.use(cors({
    origin: (ctx) => {
        const domains = environment_1.default.config.get("http.origins");
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
app.use(routes_1.default.routes());
app.use(routes_1.default.allowedMethods());
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
app.listen(environment_1.default.config.get("http.port"));
exports.default = app;
//# sourceMappingURL=index.js.map