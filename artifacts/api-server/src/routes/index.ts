import { Router } from "express";
import healthRouter from "./health.js";
import recordsRouter from "./records.js";
import utilsRouter from "./utils.js";
import vacationsRouter from "./vacations.js";

const router = Router();

router.use(healthRouter);
router.use(recordsRouter);
router.use(utilsRouter);
router.use(vacationsRouter);

export default router;
