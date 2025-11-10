import { Router } from "express";
import {
  login,
  signUp,
  addToHistory,
  getUserHistory,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/sign-up").post(signUp);
router.route("/add-to-activity").post(addToHistory);
router.route("/get-all-activity").get(getUserHistory);

export default router;
