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
const status_1 = require("./status");
const router = new Router();
router.use("/status", status_1.default.routes(), status_1.default.allowedMethods());
router.get("/", (ctx) => __awaiter(this, void 0, void 0, function* () {
    ctx.status = 200;
    ctx.body = {
        success: true,
        data: {
            hello: "world"
        }
    };
}));
exports.default = router;
//# sourceMappingURL=index.js.map