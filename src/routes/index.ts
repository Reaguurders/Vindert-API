import * as Router from "koa-router";

import StatusRouter from "./status";

const router = new Router();

router.use("/status", StatusRouter.routes(), StatusRouter.allowedMethods());

router.get("/", async (ctx) => {
	ctx.status = 200;
	ctx.body = {
		success: true,
		data: {
			hello: "world"
		}
	};
});

export default router;
