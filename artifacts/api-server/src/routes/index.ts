import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recordsRouter from "./records";
import utilsRouter from "./utils";
import vacationsRouter from "./vacations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(recordsRouter);
router.use(utilsRouter);
router.use(vacationsRouter);

export default router;
