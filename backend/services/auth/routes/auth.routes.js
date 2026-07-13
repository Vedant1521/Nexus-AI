import express from "express";

import {
    deductCredits,
 login,
 logout,
 updatePlan
}
from "../controllers/auth.controllers.js";
import verifyInternalKey from "../middlewares/verifyInternalKey.js";

const router =
express.Router();

router.post("/login",login);
router.get("/logout",logout);
router.patch(
    "/internal/update-plan",
    verifyInternalKey,
    updatePlan
);
router.patch(
    "/internal/deduct-credits",
    verifyInternalKey,
    deductCredits
);


export default router;