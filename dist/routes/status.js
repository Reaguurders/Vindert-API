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
const Router = require("koa-router");
const debug = require("debug");
const environment_1 = require("../environment");
const typeorm_1 = require("typeorm");
const post_entity_1 = require("../entities/post.entity");
const log = debug("app:routes:status");
const router = new Router();
router.get("/", (ctx) => __awaiter(this, void 0, void 0, function* () {
    log(`getting api status`);
    let repository = yield typeorm_1.getConnection().getRepository(post_entity_1.Post);
    let count = yield repository.count();
    ctx.status = 200;
    ctx.body = {
        success: true,
        data: {
            version: environment_1.default.getPackage().version,
            posts: {
                count
            }
        }
    };
}));
exports.default = router;
//# sourceMappingURL=status.js.map