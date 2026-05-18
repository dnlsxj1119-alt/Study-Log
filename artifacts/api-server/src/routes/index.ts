import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recordsRouter from "./records";
import utilsRouter from "./utils";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recordsRouter);
router.use(utilsRouter);

export default router;
