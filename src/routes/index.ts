import { Hono } from "hono";
import postsRouter from "./posts";
import usersRouter from "./users";
import healthRouter from "./health";

const apiRouter = new Hono();

apiRouter.route("/health", healthRouter);
apiRouter.route("/posts", postsRouter);
apiRouter.route("/users", usersRouter);

export default apiRouter;
