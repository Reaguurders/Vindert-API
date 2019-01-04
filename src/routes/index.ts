import * as Router from "koa-router";

import SearchRouter from "./search";
import StatusRouter from "./status";

const router = new Router();

router.use("/search", SearchRouter.routes(), SearchRouter.allowedMethods());
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
