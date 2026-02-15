import { Hono } from "hono";
import healthRouter from "./health";

const apiRouter = new Hono();

apiRouter.route("/health", healthRouter);

export default apiRouter;
